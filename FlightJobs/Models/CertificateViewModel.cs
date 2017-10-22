using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class CertificateViewModel
    {
        public List<CertificateDbModel> Certificates { get; set; }

        public StatisticsDbModel Statistic { get; set; }

        public AirlineDbModel Airline { get; set; }
    }
}