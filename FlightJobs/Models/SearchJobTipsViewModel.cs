using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class SearchJobTipsViewModel
    {
        public string AirportICAO { get; set; }

        public string AirportName { get; set; }

        public int AirportRunwaySize { get; set; }

        public int AirportElevation { get; set; }

        public int AirportTrasition { get; set; }

        public int Distance { get; set; }

        public int Pax { get; set; }

        public int Cargo { get; set; }

        public int Payload { get; set; }

        public int Pay { get; set; }

    }
}