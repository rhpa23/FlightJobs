using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.AspNet.Identity;
using System.Web;
using System.Web.Mvc;
using System.Threading.Tasks;
using FlightJobs.Models;
using System.Globalization;
using FlightJobs.Util;
using Elmah;
using Newtonsoft.Json;

namespace FlightJobs.Controllers
{
    public class JobApiController : ApiController
    {

        private const string CHALLENGE_EXPIRED = "Unfortunately, this Challenge is expired. Take another one.";

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> StartJob()
        {
            var response = Request.CreateResponse(HttpStatusCode.BadRequest, "Server error");

            try
            {
                string icaoStr = Request.Headers.GetValues("ICAO").First();
                string payloadStr = Request.Headers.GetValues("Payload").First();
                string usarIdStr = Request.Headers.GetValues("UserId").First().Replace("\"", "");
                string fuelWeightStr = Request.Headers.GetValues("FuelWeight").First();

                var dbContext = new ApplicationDbContext();
                JobDbModel job = null;
                if (icaoStr.Length == 3)
                {
                    job = dbContext.JobDbModels.FirstOrDefault(j => j.User.Id == usarIdStr &&
                                                                    j.IsActivated &&
                                                                    j.DepartureICAO.Substring(1).ToLower() == icaoStr.ToLower());
                }
                else
                {
                    job = dbContext.JobDbModels.FirstOrDefault(j => j.User.Id == usarIdStr &&
                                                                    j.IsActivated &&
                                                                    j.DepartureICAO.ToLower() == icaoStr.ToLower());
                }

                if (job == null)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "You don't have any job activated for this location.");
                }

