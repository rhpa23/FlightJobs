﻿using FlightJobs.Enums;
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
        
        public int PaxWeight { get; set; }

        [Key]
        public int Id { get; set; }

        [DisplayName("Departure")]
        public string DepartureICAO { get; set; }

        [DisplayName("Destination")]
        public string ArrivalICAO { get; set; }

        [DisplayName("Alternative")]
        public string AlternativeICAO { get; set; }

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
                if (PaxWeight > 0)
                {
                    return (Pax * PaxWeight) + Cargo;
                }
                else
                {
                    return (Pax * 84) + Cargo;
                }
            }
        }

        [NotMapped]
        [DisplayName("Payload")]
        public long PayloadDisplay { get; set; }

        [NotMapped]
        [DisplayName("Pax payload")]
        public long PayloadPax
        {
            get
            {
                if (PaxWeight > 0)
                {
                    return (Pax * PaxWeight);
                }
                else
                {
                    return (Pax * 84);
                }
            }
        }

        [NotMapped]
        [DisplayName("Pax payload")]
        public long PayloadPaxDisplay { get; set; }

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

        [NotMapped]
        public int FlightTimeHours
        {
            get
            {
                TimeSpan span = (EndTime - StartTime);
                return span.Hours;
            }
        }

        [DisplayFormat(DataFormatString = "F{0:C0}")]
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

        [NotMapped]
        [DisplayName("Fuel weight")]
        public long StartFuelWeightDisplay { get; set; }

        [DisplayName("Fuel weight")]
        public long FinishFuelWeight { get; set; }

        public int AviationType { get; set; }

        [NotMapped]
        [DisplayName("Burned fuel")]
        public long UsedFuelWeight {
            get {
                return (StartFuelWeight - FinishFuelWeight);
            }
        }

        [NotMapped]
        [DisplayName("Burned fuel")]
        public long UsedFuelWeightDisplay { get; set; }

        [NotMapped]
        [DisplayFormat(DataFormatString = "{0:yyyy/MM}")]
        public string Month
        {
            get { return this.StartTime.ToString("MMM/yyyy"); }
        }

        public virtual ApplicationUser User { get; set; }

        [DisplayName("Video URL")]
        public string VideoUrl { get; set; }

        [DataType(DataType.MultilineText)]
        [DisplayName("Video description")]
        public string VideoDescription { get; set; }

        public string ChallengeCreatorUserId { get; set; }

        public bool IsChallenge { get; set; }

        [NotMapped]
        public bool IsChallengeFromCurrentUser { get; set; }

        public DateTime ChallengeExpirationDate { get; set; }

        public ChallengeTypeEnum ChallengeType { get; set; }

        [NotMapped]
        public string WeightUnit { get; set; }

        public long PilotScore { get; set; }

        public static JobDbModel Clone(JobDbModel job, ApplicationUser user)
        {
            return new JobDbModel()
            {
                AlternativeICAO = job.AlternativeICAO,
                DepartureICAO = job.DepartureICAO,
                ArrivalICAO = job.ArrivalICAO,
                Cargo = job.Cargo,
                Dist = job.Dist,
                FirstClass = job.FirstClass,
                Pax = job.Pax,
                Pay = job.Pay,
                PilotScore = job.PilotScore,
                User = user,
                StartTime = DateTime.Now,
                EndTime = DateTime.Now,
                ChallengeExpirationDate = DateTime.Now
            };
        }
    }
}