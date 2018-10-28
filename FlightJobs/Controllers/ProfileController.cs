using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.IO;
using Chart.Mvc.ComplexChart;
using System.Text;
using FlightJobs.Util;
using System.Text.RegularExpressions;

namespace FlightJobs.Controllers
{
    public class ProfileController : Controller
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

        private IPagedList<JobDbModel> GetSortedJobs(List<JobDbModel> listJobs, string sortOrder, string CurrentSort, int? pageNumber, ApplicationUser user)
        {
            int pageSize = 5;
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

        private List<JobDbModel> FilterJobs(ApplicationUser user, HomeViewModel filterModel)
        {
            var dbContext = new ApplicationDbContext();
            var allUserJobs = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id);
            if (filterModel != null)
            {
                if (!string.IsNullOrEmpty(filterModel.DepartureFilter))
                {
                    allUserJobs = allUserJobs.Where(j => j.DepartureICAO.Contains(filterModel.DepartureFilter));
                }

                if (!string.IsNullOrEmpty(filterModel.ArrivalFilter))
                {
                    allUserJobs = allUserJobs.Where(j => j.ArrivalICAO.Contains(filterModel.ArrivalFilter));
                }

                if (!string.IsNullOrEmpty(filterModel.ModelDescriptionFilter))
                {
                    allUserJobs = allUserJobs.Where(j => j.ModelDescription.Contains(filterModel.ModelDescriptionFilter));
                }

            }

            return allUserJobs.ToList();
        }

        private HomeViewModel SearchProfileInfo(string sortOrder, string CurrentSort, int? pageNumber, HomeViewModel filterModel)
        {
            sortOrder = String.IsNullOrEmpty(sortOrder) ? "Date" : sortOrder;

            var homeModel = new HomeViewModel();
            var dbContext = new ApplicationDbContext();

            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null)
            {
                var allUserJobs = FilterJobs(user, filterModel);

                var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (statistics != null)
                {
                    if (statistics.Airline != null)
                    {
                        var statisticsAirline = dbContext.StatisticsDbModels.Where(s => s.Airline != null && s.Airline.Id == statistics.Airline.Id);
                        statistics.AirlinePilotsHired = statisticsAirline.Select(s => s.User).ToList();

                        statistics.Airline.AlowEdit = statistics.Airline.UserId == user.Id;
                    }

                    TimeSpan span = new TimeSpan();
                    long payloadTotal = 0;

                    allUserJobs.ToList().ForEach(j => {
                        span += (j.EndTime - j.StartTime);
                        payloadTotal += j.Payload;
                        j.PayloadDisplay = DataConversion.GetWeight(Request, j.Payload);
                        j.Cargo = DataConversion.GetWeight(Request, j.Cargo);
                        j.UsedFuelWeightDisplay = DataConversion.GetWeight(Request, j.UsedFuelWeight);
                    });

                    statistics.NumberFlights = allUserJobs.Count();
                    statistics.FlightTimeTotal = String.Format("{0}h {1}m", (int)span.TotalHours, span.Minutes);
                    statistics.PayloadTotal = DataConversion.GetWeight(Request, payloadTotal) + DataConversion.GetWeightUnit(Request);

                    var grad = GetGraduationInfo(span);
                    statistics.GraduationPath = grad.Value;
                    statistics.GraduationDesc = grad.Key;

                    if (allUserJobs.Count() > 0)
                    {
                        statistics.LastFlight = allUserJobs.OrderBy(j => j.EndTime).Last().EndTime;
                        statistics.LastAircraft = allUserJobs.OrderBy(j => j.EndTime).Last().ModelDescription;
                        statistics.FavoriteAirplane = allUserJobs.GroupBy(q => q.ModelDescription)
                                                                 .OrderByDescending(gp => gp.Count())
                                                                 .Select(g => g.Key).FirstOrDefault();
                    }
                    homeModel.Statistics = statistics;

                    homeModel.PilotStatisticsDescription = GetPilotDescription(statistics, dbContext);
                }
                var jobList = GetSortedJobs(allUserJobs, sortOrder, CurrentSort, pageNumber, user);
                homeModel.Jobs = jobList;
                homeModel.WeightUnit = DataConversion.GetWeightUnit(Request);

            }

