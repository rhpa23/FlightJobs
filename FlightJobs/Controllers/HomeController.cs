using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.Data.SqlClient;
using System.Data;
using FlightJobs.Util;

namespace FlightJobs.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(int? pageNumber)
        {
            var homeModel = new HomeViewModel();
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null)
            {
                var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (statistics != null)
                {
                    homeModel.Statistics = statistics;
                }
            }
            var jobList = dbContext.JobDbModels.Where(j => !j.IsDone && j.User.Id == user.Id).OrderBy(j => j.Id).ToPagedList(pageNumber ?? 1, 4);
            var listOverdue = dbContext.PilotLicenseExpensesUser.Where(e =>
                                                            e.MaturityDate < DateTime.UtcNow &&
                                                            e.User.Id == user.Id).ToList();
            TempData["PilotMessage"] = (listOverdue.Count() > 0) ? "License is expired" : null;
            homeModel.Jobs = jobList;
            return View(homeModel);
        }


        public ActionResult ActivateJob(int? jobId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
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
            // Check GUEST
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);

            if (user != null)
            {
                if (user.Email == AccountController.GuestEmail)
                {
                    TempData["GuestMessage"] = AccountController.GuestMessage;
                    return RedirectToAction("Register", "Account");
                }

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

        
        public PartialViewResult NickName()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user != null && string.Equals(user.Email, user.UserName))
            {
                var regUserView = new RegisterViewModel();
                regUserView.Email = user.Email;

                return PartialView("_NickName", regUserView);
            }
            else
            {
                return null;
            }
        }

        public PartialViewResult NickNameForce()
        {
            var regUserView = new RegisterViewModel();
            return PartialView("_NickName", regUserView);
        }

        [AllowAnonymous]
        public PartialViewResult RenderHeader()
        {
            if (Session["HeaderStatistics"] == null)
            {
                var dbContext = new ApplicationDbContext();
                var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
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

        public ActionResult Analysis()
        {
            var dbContext = new ApplicationDbContext();
            

            var inf = new GeneralInfoViewModel()
            {
                UsersCount = dbContext.Users.Count(),
                UsersBankBalance = dbContext.StatisticsDbModels.Sum(x => x.BankBalance),
                JobsActive = dbContext.JobDbModels.Count(x => x.IsActivated),
                JobsDone = dbContext.JobDbModels.Count(x => x.IsDone),
                JobsInProgress = dbContext.JobDbModels.Count(x => x.InProgress),
                ModelRanking = GetModelRanking(dbContext),
                UsersRankingScore = GetUsersRankingScore(dbContext),
                AviationTypeRanking = GetAviationTypeRanking(dbContext),
                DepartureRanking = GetDepartureRanking(dbContext),
                DestinationRanking = GetArrivalRanking(dbContext),
                AirlineRankingScore = GetAirlineRankingScore(dbContext),
                AirlinesChart = GetAirlinesChart(dbContext)
            };

            return View("Analysis", inf);
            //return PartialView("GeneralInfo", inf);
        }

        private Dictionary<string, long> GetModelRanking(ApplicationDbContext dbContext)
        {
            var jobsDone = dbContext.JobDbModels.Where(j => j.IsDone);
            var s = jobsDone.GroupBy(q => q.ModelDescription)
                            .OrderByDescending(gp => gp.Count())
                            .Select(g => g.Key)
                            .Take(10).ToList();
            var dic = new Dictionary<string, long>();
            int count = 1;
            s.ForEach(x => dic.Add(count++ + " - " + x, jobsDone.Count(j => j.ModelDescription == x)));
            return dic;
        }

        private Dictionary<string, long> GetUsersRankingScore(ApplicationDbContext dbContext)
        {
            var s = dbContext.StatisticsDbModels.OrderByDescending(u => u.PilotScore).Take(5).ToList();
            var dic = new Dictionary<string, long>();
            s.ForEach(x => dic.Add(x.User.UserName, x.PilotScore));
            return dic;
        }

        private Dictionary<string, long> GetAviationTypeRanking(ApplicationDbContext dbContext)
        {
            var jobs = dbContext.JobDbModels.Where(u => u.IsDone && u.StartTime > new DateTime(2018, 6, 1));                                        ;
            var dic = new Dictionary<string, long>();
            dic.Add("General aviation", jobs.Where(j => j.AviationType == 1).Count());
            dic.Add("Air transport", jobs.Where(j => j.AviationType == 2).Count());
            dic.Add("Heavy", jobs.Where(j => j.AviationType == 3).Count());
            dic.Add("Cargo", jobs.Where(j => j.AviationType == 4).Count());
            
            return dic;
        }

        private Dictionary<string, long> GetDepartureRanking(ApplicationDbContext dbContext)
        {
            var jobsDone = dbContext.JobDbModels.Where(j => j.IsDone);
            var s = jobsDone.GroupBy(q => q.DepartureICAO)
                            .OrderByDescending(gp => gp.Count())
                            .Select(g => g.Key)
                            .Take(10).ToList();
            var dic = new Dictionary<string, long>();
            s.ForEach(x => dic.Add(x + " - " + AirportDatabaseFile.FindAirportInfo(x).Name, jobsDone.Count(j => j.DepartureICAO == x)));
            return dic;
        }

        private Dictionary<string, long> GetArrivalRanking(ApplicationDbContext dbContext)
        {
            var jobsDone = dbContext.JobDbModels.Where(j => j.IsDone);
            var s = jobsDone.GroupBy(q => q.ArrivalICAO)
                            .OrderByDescending(gp => gp.Count())
                            .Select(g => g.Key)
                            .Take(10).ToList();
            var dic = new Dictionary<string, long>();
            s.ForEach(x => dic.Add(x + " - " + AirportDatabaseFile.FindAirportInfo(x).Name, jobsDone.Count(j => j.ArrivalICAO == x)));
            return dic;
        }

        private Dictionary<string, long> GetAirlineRankingScore(ApplicationDbContext dbContext)
        {
            var airlineList = dbContext.AirlineDbModels.OrderByDescending(gp => gp.AirlineScore)
                                                    .Take(10).ToList();
            var dic = new Dictionary<string, long>();
            int count = 1;
            airlineList.ForEach(x => dic.Add(count++ + " - " + x.Name, x.AirlineScore));
            return dic;
        }

        private Dictionary<string, double> GetAirlinesChart(ApplicationDbContext dbContext)
        {
            var dic = new Dictionary<string, double>();
            var jobAirlineList = dbContext.JobAirlineDbModels.GroupBy(q => q.Airline.Id)
                                                             .OrderByDescending(gp => gp.Count())
                                                             .Select(g => g)
                                                             .Take(10).ToList();
            jobAirlineList.ForEach(x => dic.Add(x.FirstOrDefault().Airline.Name, x.Count()));

            return dic.OrderBy(x=>x.Key).ToDictionary(k => k.Key, v => v.Value);
        }
    }
}