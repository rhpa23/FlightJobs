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
using System.Net;
using System.Security.Policy;

namespace FlightJobs.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index(int? pageNumber)
        {
            var homeModel = new HomeViewModel();
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var statistics = GetAllStatisticsInfo(user, null); 
            if (statistics != null)
            {
                homeModel.Statistics = statistics;
                homeModel.PilotStatisticsDescription = GetPilotDescription(statistics, dbContext);
            }
            var jobList = dbContext.JobDbModels.Where(j =>
                        !j.IsDone &&
                         j.User.Id == user.Id &&
                        !j.IsChallenge
                        ).OrderBy(j => j.Id);//.ToPagedList(pageNumber ?? 1, 5);

            homeModel.Challenge = dbContext.JobDbModels.FirstOrDefault(c =>
                            !c.IsDone && c.IsChallenge && c.User.Id == user.Id &&
                            c.ChallengeExpirationDate >= DateTime.Now);
            string weightUnit = GetWeightUnit(Request);
            if (homeModel.Challenge != null)
            {
                homeModel.Challenge.WeightUnit = weightUnit;
                homeModel.Challenge.Cargo = GetWeight(Request, homeModel.Challenge.Cargo, statistics);
                homeModel.Challenge.PayloadDisplay = homeModel.Challenge.Cargo + homeModel.Challenge.PaxWeight;
            }                

            var listOverdue = dbContext.PilotLicenseExpensesUser.Where(e =>
                                                            e.MaturityDate < DateTime.Now &&
                                                            e.User.Id == user.Id).ToList();
            TempData["PilotMessage"] = (listOverdue.Count() > 0) ? "License is expired" : null;
            jobList.ToList().ForEach(delegate(JobDbModel j) {
                var cargo = GetWeight(Request, j.Cargo, statistics);
                j.PayloadDisplay = GetWeight(Request, j.Payload, statistics);
                j.Cargo = cargo;
                j.WeightUnit = weightUnit;
            });
            homeModel.Jobs = jobList.ToPagedList(pageNumber ?? 1, 5);
            homeModel.WeightUnit = weightUnit;
            ViewBag.TitleChallenge = "Pending Challenges";
            ViewBag.ChallengeCount = dbContext.JobDbModels.Where(c =>
                            !c.IsDone && c.IsChallenge &&
                            c.ChallengeExpirationDate > DateTime.Now &&
                            c.User == null).Count();
            return View(homeModel);
        }

        public PartialViewResult ActivateJob(int? jobId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var userStatistics = GetUserStatistics(user.Id);
            if (user != null)
            {
                dbContext.JobDbModels.Where(j => j.User.Id == user.Id).ToList().ForEach(x =>
                        x.IsActivated = (x.Id == jobId)
                    );

                dbContext.SaveChanges();

                var jobList = dbContext.JobDbModels.Where(j => !j.IsDone && j.User.Id == user.Id && !j.IsChallenge);

                var pagedJobList = jobList.OrderBy(j => j.Id).ToPagedList(1, 4);
                pagedJobList.ToList().ForEach(delegate (JobDbModel j) {
                    var cargo = GetWeight(Request, j.Cargo, userStatistics);
                    var paxWeight = GetWeight(Request, j.PaxWeight, userStatistics);
                    var passengesWeight = j.Pax * paxWeight;
                    j.PayloadDisplay = cargo + passengesWeight;
                    j.Cargo = cargo;
                    j.WeightUnit = GetWeightUnit(Request);
                });
                return PartialView("PendingJobsView", pagedJobList);

            }
            return PartialView("PendingJobsView");
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
            ViewBag.Message = "";

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
                DepartureRanking = GetDepartureRanking(dbContext, false),
                DestinationRanking = GetArrivalRanking(dbContext, false),
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

        private Dictionary<string, long> GetDepartureRanking(ApplicationDbContext dbContext, bool fromCurrentUser)
        {
            var jobsDone = dbContext.JobDbModels.Where(j => j.IsDone);
            if (fromCurrentUser)
            {
                var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
                if (user != null)
                {
                    jobsDone = jobsDone.Where(j => j.User.Id == user.Id);
                }
            }
            
            var s = jobsDone.GroupBy(q => q.DepartureICAO)
                            .OrderByDescending(gp => gp.Count())
                            .Select(g => g.Key)
                            .Take(10).ToList();
            var dic = new Dictionary<string, long>();
            s.ForEach(x => dic.Add(x + " - " + AirportDatabaseFile.FindAirportInfo(x).Name, jobsDone.Count(j => j.DepartureICAO == x)));
            return dic;
        }

        private Dictionary<string, long> GetArrivalRanking(ApplicationDbContext dbContext, bool fromCurrentUser)
        {
            var jobsDone = dbContext.JobDbModels.Where(j => j.IsDone);
            if (fromCurrentUser)
            {
                var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
                if (user != null)
                {
                    jobsDone = jobsDone.Where(j => j.User.Id == user.Id);
                }
            }

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

        [HttpPost]
        public JsonResult SetWeightUnit(bool pounds)
        {
            var dbContext = new ApplicationDbContext();

            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email != AccountController.GuestEmail)
            {
                var uStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                uStatistics.WeightUnit = pounds ? DataConversion.WeightPounds : DataConversion.UnitKilograms;
                dbContext.SaveChanges();
            }
            return Json("{}", JsonRequestBehavior.AllowGet);
        }

        [AllowAnonymous]
        public ActionResult Faq()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult Install()
        {
            return View();
        }

        public ActionResult PilotTransferFunds(int percent)
        {
            if (percent > 100 || percent <= 0)
            {
                var msg = $"Transfer percent out of range [1-100].";
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, msg);
            }

            var dbContext = new ApplicationDbContext();

            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var uStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            if (uStatistics.Airline == null)
            {
                var msg = $"You need to sign a contract with an airline to transfer funds.";
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, msg);
            }

            var transferBB = uStatistics.BankBalance * (percent / (double)100);
            var newPilotBalance = uStatistics.BankBalance - transferBB - (uStatistics.BankBalance * 0.15);

            if (newPilotBalance <= 0)
            {
                var msg = $"Insufficient balance to make a transfer. Your current bank balance is: {string.Format("{0:C}", uStatistics.BankBalance)}";
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, msg);
            }

            uStatistics.BankBalance = (long)newPilotBalance;
            uStatistics.Airline.BankBalance = (long)transferBB + uStatistics.Airline.BankBalance;

            dbContext.SaveChanges();

            Session["HeaderStatistics"] = null;

            return RedirectToAction("Index");
        }

        public PartialViewResult PilotGraduation()
        {
            return PartialView("~/Views/Profile/GraduationView.cshtml");
        }

        public PartialViewResult FlightsInfo()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var statistics = GetAllStatisticsInfo(user, null);
            //return PartialView("ChartProfile", chartModel);
            statistics.ChartModel = ChartProfile(user);
            statistics.DepartureRanking = GetDepartureRanking(dbContext, true);
            statistics.DestinationRanking = GetArrivalRanking(dbContext, true);
            return PartialView("~/Views/Profile/FlightInfoView.cshtml", statistics);
        }

        public ActionResult PayDebt(int id)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == id && a.UserId == user.Id);

            if (airline != null)
            {
                //          500                 200
                if (airline.DebtValue > airline.BankBalance)
                {
                    airline.DebtValue = airline.DebtValue - airline.BankBalance;
                    airline.BankBalance = 0;
                    var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                    if (airline.DebtValue > statistics.BankBalance)
                    {
                        airline.DebtValue = airline.DebtValue - statistics.BankBalance;
                        statistics.BankBalance = 0;
                    }
                    else
                    {
                        statistics.BankBalance -= airline.DebtValue;
                        airline.DebtValue = 0;
                    }
                }
                else
                {
                    airline.BankBalance -= airline.DebtValue;
                    airline.DebtValue = 0;
                }

                dbContext.SaveChanges();
            }
            else
            {
                TempData["Message"] = "You must be the owner of the airline to pay debts.";
            }
            return RedirectToAction("Index");
        }

        public ActionResult AcceptCookies()
        {
            var myCookie = new HttpCookie("CookiesAccepted", Guid.NewGuid().ToString());
            myCookie.Expires = DateTime.Now.AddYears(2); ;
            Response.SetCookie(myCookie);
            return RedirectToAction("Index");
        }
    }
}