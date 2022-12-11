using FlightJobs.Models;
using FlightJobs.Util;
using System;
using System.Collections.Generic;
using System.Device.Location;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace FlightJobs.Controllers
{
    public class BaseController : Controller
    {
        internal double taxEcon = 0.008; // por NM
        internal double taxFirstC = 0.012; // por NM
        internal double taxCargo = 0.0004; // por NM

        internal double taxEconGE = 0.165; // por NM
        internal double taxFirstGE = 0.175; // por NM
        internal double taxCargoGE = 0.0041; // por NM

        internal long PaxWeight = 84;

        public static string SIMBRIEF_USER_ID_COOKIE = "simbrief.id";

        public int CalcDistance(string departure, string arrival)
        {
            var departureInfo = AirportDatabaseFile.FindAirportInfo(departure);
            var arrivalInfo = AirportDatabaseFile.FindAirportInfo(arrival);
            if (departureInfo != null && arrivalInfo != null)
            {
                var departureCoord = new GeoCoordinate(departureInfo.Latitude, departureInfo.Longitude);
                var arrivalCoord = new GeoCoordinate(arrivalInfo.Latitude, arrivalInfo.Longitude);

                var distMeters = departureCoord.GetDistanceTo(arrivalCoord);
                var distMiles = (int)DataConversion.ConvertMetersToMiles(distMeters);
                return distMiles;
            }
            return 0;
        }

        public JsonResult GetMapInfo(string departure, string arrival, string alternative)
        {
            /*
            {
                "lat":53.3539,
	            "lng":-2.275,
	            "name":"MANCHESTER",
	            "icon_url":"/assets/airport-e91142e842d5da7b82cfca5c7c9ef6ad.png",
	            "icon_center_x":13,
	            "icon_center_y":13
            }*/
            var jsonList = new List<object>();
            var alternativeInfo = string.IsNullOrEmpty(alternative) ? null : AirportDatabaseFile.FindAirportInfo(alternative);
            if (!string.IsNullOrEmpty(departure) && !string.IsNullOrEmpty(arrival))
            {
                var departureInfo = AirportDatabaseFile.FindAirportInfo(departure);
                var arrivalInfo = AirportDatabaseFile.FindAirportInfo(arrival);

                var departureCoord = new GeoCoordinate(departureInfo.Latitude, departureInfo.Longitude);
                var arrivalCoord = new GeoCoordinate(arrivalInfo.Latitude, arrivalInfo.Longitude);

                var depJson = new
                {
                    isRoute = true,
                    lat = departureCoord.Latitude,
                    lng = departureCoord.Longitude,
                    name = departureInfo.Name,
                    info = "Departure airport",
                    icao = departureInfo.ICAO,
                    runway_size = departureInfo.RunwaySize + "ft",
                    elevation = departureInfo.Elevation + "ft",
                    trasition = departureInfo.Trasition + "ft",
                    icon_url = "../Content/img/departing.png",
                    icon_center_x = 13,
                    icon_center_y = 13
                };

                var arrJson = new
                {
                    isRoute = true,
                    lat = arrivalCoord.Latitude,
                    lng = arrivalCoord.Longitude,
                    name = arrivalInfo.Name,
                    info = "Arrival airport",
                    icao = arrivalInfo.ICAO,
                    runway_size = arrivalInfo.RunwaySize + "ft",
                    elevation = arrivalInfo.Elevation + "ft",
                    trasition = arrivalInfo.Trasition + "ft",
                    icon_url = "../Content/img/arrival.png",
                    icon_center_x = 13,
                    icon_center_y = 13
                };

                jsonList.Add(depJson);
                jsonList.Add(arrJson);

                if (alternativeInfo != null)
                {
                    var alternativeCoord = new GeoCoordinate(alternativeInfo.Latitude, alternativeInfo.Longitude);
                    var altJson = new
                    {
                        isRoute = true,
                        lat = alternativeCoord.Latitude,
                        lng = alternativeCoord.Longitude,
                        name = alternativeInfo.Name,
                        info = "Alternative airport",
                        icao = alternativeInfo.ICAO,
                        runway_size = alternativeInfo.RunwaySize + "ft",
                        elevation = alternativeInfo.Elevation + "ft",
                        trasition = alternativeInfo.Trasition + "ft",
                        icon_url = "../Content/img/alternative.png",
                        icon_center_x = 13,
                        icon_center_y = 13
                    };
                    jsonList.Add(altJson);
                }
            }

            var userJobsSessionKey = "USER_JOBS_ICAOS";
            var userJobsIcaos = new List<string>();
            if (Session[userJobsSessionKey] != null)
            {
                userJobsIcaos = (List<string>)Session[userJobsSessionKey];
            }
            else
            {
                using (var dbContext = new ApplicationDbContext())
                {
                    var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
                    if (user != null)
                    {
                        TimeSpan t = new TimeSpan();
                        var allUserJobs = FilterJobs(user, null, ref t);
                        userJobsIcaos = allUserJobs.Select(x => x.DepartureICAO).ToList();
                        userJobsIcaos.AddRange(allUserJobs.Select(x => x.ArrivalICAO));
                        Session.Add(userJobsSessionKey, userJobsIcaos.Distinct().ToList());
                    }
                }
            }
            foreach (var icao in userJobsIcaos.Distinct())
            {
                var favDptInfo = AirportDatabaseFile.FindAirportInfo(icao);
                var favDptCoord = new GeoCoordinate(favDptInfo.Latitude, favDptInfo.Longitude);
                var favDptAirport = new
                {
                    isRoute = false,
                    lat = favDptCoord.Latitude,
                    lng = favDptCoord.Longitude,
                    name = favDptInfo.Name,
                    info = icao,
                    icao = icao,
                    runway_size = favDptInfo.RunwaySize + "ft",
                    elevation = favDptInfo.Elevation + "ft",
                    trasition = favDptInfo.Trasition + "ft",
                    icon_url = "../Content/img/favorite.png",
                    icon_center_x = 8,
                    icon_center_y = 8
                };
                jsonList.Add(favDptAirport);
            }

            return Json(jsonList, JsonRequestBehavior.AllowGet);
        }

        internal int GetAviationTypeId(string aviationType)
        {
            switch (aviationType)
            {
                case "GeneralAviation":
                    return 1;
                case "AirTransport":
                    return 2;
                case "HeavyAirTransport":
                    return 3;
                case "Cargo":
                    return 4;
                default:
                    return 0;
            }
        }

        internal IList<JobListModel> GenerateBoardJobs(JobSerachModel model, StatisticsDbModel statistics)
        {
            IList<JobListModel> listBoardJobs = new List<JobListModel>();

            try
            {
                var weightUnit = GetWeightUnit(Request);
                var dep = AirportDatabaseFile.FindAirportInfo(model.Departure);
                var arrival = AirportDatabaseFile.FindAirportInfo(model.Arrival);

                var depCoord = new GeoCoordinate(dep.Latitude, dep.Longitude);
                var randomPob = new Random();
                var randomCargo = new Random();
                int id = 0;
                bool validGaProfit = false;

                var arrCoord = new GeoCoordinate(arrival.Latitude, arrival.Longitude);
                var distMeters = depCoord.GetDistanceTo(arrCoord);
                var distMiles = (int)DataConversion.ConvertMetersToMiles(distMeters);

                //                    if (distMiles >= model.MinRange && distMiles <= model.MaxRange && arrival.ICAO.ToUpper() != dep.ICAO.ToUpper() &&
                //                        arrival.ICAO.ToUpper() == model.Arrival.ToUpper())

                if (arrival.ICAO.ToUpper() != dep.ICAO.ToUpper() &&
                    arrival.ICAO.ToUpper() == model.Arrival.ToUpper())
                {
                    var customCapacity = model.CustomPlaneCapacity;

                    if (GetWeightUnit(Request) == DataConversion.UnitPounds)
                    {
                        customCapacity.CustomCargoCapacityWeight = DataConversion.ConvertPoundsToKilograms(customCapacity.CustomCargoCapacityWeight);
                    }

                    int index = randomPob.Next(14, 25);
                    if (model.AviationType == "GeneralAviation")
                        validGaProfit = customCapacity.CustomCargoCapacityWeight < 3000 && customCapacity.CustomPassengerCapacity < 30;

                    long gePobCount = 0, auxCargoCount = 0;

                    for (int i = 0; i < index; i++)
                    {
                        long pob = 0;
                        long cargo = 0;
                        long profit = 0;
                        bool isFisrtClass = Convert.ToBoolean(randomPob.Next(2));

                        var flightType = model.AviationType.Trim();
                        int alternateCargo = randomPob.Next(2);
                        bool isCargo = alternateCargo == 0 || flightType == "Cargo";
                        if (isCargo)
                        {
                            int minCargo = 5;
                            int maxCargo = 160;
                            if (flightType == "AirTransport") { minCargo = 0; maxCargo = 3000; };
                            if (flightType == "Cargo") { minCargo = 10; maxCargo = 3500; }
                            if (flightType == "HeavyAirTransport") { minCargo = 0; maxCargo = 6000; }

                            var cargoCapacity = customCapacity.CustomCargoCapacityWeight;
                            if (cargoCapacity < minCargo) cargoCapacity = minCargo + 1;
                            cargo = randomCargo.Next(minCargo, cargoCapacity);

                            if (auxCargoCount + cargo > cargoCapacity)
                            {
                                cargo = cargoCapacity - auxCargoCount;
                                auxCargoCount = cargoCapacity;
                            }
                            else
                            {
                                auxCargoCount += cargo;
                            }
                            
                            if (cargo == 0) continue;

                            if (flightType == "GeneralAviation")
                            {
                                if (validGaProfit)
                                {
                                    profit = Convert.ToInt32(taxCargoGE * distMiles * cargo);
                                    profit += (140 / customCapacity.CustomCargoCapacityWeight);
                                }
                                else
                                {
                                    profit = Convert.ToInt32(taxCargo * distMiles * cargo);
                                }
                            }
                            else if (flightType == "AirTransport")
                            {
                                profit = Convert.ToInt32(taxCargo * distMiles * cargo);
                            }
                            else if (flightType == "Cargo")
                            {
                                profit = Convert.ToInt32((taxCargo + 0.0005) * distMiles * cargo);
                            }
                            else // HeavyAirTransport
                            {
                                profit = Convert.ToInt32(taxCargo * distMiles * cargo);
                            }
                        }
                        else
                        {
                            int minPob = 1;
                            int maxPob = 12;
                            if (flightType == "AirTransport") { minPob = 10; maxPob = 80; };
                            if (flightType == "HeavyAirTransport") { minPob = 50; maxPob = 140; }

                            if (customCapacity.CustomPassengerCapacity < minPob) customCapacity.CustomPassengerCapacity = minPob + 1;
                            pob = randomPob.Next(minPob, customCapacity.CustomPassengerCapacity);
                            if (gePobCount + pob > customCapacity.CustomPassengerCapacity)
                            {
                                pob = customCapacity.CustomPassengerCapacity - gePobCount;
                                if (pob == 0) continue;
                                gePobCount = customCapacity.CustomPassengerCapacity;
                            }
                            else
                            {
                                gePobCount += pob;
                            }


                            if (flightType == "GeneralAviation")
                            {
                                isFisrtClass = true; /// Always premium for GA
                                if (validGaProfit)
                                {
                                    profit = Convert.ToInt32(taxFirstGE * distMiles * pob);
                                    profit += ((distMiles * 2) / customCapacity.CustomPassengerCapacity);
                                }
                                else
                                {
                                    profit = Convert.ToInt32(taxFirstC * distMiles * pob);
                                }
                            }
                            else if (flightType == "AirTransport")
                            {
                                profit = isFisrtClass ? Convert.ToInt32(taxFirstC * distMiles * pob) : Convert.ToInt32(taxEcon * distMiles * pob);
                            }
                            else // HeavyAirTransport
                            {
                                profit = isFisrtClass ? Convert.ToInt32(taxFirstC * distMiles * pob) : Convert.ToInt32(taxEcon * distMiles * pob);
                            }
                        }

                        cargo = GetWeight(Request, cargo, statistics);

                        listBoardJobs.Add(new JobListModel()
                        {
                            Id = id++,
                            Departure = dep,
                            Arrival = arrival,
                            Dist = distMiles,
                            Pax = pob,
                            Cargo = cargo,
                            PayloadLabel = (isCargo) ? "[Cargo] " : (isFisrtClass) ? "[Full price] " : "[Promo] ",
                            PayloadView = (isCargo) ? cargo + weightUnit : (isFisrtClass) ? pob + " Pax" : pob + " Pax",
                            Pay = profit,
                            FirstClass = isFisrtClass,
                            AviationType = model.AviationType,
                            IsCargo = isCargo
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("error", ex.Message);
            }

            return listBoardJobs.OrderBy(j => j.Arrival).ThenBy(x => x.PayloadLabel).ToList();
        }

        internal StatisticsDbModel GetAllStatisticsInfo(ApplicationUser user, HomeViewModel filterModel)
        {
            var dbContext = new ApplicationDbContext();
            var statistics = new StatisticsDbModel();

            if (user != null)
            {
                TimeSpan span = new TimeSpan();
                var allUserJobs = FilterJobs(user, filterModel, ref span);

                statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (statistics != null)
                {
                    if (statistics.Airline != null)
                    {
                        var statisticsAirline = dbContext.StatisticsDbModels.Where(s => s.Airline != null && s.Airline.Id == statistics.Airline.Id);
                        statistics.AirlinePilotsHired = statisticsAirline.ToList();

                        statistics.Airline.AlowEdit = statistics.Airline.UserId == user.Id;
                        statistics.Airline.HiredFBOs = dbContext.AirlineFbo.Where(x => x.Airline.Id == statistics.Airline.Id).ToList();
                    }

                    statistics.NumberFlights = allUserJobs.Count();
                    statistics.FlightTimeTotal = String.Format("{0}h {1}m", (int)span.TotalHours, span.Minutes);
                    //statistics.PayloadTotal = DataConversion.GetWeight(Request, payloadTotal) + DataConversion.GetWeightUnit(Request);

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
                }
            }
            return statistics;
        }

        internal List<JobDbModel> FilterJobs(ApplicationUser user, HomeViewModel filterModel, ref TimeSpan span)
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
            var statitics = GetWebUserStatistics();
            foreach (var j in allUserJobs.ToList())
            {
                span += (j.EndTime - j.StartTime);
                j.PayloadDisplay = GetWeight(Request, j.Payload, statitics);
                j.Cargo = GetWeight(Request, j.Cargo, statitics);
                j.UsedFuelWeightDisplay = GetWeight(Request, j.UsedFuelWeight, statitics);
            }

            return allUserJobs.ToList();
        }

        internal KeyValuePair<string, string> GetGraduationInfo(TimeSpan flightTimeSpan)
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

        internal ChartViewModel ChartProfile(ApplicationUser user)
        {
            var dbContext = new ApplicationDbContext();
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

            return chartModel;
        }

        internal string GetPilotDescription(StatisticsDbModel statistics, ApplicationDbContext dbContext)
        {
            var stBuilder = new StringBuilder();
            var listOverdue = dbContext.PilotLicenseExpensesUser.Include("PilotLicenseExpense").Where(e =>
                                                            e.MaturityDate < DateTime.Now &&
                                                            e.User.Id == statistics.User.Id).ToList();
            if (listOverdue.Count() > 0)
            {
                stBuilder.Append(string.Format("<hr />"));
                stBuilder.Append(string.Format(@"<div class='col-md-1'><img src='/Content/img/alert-002.png' style='width: 20px; height: 20px;' /></div>"));
                stBuilder.Append(string.Format(@"<div class='col-md-10' style='margin-left:10px;'>"));
                stBuilder.Append(string.Format("<h5><strong>"));
                stBuilder.Append(string.Format("  YOUR PILOT LICENSE EXPIRED. "));
                stBuilder.Append(string.Format("</strong></h5>"));
                stBuilder.Append(string.Format("There are {0} license(s) requirements overdue. ", listOverdue.Count()));
                stBuilder.Append(string.Format("The next Jobs will not score and paid until you renew your license. "));
                stBuilder.Append(string.Format("Click here to check your license requirements."));
                stBuilder.Append(string.Format(@"</div>"));

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

            return stBuilder.ToString();
        }

        internal int GetUserActiveChallenges(ApplicationUser user, ApplicationDbContext dbContext)
        {
            return dbContext.JobDbModels.Count(j => j.IsChallenge && 
                                              !j.IsDone && 
                                               j.ChallengeCreatorUserId == user.Id && 
                                               j.ChallengeExpirationDate > DateTime.Now);
        }

        internal bool UserAlreadyAssignedChallenge(ApplicationUser user, ApplicationDbContext dbContext)
        {
            return dbContext.JobDbModels.Any(j =>
                        j.User.Id == user.Id &&
                        !j.IsDone &&
                        j.IsChallenge &&
                        j.ChallengeExpirationDate >= DateTime.Now
                );
        }

        public string GetWeightUnit(HttpRequestBase httpRequest, string userId = null)
        {
            var dbContext = new ApplicationDbContext();
            var returnUnit = DataConversion.UnitKilograms;

            ApplicationUser user;
            if (userId == null)
            {
                user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            }
            else
            {
                user = dbContext.Users.FirstOrDefault(u => u.Id == userId);
            }
            if (user.Email != AccountController.GuestEmail)
            {
                var uStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (string.IsNullOrEmpty(uStatistics.WeightUnit))
                {
                    if (httpRequest != null && httpRequest.Cookies[DataConversion.WeightUnitCookie] != null &&
                        httpRequest.Cookies[DataConversion.WeightUnitCookie].Value != null)
                    {
                        if (httpRequest.Cookies[DataConversion.WeightUnitCookie].Value == DataConversion.WeightPounds)
                        {
                            uStatistics.WeightUnit = DataConversion.WeightPounds;
                            returnUnit = DataConversion.UnitPounds;
                        }
                        else
                        {
                            uStatistics.WeightUnit = DataConversion.WeightKilograms;
                            returnUnit = DataConversion.UnitKilograms;
                        }
                        dbContext.SaveChanges();
                    }
                }
                else
                {
                    returnUnit = uStatistics.WeightUnit == DataConversion.WeightPounds ? DataConversion.UnitPounds : DataConversion.UnitKilograms;
                }
            }

            return returnUnit;
        }

        internal long GetWeight(HttpRequestBase httpRequest, long kgWeight, StatisticsDbModel userStatistics)
        {

            var dbContext = new ApplicationDbContext();
            long convertedValue = kgWeight;

            if (string.IsNullOrEmpty(userStatistics.WeightUnit))
            {
                if (httpRequest != null && httpRequest.Cookies[DataConversion.WeightUnitCookie] != null &&
                    httpRequest.Cookies[DataConversion.WeightUnitCookie].Value != null)
                {
                    if (httpRequest.Cookies[DataConversion.WeightUnitCookie].Value == DataConversion.WeightPounds)
                    {
                        userStatistics.WeightUnit = DataConversion.WeightPounds;
                        convertedValue = DataConversion.ConvertKilogramsToPounds(kgWeight);
                    }
                    else
                    {
                        userStatistics.WeightUnit = DataConversion.WeightKilograms;
                    }
                    dbContext.SaveChanges();
                }
            }
            else
            {
                convertedValue = userStatistics.WeightUnit == DataConversion.WeightPounds ? 
                                     DataConversion.ConvertKilogramsToPounds(kgWeight) : kgWeight;
            }

            return convertedValue;
        }

        internal StatisticsDbModel GetWebUserStatistics()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            return dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
        }

        internal StatisticsDbModel GetUserStatistics(string userIdStr)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Id == userIdStr);
            return dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
        }

        internal List<SelectListItem> GetUserCustomCapacity(string userId)
        {
            var dbContext = new ApplicationDbContext();
            return dbContext.CustomPlaneCapacity.Where(x => x.User.Id == userId).Select(c =>
                                                                new SelectListItem
                                                                {
                                                                    Text = c.CustomNameCapacity,
                                                                    Value = c.Id.ToString(),
                                                                }).OrderBy(x => x.Text).ToList();
        }
    }
}