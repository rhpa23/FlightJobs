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
        [DisplayName("Look for Jobs departing from")]
        [Required(ErrorMessage = "An Departure ICAO is required")]
        public string Departure { get; set; }

        [DisplayName("Specify destination")]
        public string Arrival { get; set; }

        [DisplayName("with destinations between")]
        [Required(ErrorMessage = "An Range in nautical mile is required")]
        public long MinRange { get; set; }

        [DisplayName("and xxx miles away.")]
        [Required(ErrorMessage = "An Range in nautical mile is required")]
        public long MaxRange { get; set; }
    }
}