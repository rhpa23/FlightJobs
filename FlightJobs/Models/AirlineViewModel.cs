using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FlightJobs.Models
{
    public class AirlineViewModel
    {
        [Key]
        public int Id { get; set; }

        [Remote("AirlineNameAvailable", "Airlines", ErrorMessage = "Airline name already used.")]
        [StringLength(20, ErrorMessage = "Maximum lenght is 20 characters")]
        [Required(ErrorMessage = "Name is required")]
        [DisplayName("Airline name")]
        public string Name { get; set; }

        [StringLength(35, ErrorMessage = "Maximum lenght is 35 characters")]
        [Required(ErrorMessage = "Country is required")]
        [DisplayName("Country (headquarters office)")]
        public string Country { get; set; }

        [Required(ErrorMessage = "Score is required")]
        [DisplayName("Score required to sign contract")]
        public long Score { get; set; }

        [DisplayName("Require Certificates")]
        public bool RequireCertificates { get; set; }

        [Required(ErrorMessage = "Airline logo is required")]
        public IEnumerable<HttpPostedFileBase> FilesInput { get; set; }

        public string LogoPath { get; set; }
    }
}