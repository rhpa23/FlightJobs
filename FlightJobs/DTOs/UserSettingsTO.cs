using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class UserSettingsTO
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string WeightUnit { get; set; }
        public string Password { get; set; }
        public bool ReceiveAlertEmails { get; set; }
    }
}