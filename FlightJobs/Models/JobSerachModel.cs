using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class JobSerachModel
    {
        //[StringLength(4)]
        [DisplayName("Departure")]
        [Required(ErrorMessage = "Departure is required")]
        [StringLength(4, MinimumLength = 4, ErrorMessage = "Minimum 4 characters required")]
        public string Departure { get; set; }

        [DisplayName("Destination")]
        [Required(ErrorMessage = "Destination is required")]
        [StringLength(4, MinimumLength = 4, ErrorMessage = "Minimum 4 characters required")]
        public string Arrival { get; set; }

        [DisplayName("Alternative")]
        [StringLength(4, MinimumLength = 4, ErrorMessage = "Minimum 4 characters required")]
        public string Alternative { get; set; }

        [DisplayName("Distance Range")]
        [Required(ErrorMessage = "An Range in nautical mile is required")]
        public long MinRange { get; set; }

        [Required(ErrorMessage = "An Range in nautical mile is required")]
        public long MaxRange { get; set; }

        [DisplayName("Aviation type")]
        public string AviationType { get; set; }

        [DisplayName("Passenger weight")]
        [Required(ErrorMessage = "Passenger weight is required")]
        public long PassengerWeight { get; set; }

        [DisplayName("Passenger capacity")]
        [Required(ErrorMessage = "Passenger capacity is required")]
        [Range(0, 40, ErrorMessage = "Value for {0} must be between {1} and {2}")]
        public int GaPassengerCapacity { get; set; }

        [DisplayName("Cargo capacity weight")]
        [Required(ErrorMessage = "Cargo capacity weight is required")]
        //[Range(0, 1000, ErrorMessage = "Value for {0} must be between {1} and {2}")]
        public int GaCargoCapacityWeight { get; set; }

        [NotMapped]
        public string WeightUnit { get; set; }
    }
}