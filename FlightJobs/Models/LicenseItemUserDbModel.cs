using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class LicenseItemUserDbModel
    {
        public long Id { get; set; }

        public virtual ApplicationUser User { get; set; }

        public PilotLicenseItemDbModel PilotLicenseItem { get; set; }

        public bool IsBought { get; set; }
    }
}