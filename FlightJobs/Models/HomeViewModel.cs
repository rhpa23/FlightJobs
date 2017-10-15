using PagedList;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class HomeViewModel
    {
        public IPagedList<JobDbModel> Jobs { get; set; }

        public StatisticsDbModel Statistics { get; set; }
    }
}