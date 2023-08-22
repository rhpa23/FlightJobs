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
using System.Text;
using System.Threading;
using FlightJobs.DTOs;

namespace FlightJobs.Controllers
{
    public class SearchApiController : ApiController
    {
        
        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public async Task<HttpResponseMessage> GetArrivalTips(string departure, [FromBody] UserSimpleTO userTo)
        {
            var listTips = new SearchJobsController().SearchJobTipsViewModels(departure, userTo.Id);
            return Request.CreateResponse(HttpStatusCode.OK, listTips);
        }

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        public async Task<HttpResponseMessage> GetAlternativeTips(string arrival, int range)
        {
            var listTips = new SearchJobsController().SearchAlternativeTips(arrival, range);
            return Request.CreateResponse(HttpStatusCode.OK, listTips);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public async Task<HttpResponseMessage> CloneJob(long jobId, [FromBody] UserSimpleTO userTo)
        {
            new SearchJobsController().ApplyCloneJob(jobId, userTo.Id);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public async Task<HttpResponseMessage> SaveCapacity([FromBody] CapacityTO capacity)
        {
            new SearchJobsController().SaveCapacity(capacity);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public async Task<HttpResponseMessage> RemoveCapacity([FromBody] CapacityTO capacity)
        {
            new SearchJobsController().RemoveCapacity(capacity);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> GenerateConfirmJobs([FromBody] JobSearchTO jobSearch)
        {
            var jobs = new SearchJobsController().GenerateJobs(jobSearch);
            return Request.CreateResponse(HttpStatusCode.OK, jobs);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> ConfirmJobs([FromBody] JobTO jobTO)
        {
            new SearchJobsController().Confirm(jobTO);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> GetSimBriefData(string simbriefUserName)
        {
            try
            {
                var simBriefData = await new SearchJobsController().SimbriefLoadAsync(simbriefUserName);
                var simBriefTO = JsonConvert.DeserializeObject<SimBriefTO>(simBriefData.Data.ToString());
                return Request.CreateResponse(HttpStatusCode.OK, simBriefTO);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            
        }

        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> GetRandomFlight(string departure, string destination)
        {
            try
            {
                var randomData = new SearchJobsController().RandomFlight(departure, destination);
                return Request.CreateResponse(HttpStatusCode.OK, randomData.Data);
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public HttpResponseMessage GetMapInfo(string departure, string arrival, string alternative, string username = "")
        {
            var json = new SearchJobsController().GetMapInfo(departure, arrival, alternative, username, "img/icons/");
            var response = Request.CreateResponse(HttpStatusCode.OK, json);
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            return response;
        }
    }
}
