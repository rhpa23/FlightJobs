using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class SearchJobTipsViewModel
    {
        [Display(Name = "ICAO")]
        public string AirportICAO { get; set; }

        [Display(Name = "Name")]
        public string AirportName { get; set; }

        [Display(Name = "Runway Length")]
        public int AirportRunwaySize { get; set; }

        [Display(Name = "Elevation")]
        public int AirportElevation { get; set; }

        [Display(Name = "Trasition")]
        public int AirportTrasition { get; set; }

        public int Distance { get; set; }

        public int Pax { get; set; }

        public int Cargo { get; set; }

        public int Payload { get; set; }

        public int Pay { get; set; }

    }
}