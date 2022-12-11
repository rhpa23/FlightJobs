using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class JobListModel
    {
        public int Id { get; set; }

        public AirportModel Departure { get; set; }
        public AirportModel Arrival { get; set; }

        public long Dist { get; set; }
        public string PayloadView { get; set; }
        public string PayloadLabel { get; set; }
        public long Pax { get; set; }
        public long Cargo { get; set; }

        public string PaxSummary { get; set; }
        public string CargoSummary { get; set; }

        [DisplayFormat(DataFormatString = "F{0:C0}")]
        public long Pay { get; set; }
        public bool FirstClass { get; set; }

        public bool Selected { get; set; }

        public bool IsCargo { get; set; }

        public string AviationType { get; set; }
    }
}