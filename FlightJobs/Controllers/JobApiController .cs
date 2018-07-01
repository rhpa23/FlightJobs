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

namespace FlightJobs.Controllers
{
    public class JobApiController : ApiController
    {

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

                long payload = Convert.ToInt64(Math.Round(Convert.ToDouble(payloadStr, new CultureInfo("en-US")))); 
                // Check payload
                if (payload >= (job.Payload + 150) || payload <= (job.Payload - 150))
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Wrong payload. Active job payload is: " + job.Payload + "Kg");
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

                return Request.CreateResponse(HttpStatusCode.OK, resultMsg);
            }
            catch (Exception)
            {
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
                string tailNumberStr = Request.Headers.GetValues("TailNumber").First();
                string planeDescriptionStr = Request.Headers.GetValues("PlaneDescription").First();
                string fuelWeightStr = Request.Headers.GetValues("FuelWeight").First();

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

                long payload = Convert.ToInt64(Math.Round(Convert.ToDouble(payloadStr, new CultureInfo("en-US"))));
                // Check payload
                if (payload >= (job.Payload + 150) || payload <= (job.Payload - 150))
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Wrong payload. Active job payload is: " + job.Payload + "Kg");
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

                var licenseExpired = UpdateStatistics(job, dbContext);
                UpdateAirline(job, dbContext);

                dbContext.SaveChanges();

                string resultMsg = "Job finish successfully at: " + job.EndTime.ToShortTimeString() + "  (UTC)";
                if (licenseExpired)
                    resultMsg = "Job finish. Your license is expired. Check Profile page.";

                return Request.CreateResponse(HttpStatusCode.OK, resultMsg);
            }
            catch (Exception)
            {
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
                    statistics.PilotScore += job.Dist / 15;
                    statistics.BankBalance += job.Pay;
                }
            }
            else
            {
                var newStatistics = new StatisticsDbModel()
                {
                    BankBalance = job.Pay,
                    PilotScore = job.Dist / 15,
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
                jobAirline.CalcAirlineJob();

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
    }
}
