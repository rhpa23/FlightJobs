using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class AirlineTO
    {
        public string UserId { get; set; }
        public AirlineDbModel Airline { get; set; }
    }
}