            return homeModel;
        }

        private string GetPilotDescription(StatisticsDbModel statistics, ApplicationDbContext dbContext)
        {
            var stBuilder = new StringBuilder();
            var listOverdue = dbContext.PilotLicenseExpensesUser.Include(x => x.PilotLicenseExpense).Where(e =>
                                                            e.MaturityDate < DateTime.UtcNow &&
                                                            e.User.Id == statistics.User.Id).ToList();
            if (listOverdue.Count() > 0)
            {
                stBuilder.Append(string.Format(@"<h5><img src='/Content/img/Alert001.gif' style='width: 30px; height: 30px;'/>"));
                stBuilder.Append(string.Format("<strong>"));
                stBuilder.Append(string.Format("  Hi captain {0}, your pilot license is expired. ", statistics.User.UserName));
                stBuilder.Append(string.Format("</strong></h5><hr />"));
                stBuilder.Append(string.Format("There are {0} license(s) requirements overdue. ", listOverdue.Count()));
                stBuilder.Append(string.Format("The next Jobs will not score and paid until you renew your license. "));
                stBuilder.Append(string.Format("Click on License button to check your license requirements."));
                foreach (var expenseOverdue in listOverdue.Where(o => !o.OverdueProcessed))
                {
                    var list = dbContext.LicenseItemUser.Where(x => x.User.Id == statistics.User.Id &&
                                                               x.PilotLicenseItem.PilotLicenseExpense.Id == expenseOverdue.PilotLicenseExpense.Id);
                    foreach (var item in list.ToList())
                    {
                        item.IsBought = false;
                    }
                    expenseOverdue.OverdueProcessed = true;
                }
                dbContext.SaveChanges();
            }
            else
            {
                stBuilder.Append(string.Format("<h5><strong>"));
                stBuilder.Append(string.Format("Hi captain {0}. ", statistics.User.UserName));
                stBuilder.Append(string.Format("</strong></h5><hr />"));
                stBuilder.Append(string.Format("Your pilot license is up to date. "));
                stBuilder.Append(string.Format("Keep an eye on your license requirements maturity dates. "));
                stBuilder.Append(string.Format("Click on License button to check your license requirements."));
            }

            return stBuilder.ToString();
        }

        public ActionResult ChartProfile()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var tempDate = DateTime.Now.AddMonths(-6);
            var dateFilter = new DateTime(tempDate.Year, tempDate.Month, 1);
            var userJobs = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id && j.StartTime > dateFilter).ToList();

            var chartModel = new ChartViewModel() { Data = new Dictionary<string, double>() };

            foreach (var job in userJobs)
            {
                if (!chartModel.Data.Keys.Contains(job.Month))
                {
                    chartModel.Data.Add(job.Month, job.Pay);
                }
                else
                {
                    chartModel.Data[job.Month] += job.Pay;
                }

                chartModel.PayamentTotal += job.Pay;
            }

            if (chartModel.Data.Count > 0)
            {
                chartModel.PayamentMonthGoal = chartModel.Data.Values.Max() + 1000;
            }

            return PartialView("ChartProfile", chartModel);
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

            foreach (var item in pgList)
            {
                item.Job.PayloadDisplay = DataConversion.GetWeight(Request, item.Job.Payload);
                item.Job.StartFuelWeightDisplay = DataConversion.GetWeight(Request, item.Job.StartFuelWeight);
                item.Job.UsedFuelWeightDisplay = DataConversion.GetWeight(Request, item.Job.UsedFuelWeight);
                item.WeightUnit = DataConversion.GetWeightUnit(Request);
                var departureFbo = dbContext.AirlineFbo.FirstOrDefault(x => x.Airline.Id == item.Airline.Id && x.Icao == item.Job.DepartureICAO);
                item.CalcAirlineJob(departureFbo);
            }

            return PartialView("AirlineLedgerView", pgList);
        }

        private KeyValuePair<string, string> GetGraduationInfo(TimeSpan flightTimeSpan)
        {
            string path = "/Content/img/graduation/";
            var hours = (int)flightTimeSpan.TotalHours;

            if (Enumerable.Range(0, 39).Contains(hours))
                return new KeyValuePair<string, string>("Junior Flight Officer", string.Concat(path, "02.png"));

            if (Enumerable.Range(40, 40).Contains(hours))
                return new KeyValuePair<string, string>("Flight Officer", string.Concat(path, "03.png"));

            if (Enumerable.Range(80, 80).Contains(hours))
                return new KeyValuePair<string, string>("First Officer", string.Concat(path, "04.png"));

            if (Enumerable.Range(160, 90).Contains(hours))
                return new KeyValuePair<string, string>("Captain", string.Concat(path, "05.png"));

            if (Enumerable.Range(250, 110).Contains(hours))
                return new KeyValuePair<string, string>("Senior Captain", string.Concat(path, "06.png"));

            if (Enumerable.Range(360, 70).Contains(hours))
                return new KeyValuePair<string, string>("Commercial First Officer", string.Concat(path, "07.png"));

            if (Enumerable.Range(430, 110).Contains(hours))
                return new KeyValuePair<string, string>("Commercial Captain", string.Concat(path, "08.png"));

            if (Enumerable.Range(540, 210).Contains(hours))
                return new KeyValuePair<string, string>("Commercial Senior Captain", string.Concat(path, "09.png"));

            if (Enumerable.Range(750, 250).Contains(hours))
                return new KeyValuePair<string, string>("Commercial Commander", string.Concat(path, "10.png"));

            if (Enumerable.Range(1000, 500).Contains(hours))
                return new KeyValuePair<string, string>("Commercial Senior Commander", string.Concat(path, "11.png"));

            if (Enumerable.Range(1500, 500).Contains(hours))
                return new KeyValuePair<string, string>("ATP First Officer", string.Concat(path, "12.png"));

            if (Enumerable.Range(2000, 1000).Contains(hours))
                return new KeyValuePair<string, string>("ATP Captain", string.Concat(path, "13.png"));

            if (Enumerable.Range(3000, 1000).Contains(hours))
                return new KeyValuePair<string, string>("ATP Senior Captain", string.Concat(path, "14.png"));

            if (Enumerable.Range(4000, 1000).Contains(hours))
                return new KeyValuePair<string, string>("ATP Commander", string.Concat(path, "15.png"));

            if (hours >= 5000)
                return new KeyValuePair<string, string>("ATP Senior Commander", string.Concat(path, "16.png"));

            return new KeyValuePair<string, string>("Junior Flight Officer", string.Concat(path, "02.png"));
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

        public ActionResult PilotLicenseProfile()
        {
            var dbContext = new ApplicationDbContext();
            InsertUserPilotLicense(dbContext);

            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);

            var list = dbContext.PilotLicenseExpensesUser.Include(x => x.PilotLicenseExpense).Where(p => p.User.Id == user.Id);

            return PartialView("PilotLicenseView", list.ToList());
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

                    expenseUser.MaturityDate = DateTime.UtcNow.AddDays(expenseUser.PilotLicenseExpense.DaysMaturity);
                    expenseUser.OverdueProcessed = false;
                }
                dbContext.SaveChanges();

                return Json(string.Format("{0:C}", uStatistics.BankBalance), JsonRequestBehavior.AllowGet);
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
                        MaturityDate = DateTime.UtcNow.AddDays(expense.DaysMaturity)
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
            if (fboInDB.Count() > 5)
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
                Availability = 5 - countFbosInDB,
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

                        job.VideoUrl = videoUrl;
                        job.VideoDescription = description;
                        dbContext.SaveChanges();
                        ViewBag.ResponseMessage = "Video data saved and shared in Airline Ledger table.";
                        return PartialView("JobVideoView", job);
                    }
                    else
                    {
                        ViewBag.ResponseError = "Invalid video URL.";
                        return PartialView("JobVideoView", job);
                    }
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

        private string ExtractYoutubeCode(Uri uri)
        {
            var query = HttpUtility.ParseQueryString(uri.Query);
            return query["v"];
        }
    }
}