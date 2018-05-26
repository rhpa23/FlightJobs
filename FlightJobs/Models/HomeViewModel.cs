using PagedList;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class HomeViewModel
    {
        public IPagedList<JobDbModel> Jobs { get; set; }

        public StatisticsDbModel Statistics { get; set; }

        [DisplayName("Departure")]
        public string DepartureFilter { get; set; }

        [DisplayName("Arrival")]
        public string ArrivalFilter { get; set; }

        [DisplayName("Model description")]
        public string ModelDescriptionFilter { get; set; }

        public string PilotStatisticsDescription { get; set; }

    }
}