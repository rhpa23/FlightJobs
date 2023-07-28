using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightJobs.Domain.Navdata.Entities
{
    public class AirportEntity
    {
        public IList<RunwayEntity> Runways { get; set; } = new List<RunwayEntity>();
        public long AirportId { get; set; }
        public string Ident { get; set; }
        public string Name { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public long HasAvgas { get; set; }
        public long HasJetfuel { get; set; }
        public long IsMilitary { get; set; }
        public long LongestRunwayLength { get; set; }
        public long LongestRunwayWidth { get; set; }
        public double LongestRunwayHeading { get; set; }
        public string LongestRunwaySurface { get; set; }
        public long NumRunways { get; set; }
        public double MagVar { get; set; }
        public long Altitude { get; set; }
        public double Lonx { get; set; }
        public double Laty { get; set; }
    }
}
