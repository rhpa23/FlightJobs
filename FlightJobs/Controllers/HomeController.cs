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
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user != null)
            {
                var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (statistics != null)
                {
                    homeModel.Statistics = statistics;
                }
            }
            var jobList = dbContext.JobDbModels.Where(j => !j.IsDone && j.User.Id == user.Id).OrderBy(j => j.Id).ToPagedList(pageNumber ?? 1, 7);
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

        public ActionResult DeleteJob(int id)
        {
            var dbContext = new ApplicationDbContext();
            JobDbModel job = new JobDbModel() { Id = id };
            dbContext.JobDbModels.Attach(job);
            dbContext.JobDbModels.Remove(job);
            dbContext.SaveChanges();

            return RedirectToAction("Index");
        }

        public ActionResult About()
        {
            ViewBag.Message = "Version beta. This site is under construction.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "rhpa23@gmail.com.";

            return View();
        }
    }
}