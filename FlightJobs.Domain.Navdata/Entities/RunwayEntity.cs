using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightJobs.Domain.Navdata.Entities
{
    public class RunwayEntity
    {
        public string Name { get; set; }
        public long RunwayId { get; set; }
        public string Surface { get; set; }
        public double Length { get; set; }
        public double Width { get; set; }
        public double HeadingTrue { get; set; }
        public double PrimaryLonx { get; set; }
        public double PrimaryLaty { get; set; }
        public double SecondaryLonx { get; set; }
        public double SecondaryLaty { get; set; }
        public long Altitude { get; set; }
        public double Lonx { get; set; }
        public double Laty { get; set; }
        public double OffsetThreshold { get; set; }
        public string EndType { get; set; }
    }
}
