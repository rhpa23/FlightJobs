using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class StatisticsDbModel
    {
        [Key]
        public int Id { get; set; }

        public virtual ApplicationUser User { get; set; }

        [DisplayName("Bank balance")]
        public int BankBalance { get; set; }

        [DisplayName("Last flight")]
        public DateTime LastFlight { get; set; }

        [DisplayName("Pilot score")]
        public int PilotScore { get; set; }

        [DisplayName("Hours flown")]
        public int MinutesFlown { get; set; }

        [DisplayName("Miles flown")]
        public int MilesFlown { get; set; }

        [DisplayName("Number of flights")]
        public int NumberFlights { get; set; }

        
    }
}