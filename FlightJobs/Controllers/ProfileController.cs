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
        public ActionResult Index(string sortOrder, string CurrentSort, int? pageNumber)
        {
            sortOrder = String.IsNullOrEmpty(sortOrder) ? "Date" : sortOrder;
            

            var homeModel = new HomeViewModel();
            var dbContext = new ApplicationDbContext();
            
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user != null)
            {
                var jobList = GetSortedJobs(sortOrder, CurrentSort, pageNumber, user);
                
                var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (statistics != null)
                {
                    if (statistics.Airline != null)
                    {
                        var statisticsAirline = dbContext.StatisticsDbModels.Where(s => s.Airline != null && s.Airline.Id == statistics.Airline.Id);
                        statistics.AirlinePilotsHired = statisticsAirline.Count();
                        statisticsAirline.ToList().ForEach(a => statistics.AirlineScore += a.PilotScore);
                    }

                    TimeSpan span = new TimeSpan();
                    long payloadTotal = 0;
                    
                    jobList.ToList().ForEach(j => span += (j.EndTime - j.StartTime));
                    jobList.ToList().ForEach(j => payloadTotal += j.Payload);

                    statistics.NumberFlights = jobList.Count();
                    statistics.FlightTimeTotal = String.Format("{0:00}:{1:00}", span.Hours, span.Minutes);
                    statistics.PayloadTotal = payloadTotal;
                    if (jobList.Count() > 0)
                    {
                        statistics.LastFlight = jobList.Last().EndTime;
                        statistics.LastAircraft = jobList.Last().ModelDescription;
                        statistics.FavoriteAirplane = jobList.Max(j => j.ModelDescription);
                    }
                    homeModel.Statistics = statistics;
                }
                homeModel.Jobs = jobList;
            }
            
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

        private IPagedList<JobDbModel> GetSortedJobs(string sortOrder, string CurrentSort, int? pageNumber, ApplicationUser user)
        {
            var dbContext = new ApplicationDbContext();
            int pageSize = 5;
            IPagedList<JobDbModel> jobList = null;
            switch (sortOrder)
            {
                case "Date":
                    if (sortOrder.Equals(CurrentSort))
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderBy(j => j.EndTime).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        ViewBag.CurrentSort = sortOrder;
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderByDescending(j => j.EndTime).ToPagedList(pageNumber ?? 1, pageSize);
                    }
                    break;
                case "DepartureICAO":
                    if (sortOrder.Equals(CurrentSort))
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderBy(j => j.DepartureICAO).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderByDescending(j => j.DepartureICAO).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "ArrivalICAO":
                    if (sortOrder.Equals(CurrentSort))
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderBy(j => j.ArrivalICAO).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderByDescending(j => j.ArrivalICAO).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Model":
                    if (sortOrder.Equals(CurrentSort))
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderBy(j => j.ModelDescription).ThenBy(j => j.ModelName).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderByDescending(j => j.ModelDescription).ThenBy(j => j.ModelName).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Distance":
                    if (sortOrder.Equals(CurrentSort))
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderBy(j => j.Dist).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderByDescending(j => j.Dist).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Pax":
                    if (sortOrder.Equals(CurrentSort))
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderBy(j => j.Pax).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderByDescending(j => j.Pax).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Cargo":
                    if (sortOrder.Equals(CurrentSort))
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderBy(j => j.Cargo).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderByDescending(j => j.Cargo).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Pay":
                    if (sortOrder.Equals(CurrentSort))
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderBy(j => j.Pay).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobList = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id).OrderByDescending(j => j.Pay).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
            }
            return jobList;
        }
    }
}