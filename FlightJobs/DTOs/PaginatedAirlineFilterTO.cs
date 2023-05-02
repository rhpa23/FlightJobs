using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class PaginatedAirlineFilterTO
    {
        public string Name { get; set; }
        public string Country { get; set; }
        public string UserId { get; set; }
    }
}