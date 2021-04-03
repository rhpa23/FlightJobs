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
    public class AuthenticationApiController : ApiController
    {
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.Current.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> Login()
        {
            var response = Request.CreateResponse(HttpStatusCode.BadRequest, "Server error");

            try
            {
                string email = Request.Headers.GetValues("Email").First();
                string password = Request.Headers.GetValues("Password").First();

                var userModel = await UserManager.FindByEmailAsync(email);
                if (userModel == null)
                {
                    return Request.CreateResponse(HttpStatusCode.Unauthorized, "Invalid login attempt.");
                }
                //Add this to check if the email was confirmed.
                if (!await UserManager.IsEmailConfirmedAsync(userModel.Id))
                {
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "You need to confirm your email.");
                }

                // Isso não conta falhas de login em relação ao bloqueio de conta
                // Para permitir que falhas de senha acionem o bloqueio da conta, altere para shouldLockout: true
                var result = await SignInManager.PasswordSignInAsync(userModel.UserName, password, true, shouldLockout: false);
                switch (result)
                {
                    case SignInStatus.Success:
                    {
                        response = Request.CreateResponse(HttpStatusCode.OK, userModel.Id.ToString());
                        response.Headers.Add("active_job_info", GetActiveJobInfo(userModel.Id.ToString()));
                        response.Headers.Add("username", userModel.UserName);
                        return response;
                    }
                    case SignInStatus.LockedOut:
                        return Request.CreateResponse(HttpStatusCode.Forbidden, "Lockout");
                    case SignInStatus.RequiresVerification:
                        return Request.CreateResponse(HttpStatusCode.Forbidden, "Requires verification");
                    case SignInStatus.Failure:
                        return Request.CreateResponse(HttpStatusCode.Forbidden, "Your login attempt failed.");
                }
            }
            catch (Exception e)
            {
                response = Request.CreateResponse(HttpStatusCode.BadRequest, "Authentication error.");
            }

            // Set headers for paging
            // response.Headers.Add("HEADER_TEST", "HEADER_TEST_VALUE");

            return response;
        }

        private string GetActiveJobInfo(string userId)
        {
            var dbContext = new ApplicationDbContext();
            var job = dbContext.JobDbModels.FirstOrDefault(j => j.User.Id == userId && j.IsActivated);
            if (job != null)
            {
                var baseController = new BaseController();
                var userStatistics = baseController.GetUserStatistics(userId);
                var cargo = baseController.GetWeight(null, job.Cargo, userStatistics);
                var payload = baseController.GetWeight(null, job.Payload, userStatistics);
                var weightUnit = baseController.GetWeightUnit(null, userId);
                
                return $"The active job depature from {job.DepartureICAO} to {job.ArrivalICAO} with {job.Pax} passengers and {cargo}{weightUnit} cargo. The total payload is {payload}{weightUnit}";
            }
            else
            {
                return "No jobs activated.";
            }
        }
    }
}
