﻿using System;
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
using System.Text;
using System.Threading;
using FlightJobs.DTOs;
using FlightJobs.Domain.Navdata;

namespace FlightJobs.Controllers
{
    public class JobApiController : ApiController
    {

        private const string CHALLENGE_EXPIRED = "Unfortunately, this Challenge is expired. Take another one.";
        internal SqLiteDbContext _sqLiteDbContext = new SqLiteDbContext();

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> StartJobMSFS()
        {
            var response = Request.CreateResponse(HttpStatusCode.BadRequest, "Server error");

            try
            {
                string latitude = Request.Headers.GetValues("Latitude").First();
                string longitude = Request.Headers.GetValues("Longitude").First();
                var airport = _sqLiteDbContext.GetCloseAirport(Convert.ToDouble(latitude.Replace(",", ".")), Convert.ToDouble(longitude.Replace(",", ".")));

                string payloadStr = Request.Headers.GetValues("Payload").First().Replace(",", ".");
                string usarIdStr = Request.Headers.GetValues("UserId").First().Replace("\"", "");
                string fuelWeightStr = Request.Headers.GetValues("FuelWeight").First().Replace(",", ".");

                response = StartJob(airport.Ident, payloadStr, usarIdStr, fuelWeightStr);
            }
            catch (Exception e)
            {
                ErrorLog.GetDefault(null).Log(new Error(e));
                response = Request.CreateResponse(HttpStatusCode.BadRequest, "Process error.");
            }

            return response;
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> FinishJobMsfsPost([FromBody] JobStatusTO jobStatus)
        {
            var response = Request.CreateResponse(HttpStatusCode.BadRequest, "Process error.");
            try
            {
                var airport = _sqLiteDbContext.GetCloseAirport(jobStatus.Latitude, jobStatus.Longitude);

                response = FinishJob(airport.Ident, jobStatus.PayloadKilograms.ToString(),
                                                  jobStatus.UserId, jobStatus.FuelWeightKilograms.ToString(), "MSFS", 
                                                  jobStatus.Title, jobStatus.ResultMessages, jobStatus.ResultScore);

                var dbContext = new ApplicationDbContext();
                var finishedJob = dbContext.JobDbModels
                       .OrderByDescending(x => x.EndTime)
                       .FirstOrDefault(x => x.User.Id == jobStatus.UserId && x.IsDone);
                finishedJob.User = null;

                string resultMsg = response.Content.ReadAsStringAsync().Result.Replace("\"", "");
                var jobJson = JsonConvert.SerializeObject(new { ResultMessage = resultMsg, FinishedJob = finishedJob }, Formatting.None);
                return Request.CreateResponse(response.StatusCode, jobJson);
            }
            catch (Exception e)
            {
                ErrorLog.GetDefault(null).Log(new Error(e));
            }

            return response;
        }

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> FinishJobMSFS()
        {
            var response = Request.CreateResponse(HttpStatusCode.BadRequest, "Server error");

            try
            {
                string latitude = Request.Headers.GetValues("Latitude").First();
                string longitude = Request.Headers.GetValues("Longitude").First();
                var airport = _sqLiteDbContext.GetCloseAirport(Convert.ToDouble(latitude.Replace(",", ".")), Convert.ToDouble(longitude.Replace(",", ".")));

                string payloadStr = Request.Headers.GetValues("Payload").First().Replace(",", ".");
                string usarIdStr = Request.Headers.GetValues("UserId").First().Replace("\"", "");
                string fuelWeightStr = Request.Headers.GetValues("FuelWeight").First().Replace(",", ".");
                string planeDescriptionStr = Request.Headers.GetValues("PlaneDescription").First().Replace(",", ".");

                response = FinishJob(airport.Ident, payloadStr, usarIdStr, fuelWeightStr, "MSFS", planeDescriptionStr);
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
        public async Task<HttpResponseMessage> StartJob()
        {
            var response = Request.CreateResponse(HttpStatusCode.BadRequest, "Server error");

            try
            {
                string icaoStr = Request.Headers.GetValues("ICAO").First();
                string payloadStr = Request.Headers.GetValues("Payload").First().Replace(",", ".");
                string usarIdStr = Request.Headers.GetValues("UserId").First().Replace("\"", "");
                string fuelWeightStr = Request.Headers.GetValues("FuelWeight").First().Replace(",", ".");

                response = StartJob(icaoStr, payloadStr, usarIdStr, fuelWeightStr);
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
                string payloadStr = Request.Headers.GetValues("Payload").First().Replace(",", ".");
                string usarIdStr = Request.Headers.GetValues("UserId").First().Replace("\"", "");
                string fuelWeightStr = Request.Headers.GetValues("FuelWeight").First().Replace(",", ".");
                string tailNumberStr = Request.Headers.Contains("TailNumber") ? Request.Headers.GetValues("TailNumber").FirstOrDefault() : "No acf model data";
                string planeDescriptionStr = Request.Headers.Contains("PlaneDescription") ? Request.Headers.GetValues("PlaneDescription").FirstOrDefault() : "No acf model data";

                if (string.IsNullOrEmpty(tailNumberStr)) tailNumberStr = "No acf model data";
                if (string.IsNullOrEmpty(planeDescriptionStr)) planeDescriptionStr = "No acf model data";


                response = FinishJob(icaoStr, payloadStr, usarIdStr, fuelWeightStr, tailNumberStr, planeDescriptionStr);
            }
            catch (Exception e)
            {
                ErrorLog.GetDefault(null).Log(new Error(e));
                response = Request.CreateResponse(HttpStatusCode.BadRequest, "Process error.");
            }

            return response;
        }

        private HttpResponseMessage StartJob(string icaoStr, string payloadStr, string usarIdStr, string fuelWeightStr)
        {
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

            if (job.IsChallenge && job.ChallengeExpirationDate <= DateTime.Now)
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
            job.StartTime = DateTime.Now;
            dbContext.SaveChanges();

            string name = job.IsChallenge ? "Challenge" : "Job";

            var licenseOverdue = IsLicenseOverdue(dbContext, job.User.Id);
            var resultMsg = $"{name} to " + job.ArrivalICAO + " started at: " + job.StartTime.ToShortTimeString() + " (UTC)";
            if (licenseOverdue)
            {
                resultMsg = $"{name} started. Warn: Your pilot license is expired. Check profile page.";
            }

            var response = Request.CreateResponse(HttpStatusCode.OK, resultMsg);
            response.Headers.Add("arrival-icao", job.ArrivalICAO);

            return response;
        }

        public HttpResponseMessage FinishJob(string icaoStr, string payloadStr, string usarIdStr, 
                                             string fuelWeightStr, string tailNumberStr, string planeDescriptionStr,
                                             IList<string> resultMessages = null, long? jobPilotScore = null)
        {
            var response = Request.CreateResponse(HttpStatusCode.BadRequest, "Server error");

            try
            {

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

                string name = job.IsChallenge ? "Challenge" : "Job";

                if (job.IsChallenge && job.ChallengeExpirationDate <= DateTime.Now)
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
                    return Request.CreateResponse(HttpStatusCode.Forbidden, $"Wrong. Active {name} payload is: {job.Payload}kg / {payloadInPounds}lbs");
                }
                                
                var diffTime = DateTime.Now - job.StartTime;

                var minTime = (job.Dist * 11) / 100;

                if (diffTime.TotalMinutes < minTime)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Impossible to arrive at destination in this short time.");
                }

                job.InProgress = false;
                job.EndTime = DateTime.Now;
                job.IsDone = true;
                job.IsActivated = false;
                job.ModelName = tailNumberStr;
                job.ModelDescription = planeDescriptionStr;

                if (jobPilotScore != null) job.PilotScore = jobPilotScore.Value;

                long fuelWeight = Convert.ToInt64(Math.Round(Convert.ToDouble(fuelWeightStr, new CultureInfo("en-US"))));
                job.FinishFuelWeight = fuelWeight;

                var expectedFuelBurned = (job.Dist * job.Payload * 0.12) / 1000;
                //// Check Fuel
                if ((job.UsedFuelWeight) < expectedFuelBurned)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, $"Impossible to finish this {name} with {job.UsedFuelWeight}Kg burned fuel.");
                }

                var licenseExpired = UpdateStatistics(job, dbContext, jobPilotScore);
                UpdateAirline(job, dbContext, resultMessages);

                dbContext.SaveChanges();

                string resultMsg = $"{name} finish successfully at: " + job.EndTime.ToShortTimeString() + "  (UTC)";
                if (licenseExpired)
                    resultMsg = $"{name} finish. Your license is expired. Check Profile page.";

                return Request.CreateResponse(HttpStatusCode.OK, resultMsg);
            }
            catch (Exception e)
            {
                ErrorLog.GetDefault(null).Log(new Error(e));
                response = Request.CreateResponse(HttpStatusCode.BadRequest, "Process error.");
            }

