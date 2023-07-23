using FlightJobs.Models;
using FlightJobs.Util;
using System;
using System.Collections.Generic;
using System.Device.Location;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity.Owin;
using System.Net.Http;
using System.Net.Http.Headers;
using FlightJobs.DTOs;

namespace FlightJobs.Controllers
{
    public class SearchJobsController : BaseController
    {
        private ApplicationUserManager _userManager;

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }


        // GET: SearchJobs
        public ActionResult Index()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            var model = new JobSerachModel()
            {
                MaxRange = 450,
                MinRange = 10,
                WeightUnit = GetWeightUnit(Request)
            };

            Session.Remove("JobSearchResult");
            if (Session["JobSerachModel"] != null)
            {
                model = (JobSerachModel)Session["JobSerachModel"];
                model.WeightUnit = GetWeightUnit(Request);
            }

            if (statistics != null)
            {
                if (statistics.CustomPlaneCapacity != null)
                    statistics.CustomPlaneCapacity.ImagePath = GetCustomCapacityPath(statistics.CustomPlaneCapacity.CustomNameCapacity);
                model.CustomPlaneCapacity = statistics.CustomPlaneCapacity;
                
                
                model.CustomPlaneCapacityList = GetUserCustomCapacity(user.Id);
            }

            return View(model);

        }

        private string GetCustomCapacityPath(string customNameCapacity)
        {
            string path = "/Content/img/planes/{0}";
            if (customNameCapacity.ToLower().Contains("320"))
                return string.Format(path, "A320.JPG");

            if (customNameCapacity.ToLower().Contains("crj"))
                return string.Format(path, "CRJ.JPG");

            if (customNameCapacity.ToLower().Contains("citation"))
                return string.Format(path, "Citation.JPG");
            

            //if (customNameCapacity.ToLower().Contains("319"))
            //    return string.Format(path, "A319.JPG");

            //if (customNameCapacity.ToLower().Contains("321"))
            //    return string.Format(path, "A321.JPG");

            //if (customNameCapacity.ToLower().Contains("330"))
            //    return string.Format(path, "A330.JPG");

            //if (customNameCapacity.ToLower().Contains("350"))
            //    return string.Format(path, "A350.JPG");

            //if (customNameCapacity.ToLower().Contains("767"))
            //    return string.Format(path, "B767.JPG");

            //if (customNameCapacity.ToLower().Contains("Cessna"))
            //    return string.Format(path, "Cessna.JPG");

            //if (customNameCapacity.ToLower().Contains("737") || customNameCapacity.ToLower().Contains("738"))
            //    return string.Format(path, "B738.JPG");

            if (customNameCapacity.ToLower().Contains("787"))
                return string.Format(path, "B787.JPG");

            return string.Format(path, "default.jpg");
        }

        [HttpPost]
        public ActionResult Index(JobSerachModel modelParam)
        {
            Session.Add("JobSerachModel", modelParam);
            var userStatistics = GetWebUserStatistics();

            if (userStatistics.CustomPlaneCapacity != null)
            {
                TempData["PassengersWeight"] = GetWeight(Request, userStatistics.CustomPlaneCapacity.CustomPaxWeight, userStatistics);
            }

            TempData["PassengersWeightUnit"] = GetWeightUnit(Request);

            if (modelParam != null)
            {
                IList<JobListModel> jobs = new List<JobListModel>();
                jobs = GenerateBoardJobs(modelParam, userStatistics);
                Session.Add("JobSearchResult", jobs);

                return PartialView("Result", jobs.OrderBy(x => x.Dist).ToPagedList(1, 100));
            }
            else
            {
                return View("Index");
            }
        }

        [HttpPost]
        public JsonResult ResultNext(FormCollection form)
        {
            var ids = new List<int>();
            var pageSelsIds = form["sels"];
            var userStatistics = GetWebUserStatistics();

            PaxWeight = userStatistics.CustomPlaneCapacity != null ? userStatistics.CustomPlaneCapacity.CustomPaxWeight : 84;
            
            if (pageSelsIds != null)
            {
                string[] sList = pageSelsIds.ToString().Split(',');
                foreach (var idString in sList)
                {
                    ids.Add(Convert.ToInt32(idString));
                }
            }

            long totalPax = 0;
            long totalCargo = 0;
            long totalPay = 0;

            var list = new Dictionary<string, JobDbModel>();
            var jobs = (IList<JobListModel>)Session["JobSearchResult"];
            if (jobs != null)
            {
                foreach (var job in jobs.Where(j => j.Selected || ids.Contains(j.Id)))
                {
                    JobDbModel jobDB;
                    if (!list.ContainsKey(job.Arrival.ICAO))
                    {
                        jobDB = new JobDbModel()
                        {
                            DepartureICAO = job.Departure.ICAO,
                            ArrivalICAO = job.Arrival.ICAO,
                            Dist = job.Dist,
                            Pax = job.Pax,
                            Cargo = job.Cargo,
                            Pay = job.Pay,
                            FirstClass = job.FirstClass,
                            AviationType = GetAviationTypeId(job.AviationType)
                        };

                        list.Add(job.Arrival.ICAO, jobDB);
                    }
                    else
                    {
                        jobDB = list[job.Arrival.ICAO];

                        jobDB.Pax += job.Pax;
                        jobDB.Cargo += job.Cargo;
                        jobDB.Pay += job.Pay;
                    }
                    totalPax += job.Pax;
                    totalCargo += job.Cargo;
                    totalPay += job.Pay;
                }
            }

            var jobList = list.Values.ToList();

            //var viewModel = new ConfirmJobsViewModel()
            //{
            //    JobsList = jobList,
            //    TotalPax = totalPax,
            //    TotalCargo = totalCargo,
            //    TotalPay = string.Format("F{0:C}", totalPay),
            //    TotalPayload = string.Format("{0:G}", (totalPax * PaxWeight) + totalCargo)
            //};


            return Confirm(jobList.FirstOrDefault(), userStatistics.User.Id);
        }

        public void Confirm(JobTO job)
        {
            var jobModel = new JobDbModel()
                {
                    DepartureICAO = job.DepartureICAO,
                    ArrivalICAO = job.ArrivalICAO,
                    AlternativeICAO = job.AlternativeICAO,
                    Dist = job.Dist,
                    Pax = job.Pax,
                    Cargo = job.Cargo,
                    Pay = job.Pay,
                    AviationType = GetAviationTypeId(job.AviationType)
                };
            
            Confirm(jobModel, job.UserId);
        }

        public JsonResult Confirm(JobDbModel selJob, string userId)
        {
            var dbContext = new ApplicationDbContext();

            // Check GUEST
            var user = dbContext.Users.FirstOrDefault(u => u.Id == userId);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                return Json("Guest can't save!!!", JsonRequestBehavior.AllowGet); ;
            }

            if (selJob != null)
            {
                var userStatistics = GetUserStatistics(userId);
                PaxWeight = userStatistics.CustomPlaneCapacity != null ? userStatistics.CustomPlaneCapacity.CustomPaxWeight : 84;

                selJob.User = user;
                selJob.StartTime = DateTime.Now;
                selJob.EndTime = DateTime.Now;
                selJob.ChallengeExpirationDate = DateTime.Now.AddDays(-1);
                selJob.PaxWeight = (int)PaxWeight;

                if (userStatistics.WeightUnit == DataConversion.UnitPounds)
                {
                    selJob.Cargo = DataConversion.ConvertPoundsToKilograms(selJob.Cargo);
                }

                if (Session != null && Session["JobSerachModel"] != null)
                {
                    JobSerachModel searchModel = (JobSerachModel)Session["JobSerachModel"];
                    if (!string.IsNullOrEmpty(searchModel.Alternative) && searchModel.Alternative.Length == 4)
                    {
                        selJob.AlternativeICAO = searchModel.Alternative.ToUpper();
                    }
                }

                dbContext.JobDbModels.Add(selJob);
                
                dbContext.SaveChanges();

                // Activate the inserted job.
                var userJobList = dbContext.JobDbModels.Where(j => !j.IsDone && j.User.Id == user.Id && !j.IsChallenge).ToList();
                userJobList.ForEach(x => {
                    x.IsActivated = x.Id == selJob.Id;
                });
                dbContext.SaveChanges();
            }

            return Json("Saved", JsonRequestBehavior.AllowGet); ;
        }

        public IList<SearchJobTipsViewModel> SearchAlternativeTips(string arrival, int range)
        {
            var listTips = new List<SearchJobTipsViewModel>();

            if (!string.IsNullOrEmpty(arrival) && arrival.Length > 2)
            {
                var destinationInfo = AirportDatabaseFile.FindAirportInfo(arrival);
                if (destinationInfo == null) return null;

                var destCoord = new GeoCoordinate(destinationInfo.Latitude, destinationInfo.Longitude);

                foreach (var airportInfo in AirportDatabaseFile.GetAllAirportInfo().OrderByDescending(x => x.RunwaySize))
                {
                    if (airportInfo.ICAO.ToUpper() != arrival.ToUpper())
                    {
                        var airportInfoCoord = new GeoCoordinate(airportInfo.Latitude, airportInfo.Longitude);
                        var distMeters = destCoord.GetDistanceTo(airportInfoCoord);
                        var distMiles = (int)DataConversion.ConvertMetersToMiles(distMeters);

                        if (distMiles < range)
                        {
                            var viewModel = new SearchJobTipsViewModel()
                            {
                                AirportICAO = airportInfo.ICAO,
                                AirportName = airportInfo.Name,
                                Distance = distMiles,
                                AirportElevation = airportInfo.Elevation,
                                AirportRunwaySize = airportInfo.RunwaySize,
                                AirportTrasition = airportInfo.Trasition,
                            };
                            listTips.Add(viewModel);
                        }
                    }
                }
            }
            else
            {
                return null;
            }
            return listTips;
        }
        public ActionResult AlternativeTips(string destination, int range)
        {
            TempData["RangeValue"] = range;
            return PartialView("AlternativeTipsPartialView", SearchAlternativeTips(destination, range));
        }

        internal IList<SearchJobTipsViewModel> SearchJobTipsViewModels(string departure, string userId)
        {
            var listTips = new List<SearchJobTipsViewModel>();

            if (!string.IsNullOrEmpty(departure) && departure.Length > 2)
            {
                /*  Get destinations from current departure user jobs */
                var departureInfo = AirportDatabaseFile.FindAirportInfo(departure);
                if (departureInfo == null) return null;

                var departureCoord = new GeoCoordinate(departureInfo.Latitude, departureInfo.Longitude);
                var dbContext = new ApplicationDbContext();
                var user = dbContext.Users.FirstOrDefault(u => u.Id == userId);
                var allUserJobs = FilterJobs(user, "");
                var filteredUserJobs = FilterJobs(user, departure);
                foreach (var job in filteredUserJobs)
                {
                    var jobAirportInfo = AirportDatabaseFile.FindAirportInfo(job.ArrivalICAO);
                    listTips.Add(new SearchJobTipsViewModel()
                    {
                        IdJob = job.Id,
                        AirportICAO = job.ArrivalICAO,
                        Cargo = job.Cargo,
                        Pax = job.Pax,
                        Pay = job.Pay,
                        Payload = job.Payload,
                        AirportName = jobAirportInfo.Name,
                        AirportElevation = jobAirportInfo.Elevation,
                        AirportRunwaySize = jobAirportInfo.RunwaySize,
                        AirportTrasition = jobAirportInfo.Trasition,
                        Distance = job.Dist
                    });
                }

                var countRandon = new Random();
                var indexRandon = new Random();

                if (allUserJobs.Count() > 1)
                {
                    var index = indexRandon.Next(1, allUserJobs.Count() - 1);

                    var count = countRandon.Next(1, allUserJobs.Count() - index);

                    /*  Get destinations from all user jobs */
                    foreach (var job in allUserJobs.GetRange(index, count).Take(7))
                    {
                        if (!listTips.Exists(x => x.AirportICAO == job.ArrivalICAO) &&
                            job.ArrivalICAO != departure)
                        {
                            var jobArrivalAirportInfo = AirportDatabaseFile.FindAirportInfo(job.ArrivalICAO);

                            var arrivalCoord = new GeoCoordinate(jobArrivalAirportInfo.Latitude, jobArrivalAirportInfo.Longitude);
                            var distMeters = departureCoord.GetDistanceTo(arrivalCoord);
                            var distMiles = (int)DataConversion.ConvertMetersToMiles(distMeters);

                            listTips.Add(new SearchJobTipsViewModel()
                            {
                                AirportICAO = job.ArrivalICAO,
                                AirportName = jobArrivalAirportInfo.Name,
                                AirportElevation = jobArrivalAirportInfo.Elevation,
                                AirportRunwaySize = jobArrivalAirportInfo.RunwaySize,
                                AirportTrasition = jobArrivalAirportInfo.Trasition,
                                Distance = distMiles
                            });
                        }
                    }
                }

                /*  Random jobs */
                var tempListTips = new List<SearchJobTipsViewModel>();
                foreach (var airportInfo in AirportDatabaseFile.GetAllAirportInfo())
                {
                    if (airportInfo.ICAO.ToUpper() != departureInfo.ICAO.ToUpper())
                    {
                        var airportInfoCoord = new GeoCoordinate(airportInfo.Latitude, airportInfo.Longitude);
                        var distMeters = departureCoord.GetDistanceTo(airportInfoCoord);
                        var distMiles = (int)DataConversion.ConvertMetersToMiles(distMeters);

                        if (distMiles < 600)
                        {
                            var viewModel = new SearchJobTipsViewModel()
                            {
                                AirportICAO = airportInfo.ICAO,
                                AirportName = airportInfo.Name,
                                Distance = distMiles,
                                AirportElevation = airportInfo.Elevation,
                                AirportRunwaySize = airportInfo.RunwaySize,
                                AirportTrasition = airportInfo.Trasition,
                            };
                            tempListTips.Add(viewModel);
                        }
                    }
                }
                var random = new Random();
                var randomListTips = new List<SearchJobTipsViewModel>();
                for (int i = tempListTips.Count - 1; i >= 1; i--)
                {
                    int other = random.Next(0, i + 1);
                    randomListTips.Add(tempListTips[other]);
                }
                listTips.AddRange(randomListTips.Take(10));
            }
            else
            {
                return null;
            }
            return listTips;
        }

        public ActionResult ArrivalTips(string departure)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            return PartialView("ArrivalTipsPartialView", SearchJobTipsViewModels(departure, user.Id));
        }

        public void ApplyCloneJob(long jobId, string userId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Id == userId);
            var job = dbContext.JobDbModels.FirstOrDefault(x => x.Id == jobId);

            var cloneJob = JobDbModel.Clone(job, user);
            var userJobs = dbContext.JobDbModels.Where(j => j.User.Id == userId && j.IsActivated);
            userJobs.ToList().ForEach(j => j.IsActivated = false);

            cloneJob.IsActivated = true;

            dbContext.JobDbModels.Add(cloneJob);
            dbContext.SaveChanges();
        }
        public ActionResult CloneJob(long jobId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            ApplyCloneJob(jobId, user.Id);

            return RedirectToAction("Index", "Home");
        }

        private List<JobDbModel> FilterJobs(ApplicationUser user, string departureICAO)
        {
            var dbContext = new ApplicationDbContext();
            var allUserJobs = dbContext.JobDbModels.Where(j => j.IsDone && j.User.Id == user.Id);
            if (!string.IsNullOrEmpty(departureICAO))
            {
                return allUserJobs.Where(j => j.DepartureICAO.Contains(departureICAO)).ToList();
            }
            else
            {
                return allUserJobs.ToList();
            }
        }

        public PartialViewResult SelectCustomCapacity(int capacityId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            return SelectCapacity(capacityId, user.Id);
        }

        private PartialViewResult SelectCapacity(long capacityId, string userId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Id == userId);
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            var searchModel = new JobSerachModel();

            var dbEntity = dbContext.CustomPlaneCapacity.FirstOrDefault(x => x.User.Id == user.Id && x.Id == capacityId);
            if (dbEntity != null)
            {
                statistics.CustomPlaneCapacity = dbEntity;
                searchModel.CustomPlaneCapacity = dbEntity;
                dbContext.SaveChanges();
            }
            searchModel.CustomPlaneCapacityList = GetUserCustomCapacity(user.Id); 

            return PartialView("CapacityListView", searchModel);
        }

        public void RemoveCapacity(CapacityTO capacity)
        {
            RemoveCapacity(capacity.Id, capacity.UserId);
        }
        public PartialViewResult RemoveCapacity(int capacityId, string userId)
        {
            var dbContext = new ApplicationDbContext();
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == userId);
            var searchModel = new JobSerachModel();

            var dbEntity = dbContext.CustomPlaneCapacity.FirstOrDefault(x => x.User.Id == userId && x.Id == capacityId);
            if (dbEntity != null)
            {
                dbContext.CustomPlaneCapacity.Remove(dbEntity);
                statistics.CustomPlaneCapacity = null;
                searchModel.CustomPlaneCapacity = null;
                dbContext.SaveChanges();
            }
            searchModel.CustomPlaneCapacityList = GetUserCustomCapacity(userId);

            return PartialView("CapacityListView", searchModel);
        }

        public PartialViewResult RemoveCustomCapacity(int capacityId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            return RemoveCapacity(capacityId, user.Id);
        }

        public void SaveCapacity(CapacityTO capacity)
        {
            SaveCapacity(capacity.CustomPassengerCapacity,
                               capacity.CustomCargoCapacityWeight,
                               capacity.CustomNameCapacity,
                               capacity.CustomPaxWeight,
                               capacity.UserId,
                               capacity.ImagePath);
        }
        // SearchJobs/SaveCustomCapacity?passengers=158&cargo=2500&name=A320+CEO+Fenix+MSFS+158pax&paxWeight=88 
        public PartialViewResult SaveCustomCapacity(int passengers, int cargo, string name, long paxWeight)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            return SaveCapacity(passengers, cargo, name, paxWeight, user.Id);
        }

        public PartialViewResult SaveCapacity(int passengers, int cargo, string name, long paxWeight, string userId, string imagePath = null)
        {
            var dbContext = new ApplicationDbContext();
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == userId);
            var searchModel = new JobSerachModel();

            if (!string.IsNullOrEmpty(name) && cargo > 0 && passengers > 0 && statistics != null)
            {
                var dbEntity = dbContext.CustomPlaneCapacity.FirstOrDefault(x => x.User.Id == userId && x.CustomNameCapacity.ToLower() == name.ToLower());
                if (dbEntity == null)
                {
                    var customCapacity = new CustomPlaneCapacityDbModel()
                    {
                        CustomCargoCapacityWeight = cargo,
                        CustomPassengerCapacity = passengers,
                        CustomNameCapacity = name.Trim(),
                        CustomPaxWeight = paxWeight,
                        ImagePath = imagePath,
                        User = statistics.User
                    };
                    dbContext.CustomPlaneCapacity.Add(customCapacity);
                    statistics.CustomPlaneCapacity = customCapacity;
                    searchModel.CustomPlaneCapacity = customCapacity;
                }
                else
                {
                    dbEntity.CustomCargoCapacityWeight = cargo;
                    dbEntity.CustomPassengerCapacity = passengers;
                    dbEntity.CustomPaxWeight = paxWeight;
                    statistics.CustomPlaneCapacity = dbEntity;
                    searchModel.CustomPlaneCapacity = dbEntity;
                    if (imagePath != null) dbEntity.ImagePath = imagePath;
                }
                dbContext.SaveChanges();
            }
            searchModel.CustomPlaneCapacityList = GetUserCustomCapacity(userId); 
            return PartialView("CapacityListView", searchModel);
        }

        public JsonResult GetCustonCapacity(long id)
        {
            var dbContext = new ApplicationDbContext();

            var customPlaneCapacity = dbContext.CustomPlaneCapacity.FirstOrDefault(x => x.Id == id);
            if (customPlaneCapacity != null)
            {
                customPlaneCapacity.ImagePath = GetCustomCapacityPath(customPlaneCapacity.CustomNameCapacity);
                return Json(customPlaneCapacity, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return null;
            }
        }

        public JsonResult RandomFlight(string departure, string destination)
        {
            var dbContext = new ApplicationDbContext();
            var query = dbContext.JobDbModels.AsQueryable();
            var departureFilter = departure?.Length == 4;
            var destinationFilter = destination?.Length == 4;

            if (!departureFilter || !destinationFilter)
            {
                if (departureFilter)
                {
                    query = query.Where(x => x.DepartureICAO == departure);
                }
                else if (destinationFilter)
                {
                    query = query.Where(x => x.ArrivalICAO == destination);
                }
            }
            
            var jobCount = query.Count();
            int index = new Random().Next(jobCount);
            var randomJob = query.OrderBy(x => x.Id).Skip(index).FirstOrDefault();
            return Json(randomJob != null ? randomJob : new JobDbModel(), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> SimbriefLoadAsync(string simbriefId)
        {
            var url = $"https://www.simbrief.com/api/xml.fetcher.php?username={simbriefId}&json=1";

            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(url);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpResponseMessage response = await client.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    string jsondata = await response.Content.ReadAsStringAsync();
                    return Json(jsondata, "application/json", JsonRequestBehavior.AllowGet);
                }
                return Json("", JsonRequestBehavior.AllowGet);
            }
        }

        public IList<JobListModel> GenerateJobs(JobSearchTO jobSearch)
        {
            var dbContext = new ApplicationDbContext();
            var userStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == jobSearch.userId);
            var searchParams = new JobSerachModel()
            {
                Departure = jobSearch.Departure,
                Arrival = jobSearch.Arrival,
                Alternative = jobSearch.Alternative,
                AviationType = jobSearch.AviationType,
                CustomPlaneCapacity = jobSearch.CustomPlaneCapacity
            };

            SelectCapacity(jobSearch.CustomPlaneCapacity.Id, userStatistics.User.Id);
            return GenerateBoardJobs(searchParams, userStatistics); 
        }

        //private async string SimbriefLoadAsync(string simbriefId)
        //{

        //}
    }
}