                if (job.IsChallenge && job.ChallengeExpirationDate > DateTime.UtcNow)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, CHALLENGE_EXPIRED);
                }

                // Check GUEST
                if (job.User != null && job.User.Email == AccountController.GuestEmail)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, AccountController.GuestMessage);
                }

                long payload = Convert.ToInt64(Math.Round(Convert.ToDouble(payloadStr, new CultureInfo("en-US")))); 
                // Check payload
                if (payload >= (job.Payload + 150) || payload <= (job.Payload - 150))
                {
                    var payloadInPounds = DataConversion.ConvertKilogramsToPounds(job.Payload);
                    return Request.CreateResponse(HttpStatusCode.Forbidden, $"Wrong. Active job payload is: {job.Payload}kg / {payloadInPounds}lbs");
                }

                long fuelWeight = Convert.ToInt64(Math.Round(Convert.ToDouble(fuelWeightStr, new CultureInfo("en-US"))));
                job.StartFuelWeight = fuelWeight;

                job.InProgress = true;
                job.StartTime = DateTime.UtcNow;
                dbContext.SaveChanges();

                var licenseOverdue = IsLicenseOverdue(dbContext, job.User.Id);
                var resultMsg = "Job to " + job.ArrivalICAO + " started at: " + job.StartTime.ToShortTimeString() + " (UTC)";
                if (licenseOverdue)
                {
                    resultMsg = "Job started. Warn: Your pilot license is expired. Check profile page.";
                }

                response = Request.CreateResponse(HttpStatusCode.OK, resultMsg);
                response.Headers.Add("arrival-icao", job.ArrivalICAO);
            }
            catch (Exception e)
            {
                ErrorLog.GetDefault(null).Log(new Error(e));
                response = Request.CreateResponse(HttpStatusCode.BadRequest, "Process error.");
            }

            return response;
        }

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> FinishJob()
        {
            var response = Request.CreateResponse(HttpStatusCode.BadRequest, "Server error");

            try
            {
                string icaoStr = Request.Headers.GetValues("ICAO").First();
                string payloadStr = Request.Headers.GetValues("Payload").First();
                string usarIdStr = Request.Headers.GetValues("UserId").First().Replace("\"", "");
                string tailNumberStr = Request.Headers.Contains("TailNumber") ? Request.Headers.GetValues("TailNumber").FirstOrDefault() : "No acf model data";
                string planeDescriptionStr = Request.Headers.Contains("PlaneDescription") ? Request.Headers.GetValues("PlaneDescription").FirstOrDefault() : "No acf model data";
                string fuelWeightStr = Request.Headers.GetValues("FuelWeight").First();

                if (string.IsNullOrEmpty(tailNumberStr))  tailNumberStr = "No acf model data";
                if (string.IsNullOrEmpty(planeDescriptionStr)) planeDescriptionStr = "No acf model data";

                var dbContext = new ApplicationDbContext();
                JobDbModel job = null;
                if (icaoStr.Length == 3)
                {
                    job = dbContext.JobDbModels.FirstOrDefault(j => j.User.Id == usarIdStr &&
                                                                    j.IsActivated && j.InProgress &&
                                                                    (j.ArrivalICAO.Substring(1).ToLower() == icaoStr.ToLower() ||
                                                                    j.AlternativeICAO.Substring(1).ToLower() == icaoStr.ToLower()));
                }
                else
                {
                    job = dbContext.JobDbModels.FirstOrDefault(j => j.User.Id == usarIdStr &&
                                                                    j.IsActivated && j.InProgress &&
                                                                    (j.ArrivalICAO.ToLower() == icaoStr.ToLower() ||
                                                                    j.AlternativeICAO.ToLower() == icaoStr.ToLower()));
                }

                if (job == null)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Wrong destination to finish this job.");
                }

                if (job.IsChallenge && job.ChallengeExpirationDate > DateTime.UtcNow)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, CHALLENGE_EXPIRED);
                }

                // Check GUEST
                if (job.User != null && job.User.Email == AccountController.GuestEmail)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, AccountController.GuestMessage);
                }

                long payload = Convert.ToInt64(Math.Round(Convert.ToDouble(payloadStr, new CultureInfo("en-US"))));
                // Check payload
                if (payload >= (job.Payload + 150) || payload <= (job.Payload - 150))
                {
                    var payloadInPounds = DataConversion.ConvertKilogramsToPounds(job.Payload);
                    return Request.CreateResponse(HttpStatusCode.Forbidden, $"Wrong. Active job payload is: {job.Payload}kg / {payloadInPounds}lbs");
                }
                                
                var diffTime = DateTime.UtcNow - job.StartTime;

                var minTime = (job.Dist * 11) / 100;

                if (diffTime.TotalMinutes < minTime)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Impossible to arrive at destination in this short time.");
                }

                job.InProgress = false;
                job.EndTime = DateTime.UtcNow;
                job.IsDone = true;
                job.IsActivated = false;
                job.ModelName = tailNumberStr;
                job.ModelDescription = planeDescriptionStr;

                long fuelWeight = Convert.ToInt64(Math.Round(Convert.ToDouble(fuelWeightStr, new CultureInfo("en-US"))));
                job.FinishFuelWeight = fuelWeight;

                var expectedFuelBurned = (job.Dist * job.Payload * 0.12) / 1000;
                //// Check Fuel
                if ((job.UsedFuelWeight) < expectedFuelBurned)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, $"Impossible to finish this job with {job.UsedFuelWeight}Kg burned fuel.");
                }

                var licenseExpired = UpdateStatistics(job, dbContext);
                UpdateAirline(job, dbContext);

                dbContext.SaveChanges();

                string resultMsg = "Job finish successfully at: " + job.EndTime.ToShortTimeString() + "  (UTC)";
                if (licenseExpired)
                    resultMsg = "Job finish. Your license is expired. Check Profile page.";

                return Request.CreateResponse(HttpStatusCode.OK, resultMsg);
            }
            catch (Exception e)
            {
                ErrorLog.GetDefault(null).Log(new Error(e));
                response = Request.CreateResponse(HttpStatusCode.BadRequest, "Process error.");
            }

            return response;
        }

        private bool UpdateStatistics(JobDbModel job, ApplicationDbContext dbContext)
        {
            var licenseOverdue = false;
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == job.User.Id);
            if (statistics != null)
            {
                licenseOverdue = IsLicenseOverdue(dbContext, job.User.Id);
                if (!licenseOverdue)
                {
                    if (job.AviationType == 1)
                    {
                        statistics.PilotScore += job.Dist / 10;
                    }
                    else
                    {
                        statistics.PilotScore += job.Dist / 15;
                    }
                    
                    statistics.BankBalance += job.Pay;
                }
            }
            else
            {
                var newStatistics = new StatisticsDbModel()
                {
                    BankBalance = job.Pay,
                    PilotScore = job.AviationType == 1 ? job.Dist / 10 : job.Dist / 15,
                    Logo = "/Content/img/default.jpg",
                    User = job.User
                };
                dbContext.StatisticsDbModels.Add(newStatistics);
            }
            return licenseOverdue;
        }

        private void UpdateAirline(JobDbModel job, ApplicationDbContext dbContext)
        {
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == job.User.Id);
            if (statistics != null && statistics.Airline != null)
            {
                //long airlinePay = job.Pay + 35;
                var jobAirline = new JobAirlineDbModel()
                {
                    Airline = statistics.Airline,
                    Job = job
                };
                var departureFbo = dbContext.AirlineFbo.FirstOrDefault(x => x.Airline.Id == jobAirline.Airline.Id && x.Icao == job.DepartureICAO);
                jobAirline.CalcAirlineJob(departureFbo);

                if (statistics.Airline.DebtValue > 0 && statistics.Airline.DebtMaturityDate < DateTime.Now)
                {
                    // tem dívida, não pontua e perde dinheiro
                    statistics.Airline.BankBalance -= (long)(jobAirline.FlightIncome / 2);

                    if (statistics.Airline.BankBalance <= 0)
                        statistics.Airline.BankBalance = 0;
                }
                else
                {
                    // Pontua e ganha
                    statistics.Airline.AirlineScore += job.Dist / 14;
                    statistics.Airline.AirlineScore += departureFbo != null ? departureFbo.ScoreIncrease : 0;
                    statistics.Airline.BankBalance += (long)jobAirline.RevenueEarned;
                }

                // Aplica débitos somente airlines compradas
                if (!string.IsNullOrEmpty(statistics.Airline.UserId))
                {
                    if (statistics.Airline.DebtValue == 0)
                    {
                        // Aplica o vencimento
                        statistics.Airline.DebtMaturityDate = DateTime.Now.AddDays(5);
                    }

                    // Aplica o débito
                    statistics.Airline.DebtValue += (long)jobAirline.TotalFlightCost;
                }
                dbContext.JobAirlineDbModels.Add(jobAirline);
            }
        }

        private bool IsLicenseOverdue(ApplicationDbContext dbContext, string userId)
        {
            var listOverdue = dbContext.PilotLicenseExpensesUser.Where(e =>
                                                            e.MaturityDate < DateTime.UtcNow &&
                                                            e.User.Id == userId).ToList();
            return (listOverdue.Count() > 0);
        }

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> GetUserJobs()
        {
            var dbContext = new ApplicationDbContext();
            string userIdStr = Request.Headers.GetValues("UserId").First().Replace("\"", "");
            var user = dbContext.Users.FirstOrDefault(u => u.Id == userIdStr);
            if (user == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "User not found.");
            }
            
            var jobListQuery = dbContext.JobDbModels.Where(j => !j.IsDone && j.User.Id == user.Id).OrderBy(j => j.Id);

            var jobList = jobListQuery.ToList();
            jobList.ForEach(delegate (JobDbModel j) {
                var cargo = j.Cargo;//  DataConversion.GetWeight(Request, j.Cargo);
                var paxWeight = j.PaxWeight;// DataConversion.GetWeight(Request, j.PaxWeight);
                var passengesWeight = j.Pax * paxWeight;
                j.PayloadDisplay = cargo + passengesWeight;
                j.Cargo = cargo;
                j.User = null;
            });

            var jobListJson = JsonConvert.SerializeObject(jobList, Formatting.None);
            return Request.CreateResponse(HttpStatusCode.OK, jobListJson);
        }

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> ActivateUserJob()
        {
            var dbContext = new ApplicationDbContext();
            string userIdStr = Request.Headers.GetValues("UserId").First().Replace("\"", "");
            string jobIdStr = Request.Headers.GetValues("JobId").First().Replace("\"", "");
            var user = dbContext.Users.FirstOrDefault(u => u.Id == userIdStr);
            if (user != null)
            {
                var jobList = dbContext.JobDbModels.Where(j => !j.IsDone && j.User.Id == user.Id);
                foreach (var job in jobList)
                {
                    job.IsActivated = (job.Id == Convert.ToInt32(jobIdStr));
                }
                dbContext.SaveChanges();
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "User not found.");
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
