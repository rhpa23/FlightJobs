using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class JobSerachModel
    {
        [StringLength(4)]
        [Required(ErrorMessage = "An Departure ICAO is required")]
        public string Departure { get; set; }

        public string Arrival { get; set; }

        [DisplayName("Minimum NM")]
        [Required(ErrorMessage = "An Range in nautical mile is required")]
        public long MinRange { get; set; }

        [DisplayName("Maximum NM")]
        [Required(ErrorMessage = "An Range in nautical mile is required")]
        public long MaxRange { get; set; }
    }
}