            return response;
        }

        private bool UpdateStatistics(JobDbModel job, ApplicationDbContext dbContext, long? jobPilotScore = null)
        {
            var licenseOverdue = false;
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == job.User.Id);
            if (statistics != null)
            {
                licenseOverdue = IsLicenseOverdue(dbContext, job.User.Id);
                if (!licenseOverdue)
                {
                    if (jobPilotScore != null)
                    {
                        statistics.PilotScore += jobPilotScore.Value;
                        job.PilotScore = jobPilotScore.Value;
                    }
                    else
                    {
                        if (job.AviationType == 1)
                        {
                            statistics.PilotScore += job.Dist / 10;
                            job.PilotScore = job.Dist / 10;
                        }
                        else
                        {
                            statistics.PilotScore += job.Dist / 15;
                            job.PilotScore = job.Dist / 10;
                        }
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

        private void UpdateAirline(JobDbModel job, ApplicationDbContext dbContext, IList<string> resultMessages = null)
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

                    if (statistics.Airline.DebtValue > 0)
                    {
                        Task.Factory.StartNew(() => SendEmailWarningForAirlineDebtAsync(statistics.Airline, job, resultMessages));
                    }
                }
                dbContext.JobAirlineDbModels.Add(jobAirline);
            }
        }

        private bool IsLicenseOverdue(ApplicationDbContext dbContext, string userId)
        {
            var listOverdue = dbContext.PilotLicenseExpensesUser.Where(e =>
                                                            e.MaturityDate < DateTime.Now &&
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
            var userStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            if (user == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "User not found.");
            }
            
            var jobListQuery = dbContext.JobDbModels
                .Where(j => !j.IsDone && j.User.Id == user.Id && !j.IsChallenge)
                .OrderBy(j => j.Id);

            BaseController baseController = new BaseController();
            
            var jobList = jobListQuery.ToList();
            jobList.ForEach(delegate (JobDbModel j) {
                var cargo = baseController.GetWeight(null, j.Cargo, userStatistics);
                //var paxWeight = baseController.GetWeight(null, j.PaxWeight, userStatistics);
                //var passengesWeight = j.Pax * paxWeight;
                j.PayloadDisplay = baseController.GetWeight(null, j.Payload, userStatistics);
                j.Cargo = cargo;
                j.User = null;
                j.WeightUnit = userStatistics.WeightUnit;
            });

            var jobListJson = JsonConvert.SerializeObject(jobList, Formatting.None);
            return Request.CreateResponse(HttpStatusCode.OK, jobListJson);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> GetLastUserJob([FromBody] UserSimpleTO userSimpleTO)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Id == userSimpleTO.Id);
            if (user == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "User not found.");
            }

            var userStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);

            var lastJob = dbContext.JobDbModels
                .OrderByDescending(x => x.EndTime)
                .FirstOrDefault(x => x.User.Id == user.Id && x.IsDone);

            if (lastJob != null)
            {
                BaseController baseController = new BaseController();
                lastJob.PayloadDisplay = baseController.GetWeight(null, lastJob.Payload, userStatistics);
                lastJob.Cargo = baseController.GetWeight(null, lastJob.Cargo, userStatistics);
                lastJob.User = null;
                lastJob.WeightUnit = userStatistics.WeightUnit;

                var jobJson = JsonConvert.SerializeObject(lastJob, Formatting.None);
                return Request.CreateResponse(HttpStatusCode.OK, jobJson);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }
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

        private async Task SendEmailWarningForAirlineDebtAsync(AirlineDbModel airline, JobDbModel job, IList<string> resultMessages = null)
        {
            await Task.Delay(10000);
            var dbContext = new ApplicationDbContext();
            try
            {
                var airlinePilotsHiredStatistics = dbContext.StatisticsDbModels.Where(s => 
                                                        s.Airline != null && 
                                                        s.Airline.Id == airline.Id && s.SendAirlineBillsWarning).ToList();

                foreach (var pilotHired in airlinePilotsHiredStatistics)
                {
                    var sb = new StringBuilder();
                    sb.Append($"<p><a href='https://flightjobs.bsite.net' target='_blank'><img src='http://flightjobs.bsite.net/Content/img/FlightJobsLogo0001.png' /></a></p><hr />");
                    sb.Append($"<p>Hi captain {pilotHired.User.UserName},</p>");
                    sb.Append("<p>FlightJobs is sending you this email because you have defined to be advised when your airline generates a Debt since one Job was finished.</p>");
                    sb.Append("<p>You can disable this email warning any time unchecking the box in the Airline Balance Situation popup window or click <a href='https://flightjobs.bsite.net/Profile/EmailUnsubscribeView' target='_blank'>unsubscribe</a> </p>");
                    sb.Append("<h3>A job at the airline generated bills to pay.</h3>");
                    sb.Append($"<h4><p>The debt of {airline.Name} is <font color=\"red\"> {string.Format("F{0:C}", airline.DebtValue)} </font> at the moment. </p></h4>");
                    sb.Append($"<h4><p>The maturity date for the debt is <font color=\"red\"> {airline.DebtMaturityDate.ToShortDateString()} </font> </p></h4>");
                    sb.Append($"<p>If the owner does not pay bills before the due date the airline will not score, and the Jobs will generate more debts which could lead to the bankruptcy of the company.</p>  <hr />");

                    sb.Append($"<p><b>Info about the job that generate the debt: </b></p><ul>");
                    sb.Append($"<li>Depature: <b>{job.DepartureICAO}</b>  </li>");
                    sb.Append($"<li>Arrival: <b>{job.ArrivalICAO}</b>  </li>");
                    sb.Append($"<li>Model: <b>{job.ModelDescription}</b>  </li>");
                    sb.Append($"<li>Pilot: <b>{job.User.UserName}</b>  </li>");
                    sb.Append($"<li>Flight time: <b>{job.FlightTime}</b>  </li>");
                    sb.Append($"<li>Flight distance: <b>{job.Dist}nm</b> </li>");
                    sb.Append($"<li>Arrive time: <b>{job.EndTime}</b> </li>");
                    sb.Append($"<li>Pax: <b>{job.Pax}</b> </li>");
                    sb.Append($"<li>Cargo: <b>{job.Cargo}</b> </li>");
                    sb.Append($"<li>Challenge: <b>{job.IsChallenge.ToString()} </b></li></ul><hr />");

                    if (resultMessages != null)
                    {
                        sb.Append($"<p><b>Flight results: </b></p>");
                        sb.Append("<ul>");
                        foreach (var msg in resultMessages)
                        {
                            sb.Append($"<li>{msg}</li>");
                        }
                        sb.Append("</ul><hr />");
                    }

                    sb.Append($"<p>Thanks for use FlightJobs.</p>");
                    sb.Append($"<p>If you prefer not receive this type of communication from flightjobs.bsite.net, please <a href='https://flightjobs.bsite.net/Profile/EmailUnsubscribeView' target='_blank'>click here to unsubscribe</a>.</p>");

                    sb.Append($"<p>FlightJobs is free. If you like it, please consider making a donation in PayPal.</p>");
                    sb.Append($"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=44VG35XYRJUCW&source=url");
                    sb.Append($"<p>https://flightjobs.bsite.net</p>");
                    await new EmailService().SendAsync(new IdentityMessage()
                    {
                        Body = sb.ToString(),
                        Subject = "[FlightJobs] Airline has bills to pay",
                        Destination = pilotHired.User.Email
                    });
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error sending license e-mail warning: {e.ToString()}", e);
            }
        }

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> FindClosestLocationTest(string lat, string lon)
        {
            var airport = _sqLiteDbContext.GetCloseAirport(Convert.ToDouble(lat), Convert.ToDouble(lon));
            return Request.CreateResponse(HttpStatusCode.OK, airport.Ident);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> GetUserPlaneCapacities([FromBody] UserSimpleTO userSimpleTO)
        {
            var dbContext = new ApplicationDbContext();
            var list = dbContext.CustomPlaneCapacity.Where(x => x.User.Id == userSimpleTO.Id).ToList()
                .Select(x => new CustomPlaneCapacityDbModel()
                {
                    CustomCargoCapacityWeight = x.CustomCargoCapacityWeight,
                    CustomNameCapacity = x.CustomNameCapacity,
                    CustomPassengerCapacity = x.CustomPassengerCapacity,
                    CustomPaxWeight = x.CustomPaxWeight,
                    ImagePath = x.ImagePath,
                    Id = x.Id
                }).OrderBy(x => x.CustomNameCapacity).ToList();
            var listJson = JsonConvert.SerializeObject(list, Formatting.None);
            return Request.CreateResponse(HttpStatusCode.OK, listJson);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage RemoveJob(int jobId, [FromBody] UserSimpleTO userTo)
        {
            new HomeController().DeleteJob(jobId, userTo.Id);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage GetUserJobsPaged(string sortOrder, string currentSort, int pageNumber, [FromBody] PaginatedJobsFilterTO jobsFilterTO)
        {
            sortOrder = String.IsNullOrEmpty(sortOrder) ? "Date" : sortOrder;
            var user = new ApplicationUser() { Id = jobsFilterTO.UserId };
            TimeSpan t = new TimeSpan();
            var filterViewModel = new HomeViewModel() { 
                ArrivalFilter = jobsFilterTO.ArrivalICAO, 
                DepartureFilter = jobsFilterTO.DepartureICAO, 
                ModelDescriptionFilter = jobsFilterTO.ModelDescription 
            };
            var userJobs = new BaseController().FilterJobs(user, filterViewModel, ref t);
            var pagedJobs = new ProfileController().GetSortedJobs(userJobs, sortOrder, currentSort, pageNumber);
            var paginatedJobs = new PaginatedJobsTO()
            {
                HasNextPage = pagedJobs.HasNextPage,
                HasPreviousPage = pagedJobs.HasPreviousPage,
                IsFirstPage = pagedJobs.IsFirstPage,
                IsLastPage = pagedJobs.IsLastPage,
                PageCount = pagedJobs.PageCount,
                PageNumber = pagedJobs.PageNumber,
                PageSize = pagedJobs.PageSize,
                TotalItemCount = pagedJobs.TotalItemCount,
                Jobs = pagedJobs.ToList()
            };
            return Request.CreateResponse(HttpStatusCode.OK, paginatedJobs);
        }
    }
}
