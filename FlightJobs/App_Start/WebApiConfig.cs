﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace FlightJobs
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();


            config.Routes.MapHttpRoute(
                name: "API Default",
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional });
        }
    }
}
