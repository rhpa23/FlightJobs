using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class AirlineDbModel
    {
        [Key]
        public int Id { get; set; }

        [DisplayName("Name")]
        public string Name { get; set; }

        [DisplayName("Country")]
        public string Country { get; set; }

        [DisplayName("Salary")]
        public long Salary { get; set; }

        [DisplayName("Score")]
        public long Score { get; set; }

        [DisplayName("Logo")]
        public string Logo { get; set; }
    }
}