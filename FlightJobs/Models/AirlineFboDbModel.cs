using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class AirlineFboDbModel
    {
        [Key]
        public long Id { get; set; }
        public string Icao { get; set; }

        [NotMapped]
        public string Name { get; set; }

        [NotMapped]
        public int RunwaySize { get; set; }

        [NotMapped]
        public int Elevation { get; set; }


        public AirlineDbModel Airline { get; set; }

        public int Availability { get; set; }
        public int ScoreIncrease { get; set; }
        public double FuelPriceDiscount { get; set; }
        public double GroundCrewDiscount { get; set; }
        public int Price { get; set; }


    }
}