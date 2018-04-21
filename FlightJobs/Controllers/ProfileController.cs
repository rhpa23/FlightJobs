using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.IO;
using Chart.Mvc.ComplexChart;

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

            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user != null)
            {
                var allUserJobs = FilterJobs(user, filterModel);

                var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (statistics != null)
                {
                    if (statistics.Airline != null)
                    {
                        var statisticsAirline = dbContext.StatisticsDbModels.Where(s => s.Airline != null && s.Airline.Id == statistics.Airline.Id);
                        statistics.AirlinePilotsHired = statisticsAirline.Count();
                    }

                    TimeSpan span = new TimeSpan();
                    long payloadTotal = 0;

                    allUserJobs.ToList().ForEach(j => span += (j.EndTime - j.StartTime));
                    allUserJobs.ToList().ForEach(j => payloadTotal += j.Payload);

                    statistics.NumberFlights = allUserJobs.Count();
                    statistics.FlightTimeTotal = String.Format("{0}h {1}m", (int)span.TotalHours, span.Minutes);
                    statistics.PayloadTotal = payloadTotal;

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
                }
                var jobList = GetSortedJobs(allUserJobs, sortOrder, CurrentSort, pageNumber, user);
                homeModel.Jobs = jobList;
            }

            return homeModel;
        }

        public ActionResult ChartProfile()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            var tempDate = DateTime.Now.AddMonths(-6);
            var dateFilter = new DateTime(tempDate.Year, tempDate.Month, 1);
            var userJobs = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id && j.StartTime > dateFilter).ToList();

            var chartModel = new ChartViewModel() { Data = new Dictionary<string, double>() };

            foreach (var job in userJobs)
            {
                if ( !chartModel.Data.Keys.Contains(job.Month))
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

        private KeyValuePair<string, string> GetGraduationInfo(TimeSpan flightTimeSpan)
        {
            string path = "/Content/img/graduation/";
            var hours = (int)flightTimeSpan.TotalHours;

            if (Enumerable.Range(0, 39).Contains(hours))
                return new KeyValuePair<string, string>("Junior Flight Officer", string.Concat(path, "02.png"));

            if (Enumerable.Range(40, 79).Contains(hours))
                return new KeyValuePair<string, string>("Flight Officer", string.Concat(path, "03.png"));

            if (Enumerable.Range(80, 159).Contains(hours))
                return new KeyValuePair<string, string>("First Officer", string.Concat(path, "04.png"));

            if (Enumerable.Range(160, 249).Contains(hours))
                return new KeyValuePair<string, string>("Captain", string.Concat(path, "05.png"));

            if (Enumerable.Range(250, 359).Contains(hours))
                return new KeyValuePair<string, string>("Senior Captain", string.Concat(path, "06.png"));

            if (Enumerable.Range(360, 429).Contains(hours))
                return new KeyValuePair<string, string>("Commercial First Officer", string.Concat(path, "07.png"));

            if (Enumerable.Range(430, 539).Contains(hours))
                return new KeyValuePair<string, string>("Commercial Captain", string.Concat(path, "08.png"));

            if (Enumerable.Range(540, 749).Contains(hours))
                return new KeyValuePair<string, string>("Commercial Senior Captain", string.Concat(path, "09.png"));

            if (Enumerable.Range(750, 999).Contains(hours))
                return new KeyValuePair<string, string>("Commercial Commander", string.Concat(path, "10.png"));

            if (Enumerable.Range(1000, 1499).Contains(hours))
                return new KeyValuePair<string, string>("Commercial Senior Commander", string.Concat(path, "11.png"));

            if (Enumerable.Range(1500, 1999).Contains(hours))
                return new KeyValuePair<string, string>("ATP First Officer", string.Concat(path, "12.png"));

            if (Enumerable.Range(2000, 2999).Contains(hours))
                return new KeyValuePair<string, string>("ATP Captain", string.Concat(path, "13.png"));

            if (Enumerable.Range(3000, 3999).Contains(hours))
                return new KeyValuePair<string, string>("ATP Senior Captain", string.Concat(path, "14.png"));

            if (Enumerable.Range(4000, 4999).Contains(hours))
                return new KeyValuePair<string, string>("ATP Commander", string.Concat(path, "15.png"));

            if (hours >= 5000)
                return new KeyValuePair<string, string>("ATP Senior Commander", string.Concat(path, "16.png"));

            return new KeyValuePair<string, string>("Junior Flight Officer", string.Concat(path, "02.png"));
        }
    }
}