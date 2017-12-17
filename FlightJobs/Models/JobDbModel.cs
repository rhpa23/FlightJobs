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
        [NotMapped]
        internal static int PaxWeight = 84;

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
                return (Pax * PaxWeight) + Cargo;
            }
        }

        [NotMapped]
        [DisplayName("Flight time")]
        public string FlightTime
        {
            get
            {
                TimeSpan span = (EndTime - StartTime);

                return String.Format("{0:00}:{1:00}", span.Hours, span.Minutes);
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

        [DisplayFormat(DataFormatString = "{0:yyyy/MM/dd}")]
        public DateTime StartTime { get; set; }

        [DisplayFormat(DataFormatString = "{0:yyyy/MM/dd}")]
        public DateTime EndTime { get; set; }

        [DisplayName("Registration")]
        public string ModelName { get; set; }

        [DisplayName("Model")]
        public string ModelDescription { get; set; }

        [DisplayName("Fuel weight")]
        public long StartFuelWeight { get; set; }

        [DisplayName("Fuel weight")]
        public long FinishFuelWeight { get; set; }

        [NotMapped]
        [DisplayName("Burned fuel")]
        public string UsedFuelWeight {
            get {
                return (StartFuelWeight - FinishFuelWeight) + "kg";
            }
        }

        public virtual ApplicationUser User { get; set; }
    }
}