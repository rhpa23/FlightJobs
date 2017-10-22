using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;

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
    }
}