using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class PaginatedJobsFilterTO
    {
        public string DepartureICAO { get; set; }
        public string ArrivalICAO { get; set; }
        public string ModelDescription { get; set; }
        public string UserId { get; set; }
    }
}