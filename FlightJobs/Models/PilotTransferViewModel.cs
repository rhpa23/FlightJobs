using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class PilotTransferViewModel
    {
        public StatisticsDbModel Statistics { get; set; }

        [Display(Name = "Transfer percent")]
        public int PilotTransferPercent { get; set; }
    }
}