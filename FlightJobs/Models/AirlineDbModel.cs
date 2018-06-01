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

        //[Required(ErrorMessage = "Name is required")]
        [DisplayName("Name")]
        public string Name { get; set; }

        [DisplayName("Description")]
        public string Description { get; set; }

        //[Required(ErrorMessage = "Country is required")]
        [DisplayName("Country")]
        public string Country { get; set; }

        [DisplayName("Salary")]
        public long Salary { get; set; }

        [DisplayName("Score")]
        public long Score { get; set; }

        [DisplayName("Logo")]
        public string Logo { get; set; }

        [DisplayFormat(DataFormatString = "{0:C0}")]
        [DisplayName("Bank balance")]
        public long BankBalance { get; set; }

        [DisplayName("Airline score")]
        public long AirlineScore { get; set; }

        [NotMapped]
        public bool AlowEdit { get; set; }

        public string UserId { get; set; }

        [NotMapped]
        public string OwnerNickname { get; set; }

        [DisplayName("Airline debt")]
        public long DebtValue { get; set; }

        [DisplayName("Debt maturity date")]
        public DateTime DebtMaturityDate { get; set; }
    }
}