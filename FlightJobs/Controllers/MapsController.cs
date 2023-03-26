using FlightJobs.Models;
using FlightJobs.Util;
using System;
using System.Collections.Generic;
using System.Device.Location;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity.Owin;
using System.Net.Http;
using System.Net.Http.Headers;

namespace FlightJobs.Controllers
{
    public class MapsController : BaseController
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GenerateJobsMap()
        {
            return View();
        }
    }
}
