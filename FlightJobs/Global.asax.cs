using FlightJobs.Schedule;
using Quartz;
using Quartz.Impl;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;

namespace FlightJobs
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private const string WARNING_EMAIL_JOB = "warning.email.job";
        private const string GROUP_EMAIL = "group.email";


        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            System.Globalization.CultureInfo.DefaultThreadCurrentCulture = new System.Globalization.CultureInfo("en-US");

            // construct a scheduler factory
            ISchedulerFactory schedFact = new StdSchedulerFactory();

            // get a scheduler
            IScheduler sched = schedFact.GetScheduler().Result;
            sched.Start();

            // define the job and tie it to our WarningEmailJob class
            IJobDetail job = JobBuilder.Create<WarningEmailJob>()
                .WithIdentity(WARNING_EMAIL_JOB, GROUP_EMAIL)
                .Build();

            // Trigger the job to run now, and then every 40 seconds
            var trigger = TriggerBuilder.Create()
                                          .WithIdentity(WARNING_EMAIL_JOB, GROUP_EMAIL)
                                          //.StartNow()
                                          .WithSimpleSchedule(x => x
                                              //.WithIntervalInMinutes(5)
                                              .WithIntervalInHours(3)
                                              .RepeatForever())
                                          .Build();

            sched.ScheduleJob(job, trigger);
        }

        protected void Application_BeginRequest()
        {
            //if (!Context.Request.IsLocal && !Request.IsSecureConnection && !Request.Url.AbsoluteUri.Contains("api"))
            //{
            //    Response.Redirect(Request.Url.AbsoluteUri.Replace("http://", "https://"));
            //}
        }
    }
}
