using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class GeneralInfoViewModel
    {
        public int UsersCount { get; set; }

        public int JobsInProgress { get; set; }

        public long JobsDone { get; set; }

        public long JobsActive { get; set; }

        [DisplayFormat(DataFormatString = "{0:C0}")]
        public long UsersBankBalance { get; set; }

    }
}