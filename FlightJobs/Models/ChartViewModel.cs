using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class ChartViewModel
    {
        public Dictionary<string, double> Data { get; set; }

        public double PayamentTotal { get; set; }

        public double PayamentMonthGoal { get; set; }
    }
}