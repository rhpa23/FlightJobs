﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class CustomPlaneCapacityDbModel
    {
        [Key]
        public long Id { get; set; }

        public virtual ApplicationUser User { get; set; }

        [DisplayName("Passenger capacity")]
        [Required(ErrorMessage = "Passenger capacity is required")]
        public int CustomPassengerCapacity { get; set; }

        [DisplayName("Cargo capacity weight")]
        [Required(ErrorMessage = "Cargo capacity weight is required")]
        public int CustomCargoCapacityWeight { get; set; }

        [DisplayName("Capacity name")]
        [Required(ErrorMessage = "Capacity name is required")]
        public string CustomNameCapacity { get; set; }
    }
}