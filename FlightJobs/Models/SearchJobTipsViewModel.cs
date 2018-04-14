using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class SearchJobTipsViewModel
    {
        public long IdJob { get; set; }

        [Display(Name = "ICAO")]
        public string AirportICAO { get; set; }

        [Display(Name = "Name")]
        public string AirportName { get; set; }

        [Display(Name = "Rwy Length")]
        public int AirportRunwaySize { get; set; }

        [Display(Name = "Elevation")]
        public int AirportElevation { get; set; }

        [Display(Name = "Trasition")]
        public int AirportTrasition { get; set; }

        public long Distance { get; set; }

        public long Pax { get; set; }

        public long Cargo { get; set; }

        public long Payload { get; set; }

        public long Pay { get; set; }

    }
}