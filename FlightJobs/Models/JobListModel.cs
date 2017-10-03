using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class JobListModel
    {
        public AirportModel Departure { get; set; }
        public string Arrival { get; set; }
        public long Dist { get; set; }
        public long Pax { get; set; }
        public long Cargo { get; set; }

        [DisplayFormat(DataFormatString = "{0:C0}")]
        public long Pay { get; set; }
        public bool FirstClass { get; set; }

        public bool Selected { get; set; }
    }
}