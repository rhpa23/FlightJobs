using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class PilotLicenseExpensesDbModel
    {
        public long Id { get; set; }

        public string Name { get; set; }

        public int DaysMaturity { get; set; }

        public bool Mandatory { get; set; }
    }
}