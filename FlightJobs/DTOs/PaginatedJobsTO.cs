using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class PaginatedJobsTO
    {
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool IsFirstPage { get; set; }
        public bool IsLastPage { get; set; }
        public int PageCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalItemCount { get; set; }
        public IList<JobDbModel> Jobs { get; set; }
    }
}