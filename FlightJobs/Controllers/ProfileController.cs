using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.IO;
using System.Text;
using FlightJobs.Util;
using System.Text.RegularExpressions;
using System.Net;
using Microsoft.AspNet.Identity;
using System.Threading.Tasks;

namespace FlightJobs.Controllers
{
    public class ProfileController : BaseController
    {
        // GET: Profile
        public ActionResult Index(string sortOrder, string CurrentSort, int? pageNumber)
        {
            HomeViewModel filterModel = null;
            if (Session["ProfileFilterModel"] != null)
            {
                filterModel = (HomeViewModel)Session["ProfileFilterModel"];
            }

            var homeModel = SearchProfileInfo(sortOrder, CurrentSort, pageNumber, filterModel);

            return View(homeModel);
        }

        public ActionResult Delete(int id)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                TempData["GuestMessage"] = AccountController.GuestMessage;
                return RedirectToAction("Register", "Account");
            }

            JobDbModel job = new JobDbModel() { Id = id };
            if (job.User?.Id == user.Id)
            {
                dbContext.JobDbModels.Attach(job);
                dbContext.JobDbModels.Remove(job);
                dbContext.SaveChanges();
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        public string Upload(IEnumerable<HttpPostedFileBase> FilesInput)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                return "{ Erro:" + AccountController.GuestMessage + "}";
            }

            if (Request.Files.Count > 0)
            {
                var file = Request.Files[0];

                if (file != null && file.ContentLength > 0)
                {
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

        internal IPagedList<JobDbModel> GetSortedJobs(List<JobDbModel> listJobs, string sortOrder, string CurrentSort, int? pageNumber)
        {
            int pageSize = 20;
            IPagedList<JobDbModel> jobSortedList = null;
            switch (sortOrder)
            {
                case "Date":
                    if (sortOrder.Equals(CurrentSort))
                        jobSortedList = listJobs.OrderBy(j => j.EndTime).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        ViewBag.CurrentSort = sortOrder;
                        jobSortedList = listJobs.OrderByDescending(j => j.EndTime).ToPagedList(pageNumber ?? 1, pageSize);
                    }
                    break;
                case "DepartureICAO":
                    if (sortOrder.Equals(CurrentSort))
                        jobSortedList = listJobs.OrderBy(j => j.DepartureICAO).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobSortedList = listJobs.OrderByDescending(j => j.DepartureICAO).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "ArrivalICAO":
                    if (sortOrder.Equals(CurrentSort))
                        jobSortedList = listJobs.OrderBy(j => j.ArrivalICAO).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobSortedList = listJobs.OrderByDescending(j => j.ArrivalICAO).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Model":
                    if (sortOrder.Equals(CurrentSort))
                        jobSortedList = listJobs.OrderBy(j => j.ModelDescription).ThenBy(j => j.ModelName).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobSortedList = listJobs.OrderByDescending(j => j.ModelDescription).ThenBy(j => j.ModelName).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Distance":
                    if (sortOrder.Equals(CurrentSort))
                        jobSortedList = listJobs.OrderBy(j => j.Dist).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobSortedList = listJobs.OrderByDescending(j => j.Dist).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Pax":
                    if (sortOrder.Equals(CurrentSort))
                        jobSortedList = listJobs.OrderBy(j => j.Pax).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobSortedList = listJobs.OrderByDescending(j => j.Pax).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Cargo":
                    if (sortOrder.Equals(CurrentSort))
                        jobSortedList = listJobs.OrderBy(j => j.Cargo).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobSortedList = listJobs.OrderByDescending(j => j.Cargo).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
                case "Pay":
                    if (sortOrder.Equals(CurrentSort))
                        jobSortedList = listJobs.OrderBy(j => j.Pay).ToPagedList(pageNumber ?? 1, pageSize);
                    else
                    {
                        jobSortedList = listJobs.OrderByDescending(j => j.Pay).ToPagedList(pageNumber ?? 1, pageSize);
                        ViewBag.CurrentSort = sortOrder;
                    }
                    break;
            }
            return jobSortedList;
        }

        [HttpPost]
        public ActionResult SearchProfile(HomeViewModel filterModel)
        {
            Session.Add("ProfileFilterModel", filterModel);
            var homeModel = SearchProfileInfo("", "Date", 1, filterModel);
            return View("Index", homeModel);
        }

        public ActionResult RemoveFilter()
        {
            Session.Remove("ProfileFilterModel");
            return RedirectToAction("Index");
        }

        

        private HomeViewModel SearchProfileInfo(string sortOrder, string CurrentSort, int? pageNumber, HomeViewModel filterModel)
        {
            sortOrder = String.IsNullOrEmpty(sortOrder) ? "Date" : sortOrder;

            var homeModel = new HomeViewModel();
            var dbContext = new ApplicationDbContext();

            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null)
            {
                //var statistics = GetAllStatisticsInfo(user, filterModel);

                //if (statistics != null)
                //{
                //    homeModel.Statistics = statistics;

                //    homeModel.PilotStatisticsDescription = GetPilotDescription(statistics, dbContext);
                //}
                TimeSpan t = new TimeSpan();
                var allUserJobs = FilterJobs(user, filterModel, ref t);
                var jobList = GetSortedJobs(allUserJobs, sortOrder, CurrentSort, pageNumber);
                homeModel.Jobs = jobList;
                homeModel.WeightUnit = GetWeightUnit(Request);

            }

            return homeModel;
        }

        

