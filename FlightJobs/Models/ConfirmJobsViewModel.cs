using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class ConfirmJobsViewModel
    {
        public IList<JobDbModel> JobsList { get; set; }

        public long TotalPax { get; set; }

        public long TotalCargo { get; set; }

        public string TotalPay { get; set; }

        public string TotalPayload { get; set; }

    }
}