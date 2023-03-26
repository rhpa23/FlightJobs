using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class JobTO
    {
        public string UserId { get; set; }
        public string DepartureICAO { get; set; }
        public string ArrivalICAO { get; set; }
        public string AlternativeICAO { get; set; }
        public long Dist { get; set; }
        public long Pax { get; set; }
        public long Cargo { get; set; }
        public long Pay { get; set; }
        public string AviationType { get; set; }
    }
}