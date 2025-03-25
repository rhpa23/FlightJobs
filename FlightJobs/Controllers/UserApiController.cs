using FlightJobs.DTOs;
using System;
using System.Data.Entity;
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
            userStatistics.Airline.ChartModel = baseController.ChartAirline(userStatistics.Airline.Id);
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
                if (!string.IsNullOrEmpty(userSettingsTO.Password))
                {
                    await UserManager.ResetPasswordAsync(userSettingsTO.UserId, code, userSettingsTO.Password);
                }
                
                if (resultUpdate.Succeeded)
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
                    if (resultUpdate.Errors?.Count() > 0)
                    {
                        error = resultUpdate.Errors?.First();
                    }

                    return Request.CreateResponse(HttpStatusCode.BadRequest, error);
                }
            }

            var response = Request.CreateResponse(HttpStatusCode.OK, user);

            return response;
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage GetUserFlightsInfo([FromBody] UserSimpleTO user)
        {
            var statistics = new HomeController().FlightsInfo(user.Id);
            statistics.User.PasswordHash = ""; // For security reason
            statistics.User.SecurityStamp = "";
            statistics.Airline.HiredFBOs = null;
            statistics.AirlinePilotsHired = null;
            
            var dbContext = new ApplicationDbContext();

            statistics.LicensesOverdue = dbContext.PilotLicenseExpensesUser.Include(x => x.PilotLicenseExpense).Where(e =>
                                                            e.MaturityDate < DateTime.Now &&
                                                            e.User.Id == user.Id).ToList();

            long[] overdueLicenseExpenseIds = statistics.LicensesOverdue.Select(x => x.PilotLicenseExpense.Id).ToArray();
            var licenseItens = dbContext.LicenseItemUser.Include(x => x.PilotLicenseItem)
                                                .Include(x => x.PilotLicenseItem.PilotLicenseExpense)
                                                .Where(p => overdueLicenseExpenseIds.Contains(p.PilotLicenseItem.PilotLicenseExpense.Id) && p.User.Id == user.Id);

            if (licenseItens?.Count() > 0)
            {
                foreach (var license in statistics.LicensesOverdue)
                {
                    license.LicenseItems = licenseItens.Where(x => x.PilotLicenseItem.PilotLicenseExpense.Id == license.PilotLicenseExpense.Id).ToList();
                }
            }

            return Request.CreateResponse(HttpStatusCode.OK, statistics);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage GetUserLicensesOverdue([FromBody] UserSimpleTO user)
        {
            var dbContext = new ApplicationDbContext();

            var licensesOverdue = dbContext.PilotLicenseExpensesUser.Include(x => x.PilotLicenseExpense).Where(e =>
                                                            e.MaturityDate < DateTime.Now &&
                                                            e.User.Id == user.Id).ToList();
            
            return Request.CreateResponse(HttpStatusCode.OK, licensesOverdue);
        }


        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage BuyLicencePackage([FromBody] UserSimpleTO userTO, int licenseExpenseId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Id == userTO.Id);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Guest user.");
            }
            var uStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);

            var packageLicenseItens = dbContext.LicenseItemUser.Include(x => x.PilotLicenseItem).Include(x => x.PilotLicenseItem.PilotLicenseExpense)
                                                 .Where(i => i.PilotLicenseItem.PilotLicenseExpense.Id == licenseExpenseId && !i.IsBought && i.User.Id == user.Id);
            foreach (var pkgItem in packageLicenseItens)
            {
                pkgItem.IsBought = true;
                uStatistics.BankBalance -= pkgItem.PilotLicenseItem.Price;
                uStatistics.LicenseWarningSent = false;
            }

            var expenseUser = dbContext.PilotLicenseExpensesUser.Include(x => x.PilotLicenseExpense).FirstOrDefault(e =>
                                e.PilotLicenseExpense.Id == licenseExpenseId &&
                                e.User.Id == user.Id);

            expenseUser.MaturityDate = DateTime.Now.AddDays(expenseUser.PilotLicenseExpense.DaysMaturity);
            expenseUser.OverdueProcessed = false;

            dbContext.Entry(uStatistics).State = EntityState.Modified;
            dbContext.Entry(expenseUser).State = EntityState.Modified;

            dbContext.SaveChanges();

            return Request.CreateResponse(HttpStatusCode.OK, uStatistics);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage SaveAvatar([FromBody] UserSimpleTO user, string fileName)
        {
            var dbContext = new ApplicationDbContext();

            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            statistics.Logo = "/img/avatar/" + fileName;
            dbContext.SaveChanges();

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [System.Web.Http.HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage TransferMoneyToAirline([FromBody] UserSimpleTO user, int percent)
        {
            if (percent > 100 || percent <= 0)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, $"Transfer percent out of range [1-100].");
            }

            var dbContext = new ApplicationDbContext();

            var uStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            if (uStatistics.Airline == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, $"You need to sign a contract with an airline to transfer funds.");
            }

            var transferBB = uStatistics.BankBalance * (percent / (double)100);
            var newPilotBalance = uStatistics.BankBalance - transferBB - (uStatistics.BankBalance * 0.15);

            if (newPilotBalance <= 0)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, $"Insufficient balance to make a transfer. Your current bank balance is: {string.Format("F{0:C}", uStatistics.BankBalance)}");
            }

            uStatistics.BankBalance = (long)newPilotBalance;
            uStatistics.Airline.BankBalance = (long)transferBB + uStatistics.Airline.BankBalance;

            dbContext.SaveChanges();

            return Request.CreateResponse(HttpStatusCode.OK, $"Transfer percentage successfully sent to {uStatistics.Airline.Name}.");
        }
    }
}