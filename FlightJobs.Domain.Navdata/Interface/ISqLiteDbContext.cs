using FlightJobs.Domain.Navdata.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightJobs.Domain.Navdata.Interface
{
    public interface ISqLiteDbContext
    {
        IList<AirportEntity> GetAirportsByIcaoAndName(string term);
        AirportEntity GetAirportByIcao(string icao);
        IList<RunwayEntity> GetRunwaysByIcao(string icao);
    }
}
