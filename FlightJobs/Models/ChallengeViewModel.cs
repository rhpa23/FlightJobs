using FlightJobs.Enums;
using PagedList;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class ChallengeViewModel
    {
        [DisplayName("Departure")]
        public string DepartureICAO { get; set; }

        [DisplayName("Destination")]
        public string ArrivalICAO { get; set; }

        [DisplayName("Distance")]
        public long Dist { get; set; }

        [DisplayName("Pax")]
        public long Pax { get; set; }

        [DisplayName("Pax weight")]
        public long PaxWeight { get; set; }

        [DisplayName("Cargo")]
        public long Cargo { get; set; }

        public int JobId { get; set; }

        public int UserActiveChallenges { get; set; }

        public IPagedList<JobDbModel> Challenges { get; set; }

        public string WaterMarkImg { get; set; }

        public long TotalPayment { get; set; }

        public long PaymentCaptain
        {
            get
            {
                return Convert.ToInt64(TotalPayment * 0.95);
            } 
        }

        public long PaymentCreator
        {
            get
            {
                return Convert.ToInt64(TotalPayment * 0.05);
            }
        }

        public long TotalPayload
        {
            get
            {
                return (Pax * PaxWeight) + Cargo;
            }
        }

        public string Type { get; set; }

        public string WeightUnit { get; set; }

        public string Briefing { get; set; }
    }
}