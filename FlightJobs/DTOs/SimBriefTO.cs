using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class SimBriefTO
    {
        [JsonProperty("origin")]
        public AirportInfo DepartureICAO { get; set; }

        [JsonProperty("destination")]
        public AirportInfo ArrivalICAO { get; set; }

        [JsonProperty("alternate")]
        public AirportInfo AlternativeICAO { get; set; }
    }

    public class AirportInfo
    {
        [JsonProperty("icao_code")]
        public string IcaoCode { get; set; }
    }
}