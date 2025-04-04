﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class PilotLicenseExpensesUserDbModel
    {
        public long Id { get; set; }

        public virtual ApplicationUser User { get; set; }

        public PilotLicenseExpensesDbModel PilotLicenseExpense { get; set; }

        public DateTime MaturityDate { get; set; }

        public bool OverdueProcessed { get; set; }

        [NotMapped]
        public IList<LicenseItemUserDbModel> LicenseItems { get; set; } = new List<LicenseItemUserDbModel>();
    }
}