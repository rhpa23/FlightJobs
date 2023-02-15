using FlightJobs.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Threading.Tasks;
using FlightJobs.Models;
using System.Web.Http;
using Microsoft.AspNet.Identity.Owin;
using System.Net.Http;
using System.Net;
using Microsoft.AspNet.Identity;

namespace FlightJobs.Controllers
{
    public class UserApiController : ApiController
    {

        private ApplicationUserManager _userManager;

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? System.Web.HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage GetUserStatistics([FromBody] UserSimpleTO userTo)
        {
            var baseController = new BaseController();
            var userStatistics = baseController.GetUserStatistics(userTo.Id);
            userStatistics.User.PasswordHash = ""; // For security reason
            userStatistics.User.SecurityStamp = "";

            var response = Request.CreateResponse(HttpStatusCode.OK, userStatistics);

            return response;
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public async Task<HttpResponseMessage> UpdateUserSettings([FromBody] UserSettingsTO userSettingsTO)
        {
            var user = UserManager.FindById(userSettingsTO.UserId);
            if (user != null && user.Email != AccountController.GuestEmail)
            {
                user.UserName = userSettingsTO.UserName;
                var resultUpdate = UserManager.Update(user);
                string code = await UserManager.GeneratePasswordResetTokenAsync(userSettingsTO.UserId);
                var result = await UserManager.ResetPasswordAsync(userSettingsTO.UserId, code, userSettingsTO.Password);
                if (result.Succeeded && resultUpdate.Succeeded)
                {
                    var dbContext = new ApplicationDbContext();
                    var statisticsDb = dbContext.StatisticsDbModels.FirstOrDefault(x => x.User.Id == userSettingsTO.UserId);
                    statisticsDb.WeightUnit = userSettingsTO.WeightUnit;
                    statisticsDb.SendAirlineBillsWarning = userSettingsTO.ReceiveAlertEmails;
                    statisticsDb.SendLicenseWarning = userSettingsTO.ReceiveAlertEmails;
                    dbContext.SaveChanges();
                }
                else
                {
                    string error = "";
                    if (result.Errors?.Count() > 0)
                    {
                        error = result.Errors?.First();
                    }
                    else
                    {
                        error = resultUpdate.Errors?.First();
                    }

                    return Request.CreateResponse(HttpStatusCode.BadRequest, error);
                }
            }

            var response = Request.CreateResponse(HttpStatusCode.OK, user);

            return response;
        }
    }

    
}