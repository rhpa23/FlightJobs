using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace FlightJobs.DTOs
{
    public class CapacityTO
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int CustomPassengerCapacity { get; set; }
        public int CustomCargoCapacityWeight { get; set; }
        public string CustomNameCapacity { get; set; }
        public long CustomPaxWeight { get; set; }
        public string ImagePath { get; set; }
        
    }
}