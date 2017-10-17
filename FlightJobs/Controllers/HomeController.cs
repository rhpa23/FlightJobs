using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;

namespace FlightJobs.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(int? pageNumber)
        {
            var homeModel = new HomeViewModel();
            var dbContext = new ApplicationDbContext();
            var jobList = dbContext.JobDbModels.Where(j => !j.IsDone).OrderBy(j => j.DepartureICAO).ToPagedList(pageNumber ?? 1, 5);
            foreach (var j in jobList)
            {
                j.Payload = (j.Pax * 70) + j.Cargo;
            }
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user != null)
            {
                var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (statistics != null)
                {
                    homeModel.Statistics = statistics;
                }
            }
            homeModel.Jobs = jobList;
            return View(homeModel);
        }


        public ActionResult ActivateJob(int? jobId)
        {
            var dbContext = new ApplicationDbContext();
            var jobs = dbContext.JobDbModels.ToList();
            foreach (var job in jobs)
            {
                job.IsActivated = (job.Id == jobId);
                dbContext.SaveChanges();
            }

            return RedirectToAction("Index");
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}