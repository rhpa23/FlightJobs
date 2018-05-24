using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class PilotLicenseItemDbModel
    {
        public long Id { get; set; }

        public string Name { get; set; }

        public PilotLicenseExpensesDbModel PilotLicenseExpense { get; set; }

        public long Price { get; set; }

        public string Image { get; set; }

    }
}