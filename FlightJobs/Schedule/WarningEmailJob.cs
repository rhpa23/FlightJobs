using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;
using FlightJobs.Models;
using System.Text;
using Microsoft.AspNet.Identity;

namespace FlightJobs.Schedule
{
    public class WarningEmailJob : IJob
    {
        public async Task Execute(IJobExecutionContext context)
        {
            await SendEmailWarningForLicenseAsync();
        }

        public async Task SendEmailWarningForLicenseAsync()
        {
            var dbContext = new ApplicationDbContext();
            try
            {
                var checkDate = DateTime.Now.AddHours(12);
                var listOverdue = dbContext.StatisticsDbModels
                                    .Join(dbContext.PilotLicenseExpensesUser, u => u.User.Id, y => y.User.Id, (s, y) => new { StatisticsDbModel = s, PilotLicenseExpensesUserDbModel = y })
                                    .Where(
                                        all => all.StatisticsDbModel.User.EmailConfirmed && 
                                        all.StatisticsDbModel.SendLicenseWarning && !all.StatisticsDbModel.LicenseWarningSent &&
                                        all.PilotLicenseExpensesUserDbModel.MaturityDate < checkDate
                                     )
                                    .GroupBy(x => x.StatisticsDbModel.User.Id)
                                    .ToList();

                foreach (var item in listOverdue)
                {
                    var sb = new StringBuilder();
                    var requirements = item.ToList();
                    var user = requirements.FirstOrDefault().StatisticsDbModel.User;
                    sb.Append($"<p><a href='https://www.flight-jobs.net' target='_blank'><img src='http://flight-jobs.net/Content/img/FlightJobsLogo0001.png' /></a></p><hr />");
                    sb.Append($"<p>Hi captain {user.UserName},</p>");
                    sb.Append("<p>FlightJobs is sending you this email because you have set it to be advised when your license is close to expiring.</p>");
                    sb.Append("<p>You can disable this email warning any time unchecking the box in the License popup window.</p>");
                    sb.Append("<p>If you have any problem please contact FlightJobs support by email: rhpa23@gmail.com.</p>");
                    sb.Append("<h3>Your pilot license is about to expire.</h3>");
                    sb.Append($"<h4><p>There are {requirements.Count()} requirement(s) that will expire soon. </p></h4>");
                    sb.Append($"<p>If the pilot License expires the next Jobs will not score and paid until you renew your license. Go to the Profile/License form and check your license requirements.</p>  <hr />");
                    sb.Append($"<p>Thanks for use FlightJobs.</p>");
                    sb.Append($"<p>FlightJobs is free. If you like it, please consider making a donation in PayPal.</p>");
                    sb.Append($"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=44VG35XYRJUCW&source=url");
                    sb.Append($"<p>https://www.flight-jobs.net</p>");
                    await new EmailService().SendAsync(new IdentityMessage()
                    {
                        Body = sb.ToString(),
                        Subject = "[FlightJobs] Pilot license expiration warn",
                        Destination = user.Email
                    });
                    requirements.FirstOrDefault().StatisticsDbModel.LicenseWarningSent = true;
                    dbContext.SaveChanges();
                }
            }
            catch (Exception e)
            {
                throw new Exception($"Error sending license e-mail warning: {e.ToString()}", e);
            }
        }
    }
}