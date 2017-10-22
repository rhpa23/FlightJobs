using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class AirlineCertificatesDbModel
    {
        [Key]
        public int Id { get; set; }

        public AirlineDbModel Airline { get; set; }

        public CertificateDbModel Certificate { get; set; }
    }
}