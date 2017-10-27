using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.IO;

namespace FlightJobs.Controllers
{
    public class ProfileController : Controller
    {
        // GET: Profile
        public ActionResult Index(int? pageNumber)
        {
            var homeModel = new HomeViewModel();
            var dbContext = new ApplicationDbContext();
            var jobList = dbContext.JobDbModels.Where(j => j.IsDone).OrderBy(j => j.EndTime).ToPagedList(pageNumber ?? 1, 5);
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user != null)
            {
                var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (statistics != null)
                {
                    TimeSpan span = new TimeSpan();
                    long payloadTotal = 0;
                    jobList.ToList().ForEach(j => span += (j.EndTime - j.StartTime));
                    jobList.ToList().ForEach(j => payloadTotal += j.Payload);

                    statistics.NumberFlights = jobList.Count();
                    statistics.FlightTimeTotal = String.Format("{0:00}:{1:00}", span.Hours, span.Minutes);
                    statistics.PayloadTotal = payloadTotal;
                    statistics.LastFlight = jobList.Last().EndTime;
                    statistics.LastAircraft = jobList.Last().ModelDescription;
                    statistics.FavoriteAirplane = jobList.Max(j => j.ModelDescription);
                    homeModel.Statistics = statistics;
                }
            }
            homeModel.Jobs = jobList;
            return View(homeModel);
        }

        public ActionResult Delete(int id)
        {
            var dbContext = new ApplicationDbContext();
            JobDbModel job = new JobDbModel() { Id = id };
            dbContext.JobDbModels.Attach(job);
            dbContext.JobDbModels.Remove(job);
            dbContext.SaveChanges();

            return RedirectToAction("Index");
        }

        [HttpPost]
        public string Upload(IEnumerable<HttpPostedFileBase> FilesInput)
        {
            if (Request.Files.Count > 0)
            {
                var file = Request.Files[0];

                if (file != null && file.ContentLength > 0)
                {
                    var dbContext = new ApplicationDbContext();
                    var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
                    var fileName = Path.GetFileName(user.Id + Path.GetExtension(file.FileName));

                    var path = Path.Combine(Server.MapPath("~/Content/img/avatar/"), fileName);
                    file.SaveAs(path);
                    var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                    statistics.Logo = "/Content/img/avatar/" + fileName;
                    dbContext.SaveChanges();
                }
            }

            return "{}";
            //return RedirectToAction("Index");
        }
    }
}