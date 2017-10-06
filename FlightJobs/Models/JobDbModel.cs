using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class JobDbModel
    {
        [DisplayName("Departure")]
        public string DepartureICAO { get; set; }

        [DisplayName("Destination")]
        public string ArrivalICAO { get; set; }

        [DisplayName("Distance")]
        public long Dist { get; set; }

        [DisplayName("POB")]
        public long Pax { get; set; }

        [DisplayName("Cargo")]
        public long Cargo { get; set; }

        [DisplayFormat(DataFormatString = "{0:C0}")]
        [DisplayName("Pay")]
        public long Pay { get; set; }


        public bool FirstClass { get; set; }
    }
}