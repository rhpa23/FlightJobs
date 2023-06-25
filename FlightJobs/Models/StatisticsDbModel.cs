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

        [DisplayFormat(DataFormatString = "F{0:C0}")]
        [DisplayName("Bank balance")]
        public long BankBalance { get; set; }

        [DisplayFormat(DataFormatString = "{0:G0}")]
        [DisplayName("Score")]
        public long PilotScore { get; set; }

        [DisplayName("Logo")]
        public string Logo { get; set; }

        [DisplayName("Send expired license warning email")]
        public bool SendLicenseWarning { get; set; }

        [DisplayName("Send debt warning email")]
        public bool SendAirlineBillsWarning { get; set; }

        [DisplayName("License e-mail warning sent flag")]
        public bool LicenseWarningSent { get; set; }

        [DisplayName("Airline bills e-mail warning sent flag")]
        public bool AirlineBillsWarningSent { get; set; }

        [DisplayName("User custom plane capacity ")]
        public virtual CustomPlaneCapacityDbModel CustomPlaneCapacity { get; set; }

        [DisplayName("User custom plane capacity ")]
        public bool UseCustomPlaneCapacity { get; set; }

        [NotMapped]
        [DisplayName("Number of flights")]
        public long NumberFlights { get; set; }

        [NotMapped]
        [DisplayName("Flight time")]
        public string FlightTimeTotal { get; set; }

        [NotMapped]
        [DisplayName("Payload carried")]
        public string PayloadTotal { get; set; }

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

        [NotMapped]
        [DisplayName("Pilots hired")]
        public List<StatisticsDbModel> AirlinePilotsHired { get; set; }

        [NotMapped]
        public string GraduationPath { get; set; }

        [NotMapped]
        public string GraduationDesc { get; set; }

        [NotMapped]
        public ChartViewModel ChartModel { get; set; }

        public Dictionary<string, long> DepartureRanking { get; set; }

        public Dictionary<string, long> DestinationRanking { get; set; }

        public string WeightUnit { get; set; }

        [NotMapped]
        public IList<PilotLicenseExpensesUserDbModel> LicensesOverdue { get; set; }
    }
}