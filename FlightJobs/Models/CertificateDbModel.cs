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
    public class CertificateDbModel
    {
        [Key]
        public int Id { get; set; }

        [DisplayName("Name")]
        public string Name { get; set; }

        [DisplayName("Price")]
        public long Price { get; set; }

        [DisplayName("Score")]
        public long Score { get; set; }

        [DisplayName("Logo")]
        public string Logo { get; set; }

        [NotMapped]
        [DisplayName("")]
        public bool Selected { get; set; }
    }
}