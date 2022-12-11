using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class GeneralInfoViewModel
    {
        public int UsersCount { get; set; }

        public int JobsInProgress { get; set; }

        public long JobsDone { get; set; }

        public long JobsActive { get; set; }

        [DisplayFormat(DataFormatString = "F{0:C0}")]
        public long UsersBankBalance { get; set; }

        public string JobsDoneCurrentMonth { get; set; }

        public Dictionary<string, long> ModelRanking { get; set; }

        public Dictionary<string, long> UsersRankingScore { get; set; }

        public List<string> UsersRankingCash { get; set; }

        public List<string> UsersRankingGraduation { get; set; }

        public Dictionary<string, long> AirlineRankingScore { get; set; }

        public List<string> AirlineRankingCash { get; set; }

        public Dictionary<string, long> DepartureRanking { get; set; }

        public Dictionary<string, long> DestinationRanking { get; set; }

        public Dictionary<string, long> AviationTypeRanking { get; set; }

        public Dictionary<string, double> AirlinesChart { get; set; }



    }
}