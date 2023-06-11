using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class JobStatusTO
    {
        public string UserId { get; set; }
        public string Title { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double PayloadKilograms { get; set; }
        public double FuelWeightKilograms { get; set; }
        public IList<string> ResultMessages { get; set; }
        public long ResultScore { get; set; }
    }
}