        public ActionResult RankingProfile()
        {
            var dbContext = new ApplicationDbContext();
            var listAirlines = dbContext.AirlineDbModels.OrderByDescending(a => a.AirlineScore).Take(3);

            var list = listAirlines.ToList();
            return PartialView("Ranking", list);
        }

        public ActionResult LedgerProfile(int airlineId, int page = 1)
        {
            var dbContext = new ApplicationDbContext();
            var airlineJobs = dbContext.JobAirlineDbModels.Where(j => j.Job.IsDone &&
                                                                 j.Airline.Id == airlineId).OrderByDescending(o => o.Id).ToList();

            return GetAirlineLedgerView(airlineJobs, page);
        }

        public ActionResult FilterLedger(int airlineId, string departure, string arrival)
        {
            var dbContext = new ApplicationDbContext();
            var airlineJobs = dbContext.JobAirlineDbModels.Where(j => j.Job.IsDone &&
                                                                      j.Airline.Id == airlineId);
            if (!string.IsNullOrEmpty(departure) && departure.Length == 4)
            {
                airlineJobs = airlineJobs.Where(j => j.Job.DepartureICAO == departure);
            }

            if (!string.IsNullOrEmpty(arrival) && arrival.Length == 4)
            {
                airlineJobs = airlineJobs.Where(j => j.Job.ArrivalICAO == arrival);
            }

            return GetAirlineLedgerView(airlineJobs.OrderByDescending(o => o.Id).ToList(), 1);
        }

        private ActionResult GetAirlineLedgerView(List<JobAirlineDbModel> airlineJobs, int page)
        {
            var dbContext = new ApplicationDbContext();
            int pageSize = 6;

            var pgList = airlineJobs.ToPagedList<JobAirlineDbModel>(page, pageSize);

            var userStatistics = GetWebUserStatistics();
            var weightUnit = GetWeightUnit(Request); 
            foreach (var item in pgList)
            {
                item.Job.PayloadDisplay = GetWeight(Request, item.Job.Payload, userStatistics);
                item.Job.StartFuelWeightDisplay = GetWeight(Request, item.Job.StartFuelWeight, userStatistics);
                item.Job.UsedFuelWeightDisplay = GetWeight(Request, item.Job.UsedFuelWeight, userStatistics);
                item.WeightUnit = weightUnit;
                var departureFbo = dbContext.AirlineFbo.FirstOrDefault(x => x.Airline.Id == item.Airline.Id && x.Icao == item.Job.DepartureICAO);
                item.CalcAirlineJob(departureFbo);
            }

            return PartialView("AirlineLedgerView", pgList);
        }

        

        public ActionResult PilotLicenseProfile()
        {
            var dbContext = new ApplicationDbContext();
            InsertUserPilotLicense(dbContext);

            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);

            var list = dbContext.PilotLicenseExpensesUser.Include(x => x.PilotLicenseExpense).Where(p => p.User.Id == user.Id);

