using System;
using System.Collections.Generic;
using System.Linq;
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
                if (payload >= (job.Payload + 80) || payload <= (job.Payload - 80))
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Wrong payload. Active job payload is: " + job.Payload + "Kg");
                }

                long fuelWeight = Convert.ToInt64(Math.Round(Convert.ToDouble(fuelWeightStr, new CultureInfo("en-US"))));
                job.StartFuelWeight = fuelWeight;

                job.InProgress = true;
                job.StartTime = DateTime.UtcNow;
                dbContext.SaveChanges();

                return Request.CreateResponse(HttpStatusCode.OK, "Job to " + job.ArrivalICAO + " started at: " + job.StartTime.ToShortTimeString() + " (UTC)");
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
                if (payload >= (job.Payload + 50) || payload <= (job.Payload - 50))
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

                UpdateStatistics(job, dbContext);
                UpdateAirline(job, dbContext);

                dbContext.SaveChanges();

                return Request.CreateResponse(HttpStatusCode.OK, "Job finish successfully at: " + job.EndTime.ToShortTimeString() + "  (UTC)");
            }
            catch (Exception)
            {
                response = Request.CreateResponse(HttpStatusCode.BadRequest, "Process error.");
            }

            return response;
        }

        private void UpdateStatistics(JobDbModel job, ApplicationDbContext dbContext)
        {
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == job.User.Id);
            if (statistics != null)
            {
                statistics.PilotScore += job.Dist / 15;
                statistics.BankBalance += job.Pay;
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
        }

        private void UpdateAirline(JobDbModel job, ApplicationDbContext dbContext)
        {
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == job.User.Id);
            if (statistics != null && statistics.Airline != null)
            {
                statistics.Airline.AirlineScore += job.Dist / 14;
                statistics.Airline.BankBalance += job.Pay + 50;
            }
        }
    }
}
