using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class JobSerachModel
    {
        public string Departure { get; set; }
        public string Arrival { get; set; }
        public long Range { get; set; }
    }
}