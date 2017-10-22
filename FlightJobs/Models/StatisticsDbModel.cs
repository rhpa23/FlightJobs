using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class StatisticsDbModel
    {
        [Key]
        public int Id { get; set; }

        public virtual ApplicationUser User { get; set; }

        public virtual AirlineDbModel Airline { get; set; }

        [DisplayFormat(DataFormatString = "{0:C0}")]
        [DisplayName("Bank balance")]
        public long BankBalance { get; set; }

        [DisplayFormat(DataFormatString = "{0:G0}")]
        [DisplayName("Pilot score")]
        public long PilotScore { get; set; }

        [DisplayName("Logo")]
        public string Logo { get; set; }

        [NotMapped]
        [DisplayName("Number of flights")]
        public long NumberFlights { get; set; }

        [NotMapped]
        [DisplayName("Flight time")]
        public string FlightTimeTotal { get; set; }

        [NotMapped]
        [DisplayName("Payload carried")]
        public long PayloadTotal { get; set; }

        [NotMapped]
        [DisplayFormat(DataFormatString = "{0:yyyy/MM/dd HH:mm}")]
        [DisplayName("Last flight")]
        public DateTime LastFlight { get; set; }

        [NotMapped]
        [DisplayName("Last aircraft")]
        public string LastAircraft { get; set; }

        [NotMapped]
        [DisplayName("Favorite airplane")]
        public string FavoriteAirplane { get; set; }
    }
}