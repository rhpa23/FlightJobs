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
        [DisplayName("Departing from")]
        [Required(ErrorMessage = "An Departure ICAO is required")]
        public string Departure { get; set; }

        [DisplayName("Specify destination")]
        public string Arrival { get; set; }

        [DisplayName("Destinations between")]
        [Required(ErrorMessage = "An Range in nautical mile is required")]
        public long MinRange { get; set; }

        [Required(ErrorMessage = "An Range in nautical mile is required")]
        public long MaxRange { get; set; }

        [DisplayName("Is general aviation?")]
        public bool IsGeneralAviation { get; set; }
    }
}