using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class AirlineFboView
    {
        public List<AirlineFboDbModel> FboHired { get; set; }
        public List<AirlineFboDbModel> FboResults { get; set; }

        public AirlineDbModel CurrentAirline { get; set; }
    }
}