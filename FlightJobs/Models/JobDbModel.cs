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
    public class JobDbModel
    {
        [Key]
        public int Id { get; set; }

        [DisplayName("Departure")]
        public string DepartureICAO { get; set; }

        [DisplayName("Destination")]
        public string ArrivalICAO { get; set; }

        [DisplayName("Distance")]
        public long Dist { get; set; }

        [DisplayName("Pax")]
        public long Pax { get; set; }

        [DisplayName("Cargo")]
        public long Cargo { get; set; }

        [NotMapped]
        [DisplayName("Payload")]
        public long Payload
        {
            get
            {
                return (Pax * 70) + Cargo;
            }
        }

        [DisplayFormat(DataFormatString = "{0:C0}")]
        [DisplayName("Pay")]
        public long Pay { get; set; }

        public bool FirstClass { get; set; }

        public bool IsDone { get; set; }

        [DisplayName("")]
        public bool IsActivated { get; set; }

        [DisplayName("")]
        public bool InProgress { get; set; }

        [DisplayName("")]
        public DateTime StartTime { get; set; }

        [DisplayName("")]
        public DateTime EndTime { get; set; }

        [DisplayName("")]
        public string ModelName { get; set; }

        public virtual ApplicationUser User { get; set; }
    }
}