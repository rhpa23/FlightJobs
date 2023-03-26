using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class JobSearchTO
    {
        public string Departure { get; set; }
        public string Arrival { get; set; }
        public string Alternative { get; set; }
        public string AviationType { get; set; }
        public CustomPlaneCapacityDbModel CustomPlaneCapacity { get; set; }
        public string userId { get; set; }
    }
}