            return PartialView("PilotLicenseView", list.ToList());
        }

        public ActionResult PilotTransferProfile()
        {
            var dbContext = new ApplicationDbContext();

            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var uStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            if (uStatistics.Airline == null)
            {
                var msg = $"You need to sign a contract with an airline to transfer funds.";
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, msg);
            }
            if (uStatistics.BankBalance <= 0)
            {
                var msg = $"Insufficient balance to make a transfer. Your current bank balance is: {string.Format("F{0:C}", uStatistics.BankBalance)}";
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, msg);
            }

            var pilotTransfer = new PilotTransferViewModel()
            {
                PilotTransferPercent = 10,
                Statistics = uStatistics
            };
            return PartialView("PilotTransferView", pilotTransfer);
        }

        

        public ActionResult SelectLicenceExpense(int licenseExpenseId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var list = dbContext.LicenseItemUser.Include(x => x.PilotLicenseItem)
                                                .Include(x => x.PilotLicenseItem.PilotLicenseExpense)
                                                .Where(p => p.PilotLicenseItem.PilotLicenseExpense.Id == licenseExpenseId && p.User.Id == user.Id);

            return PartialView("PilotLicenseItemView", list.ToList());
        }

        public JsonResult BuyLicenceItem(int licenseItemId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                return Json(null, JsonRequestBehavior.AllowGet);
            }
            var uStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);

            var item = dbContext.LicenseItemUser.Include(x => x.PilotLicenseItem).Include(x => x.PilotLicenseItem.PilotLicenseExpense)
                                                 .FirstOrDefault(i => i.PilotLicenseItem.Id == licenseItemId && !i.IsBought && i.User.Id == user.Id);
            if (item != null)
            {
                item.IsBought = true;
                uStatistics.BankBalance -= item.PilotLicenseItem.Price;
                uStatistics.LicenseWarningSent = false;
                Session["HeaderStatistics"] = null;

                var auxList = dbContext.LicenseItemUser.Where(i =>
                                                              i.User.Id == user.Id &&
                                                              i.PilotLicenseItem.Id != item.Id &&
                                                              i.PilotLicenseItem.PilotLicenseExpense.Id == item.PilotLicenseItem.PilotLicenseExpense.Id).ToList();

                bool notAllBought = auxList.Any(x => x.IsBought == false);
                if (!notAllBought)
                {
                    // todos comprados
                    var expenseUser = dbContext.PilotLicenseExpensesUser.Include(x => x.PilotLicenseExpense).FirstOrDefault(e =>
                                                    e.PilotLicenseExpense.Id == item.PilotLicenseItem.PilotLicenseExpense.Id &&
                                                    e.User.Id == user.Id);

                    expenseUser.MaturityDate = DateTime.Now.AddDays(expenseUser.PilotLicenseExpense.DaysMaturity);
                    expenseUser.OverdueProcessed = false;
                }
                dbContext.SaveChanges();

                return Json(string.Format("F{0:C}", uStatistics.BankBalance), JsonRequestBehavior.AllowGet);
            }
            return Json(null, JsonRequestBehavior.AllowGet);
        }

        private void InsertUserPilotLicense(ApplicationDbContext dbContext)
        {
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);

            var existItem = dbContext.LicenseItemUser.Any(i => i.User.Id == user.Id);
            if (!existItem)
            {
                foreach (var item in dbContext.PilotLicenseItem.ToList())
                {
                    var itemUser = new LicenseItemUserDbModel()
                    {
                        User = user,
                        PilotLicenseItem = item,
                        IsBought = false
                    };
                    dbContext.LicenseItemUser.Add(itemUser);
                }
            }

            var existExpense = dbContext.PilotLicenseExpensesUser.Any(i => i.User.Id == user.Id);

            if (!existExpense)
            {
                foreach (var expense in dbContext.PilotLicenseExpenses.ToList())
                {
                    var expenseUser = new PilotLicenseExpensesUserDbModel()
                    {
                        User = user,
                        PilotLicenseExpense = expense,
                        MaturityDate = DateTime.Now.AddDays(expense.DaysMaturity)
                    };
                    dbContext.PilotLicenseExpensesUser.Add(expenseUser);
                }
            }

            dbContext.SaveChanges();
        }

        public ActionResult FboProfile(int airlineId)
        {
            var dbContext = new ApplicationDbContext();

            var jobsDone = dbContext.JobDbModels.Where(j => j.IsDone);
            var topArrival = jobsDone.GroupBy(q => q.ArrivalICAO)
                            .OrderByDescending(gp => gp.Count())
                            .Select(g => g.Key)
                            .Take(8).ToList();
            var topAirports = new List<AirportModel>();
            topArrival.ForEach(x => topAirports.Add(AirportDatabaseFile.FindAirportInfo(x)));

            var test = topAirports.Select(t => t.ICAO).ToList();
            var fboInDB = dbContext.AirlineFbo.Where(x => test.Contains(x.Icao)).ToList();

            var airlineFboView = GetFboView(topAirports, fboInDB);

            var hiredFBOs = dbContext.AirlineFbo.Where(x => x.Airline.Id == airlineId).ToList();
            hiredFBOs.ForEach(x => x.Name = AirportDatabaseFile.FindAirportInfo(x.Icao).Name);
            airlineFboView.FboHired = new List<AirlineFboDbModel>();
            airlineFboView.FboHired.AddRange(hiredFBOs);
            airlineFboView.CurrentAirline = dbContext.AirlineDbModels.FirstOrDefault(x => x.Id == airlineId);
            return PartialView("AirlineFboView", airlineFboView);
        }

        private AirlineFboView GetFboView(List<AirportModel> airports, List<AirlineFboDbModel> fboInDB)
        {
            var airlineFboView = new AirlineFboView();
            airlineFboView.FboResults = new List<AirlineFboDbModel>();
            foreach (var airport in airports)
            {
                var countFbosInDB = fboInDB.Count(f => f.Icao == airport.ICAO);

                airlineFboView.FboResults.Add(GetCalcAirlineFbo(airport, countFbosInDB));
            }
            return airlineFboView;
        }

        public ActionResult FilterFboList(string icao, int airlineId)
        {
            var dbContext = new ApplicationDbContext();
            var airports = AirportDatabaseFile.GetAllAirportInfo().Where(x => x.ICAO.ToLower().StartsWith(icao.ToLower())).ToList();
            var temp = airports.Select(t => t.ICAO).ToList();
            var fboInDB = dbContext.AirlineFbo.Where(x => temp.Contains(x.Icao)).ToList();

            var airlineFboView = GetFboView(airports, fboInDB);
            airlineFboView.CurrentAirline = dbContext.AirlineDbModels.FirstOrDefault(x => x.Id == airlineId);

            return PartialView("FboResultsView", airlineFboView);
        }

        public ActionResult HireFbo(string icao)
        {
            var dbContext = new ApplicationDbContext();
            var airport = AirportDatabaseFile.FindAirportInfo(icao);
            var fboInDB = dbContext.AirlineFbo.Where(x => x.Icao == icao);
            if (fboInDB.Count() >= 15)
            {
                return Json(new { error = true, responseText = "This FBO is not available. All contracts were hired." }, JsonRequestBehavior.AllowGet);
            }
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var userStatistics = dbContext.StatisticsDbModels.FirstOrDefault(x => x.User.Id == user.Id);
            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == userStatistics.Airline.Id && a.UserId == user.Id);

            if (airline == null)
            {
                return Json(new { error = true, responseText = "You must be the owner of the airline to hire FBOs." }, JsonRequestBehavior.AllowGet);
            }
            if (fboInDB.Any(x => x.Airline.Id == airline.Id))
            {
                return Json(new { error = true, responseText = "This airline already hired the " + icao + " FBO." }, JsonRequestBehavior.AllowGet);
            }

            var airlineFbo = GetCalcAirlineFbo(airport, 0);
            airlineFbo.Airline = airline;

            if (airline.BankBalance < airlineFbo.Price)
            {
                return Json(new { error = true, responseText = "Your airline doesn't have enough money to hire this FBO." }, JsonRequestBehavior.AllowGet);
            }
            airline.BankBalance = airline.BankBalance - airlineFbo.Price;
            // debito na airline

            dbContext.AirlineFbo.Add(airlineFbo);
            dbContext.SaveChanges();

            var airlineFboView = new AirlineFboView();
            airlineFboView.FboHired = dbContext.AirlineFbo.Where(x => x.Airline.Id == airline.Id).ToList();
            airlineFboView.CurrentAirline = airline;

            return PartialView("FboAirlineView", airlineFboView);
        }

        private AirlineFboDbModel GetCalcAirlineFbo(AirportModel airport, int countFbosInDB)
        {
            return new AirlineFboDbModel()
            {
                Name = airport.Name,
                Elevation = airport.Elevation,
                RunwaySize = airport.RunwaySize,
                Icao = airport.ICAO,
                Availability = 15 - countFbosInDB,
                FuelPriceDiscount = Math.Round(airport.RunwaySize / (double)62423, 2),
                GroundCrewDiscount = Math.Round(airport.RunwaySize / (double)41093, 2),
                ScoreIncrease = airport.RunwaySize / 1123,
                Price = (airport.RunwaySize * 78)
            };
        }

        public ActionResult JobVideo(int jobId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var job = dbContext.JobDbModels.FirstOrDefault(j => j.Id == jobId);
            if (job != null && job.User?.Id == user.Id)
            {
                return PartialView("JobVideoView", job);
            }

            return PartialView("JobVideoView");
        }

        public ActionResult SaveJobVideo(int jobId, string description, string videoUrl)
        {
            var dbContext = new ApplicationDbContext();
            try
            {
                var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
                var job = dbContext.JobDbModels.FirstOrDefault(j => j.Id == jobId);
                if (job != null && job.User?.Id == user.Id)
                {
                    var uri = new Uri(videoUrl);
                    if (uri.Host == "www.youtube.com" || uri.Host == "youtu.be")
                    {
                        if (!videoUrl.Contains("embed"))
                        {
                            var code = ExtractYoutubeCode(uri);
                            videoUrl = "https://www.youtube.com/embed/" + code;
                        }
                    }

                    job.VideoUrl = videoUrl;
                    job.VideoDescription = description;
                    dbContext.SaveChanges();
                    ViewBag.ResponseMessage = "Video data saved and shared in Airline Ledger table.";
                    return PartialView("JobVideoView", job);
                }
                else
                {
                    ViewBag.ResponseError = "Job id isn't valid";
                }
            }
            catch (Exception ex)
            {
                ViewBag.ResponseError = $"Error saving job: {ex.ToString()}";
            }

            return View("Index");
        }

        public PartialViewResult AirlineBalanceInfo(int airlineId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var userStatistics = GetAllStatisticsInfo(user, null);


            return PartialView("AirlineBalanceInfoView", userStatistics);
        }

        private string ExtractYoutubeCode(Uri uri)
        {
            var query = HttpUtility.ParseQueryString(uri.Query);
            return query["v"];
        }

        public void OnChangeSendLicenseWarning(bool cked)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var userStatistics = dbContext.StatisticsDbModels.FirstOrDefault(x => x.User.Id == user.Id);
            userStatistics.SendLicenseWarning = cked;
            userStatistics.LicenseWarningSent = false;
            dbContext.SaveChanges();
        }

        public void OnChangeSendAirlineWarning(bool cked)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var userStatistics = dbContext.StatisticsDbModels.FirstOrDefault(x => x.User.Id == user.Id);
            userStatistics.SendAirlineBillsWarning = cked;
            userStatistics.AirlineBillsWarningSent = false;
            dbContext.SaveChanges();
        }

        public ActionResult EmailUnsubscribeView()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user == null || user.Email == AccountController.GuestEmail)
            {
                return RedirectToAction("Login", "Account", new { returnUrl = @Url.Action("EmailUnsubscribeView", "Profile") });
            }

            return View();
        }

        public ActionResult Unsubscribe()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var userStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);

            userStatistics.SendAirlineBillsWarning = false;
            userStatistics.SendLicenseWarning = false;
            dbContext.SaveChanges();
            TempData["ConfirmedMessage"] = "OK";
            return RedirectToAction("EmailUnsubscribeView");
        }
    }
}