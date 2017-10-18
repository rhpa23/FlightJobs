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
                string usarIdStr = Request.Headers.GetValues("UserId").First();

                var dbContext = new ApplicationDbContext();
                var job = dbContext.JobDbModels.FirstOrDefault(j => j.User.Id == usarIdStr &&  
                                                                    j.IsActivated && 
                                                                    j.DepartureICAO.ToLower() == icaoStr.ToLower());


                if (job == null)
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Fail: you don't have any job activated for this location.");
                }

                long payload;
                long.TryParse(payloadStr, out payload);
                // Check payload
                if (payload >= (job.Payload + 2) || payload < (job.Payload - 2))
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Fail: wrong payload. The active job payload is: " + job.Payload);
                }
                
            }
            catch (Exception)
            {
                response = Request.CreateResponse(HttpStatusCode.BadRequest, "Process error.");
            }

            return response;
        }
    }
}
