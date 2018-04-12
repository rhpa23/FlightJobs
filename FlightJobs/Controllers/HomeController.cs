using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.Data.SqlClient;
using System.Data;

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
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user != null)
            {
                var jobList = dbContext.JobDbModels.Where(j => !j.IsDone && j.User.Id == user.Id);
                foreach (var job in jobList)
                {
                    job.IsActivated = (job.Id == jobId);
                }
                dbContext.SaveChanges();
            }

            return RedirectToAction("Index");
        }

        public ActionResult DeleteJob(int id)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user != null)
            {
                JobDbModel job = dbContext.JobDbModels.FirstOrDefault(j => j.Id == id && j.User.Id == user.Id);
                if (job != null)
                {
                    dbContext.JobDbModels.Remove(job);
                    dbContext.SaveChanges();
                }
            }

            return RedirectToAction("Index");
        }

        [AllowAnonymous]
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

        [AllowAnonymous]
        public PartialViewResult RenderHeader()
        {
            if (Session["HeaderStatistics"] == null)
            {
                var dbContext = new ApplicationDbContext();
                var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
                if (user != null)
                {
                    var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                    Session.Add("HeaderStatistics", statistics);
                    return PartialView("_HeaderInfo", statistics);
                }
                else
                {
                    return PartialView("_HeaderInfo", null);
                }
            }
            else
            {
                return PartialView("_HeaderInfo", Session["HeaderStatistics"]);
            }
        }

        public ActionResult GeneralInfo()
        {
            var dbContext = new ApplicationDbContext();
            var inf = new GeneralInfoViewModel()
            {
                UsersCount = dbContext.Users.Count(),
                UsersBankBalance = dbContext.StatisticsDbModels.Sum(x => x.BankBalance),
                JobsActive = dbContext.JobDbModels.Count(x => x.IsActivated),
                JobsDone = dbContext.JobDbModels.Count(x => x.IsDone),
                JobsInProgress = dbContext.JobDbModels.Count(x => x.InProgress),
            };
            
            return PartialView("GeneralInfo", inf);
        }
    }
}