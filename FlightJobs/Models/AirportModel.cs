using FlightJobs.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class AirportModel
    {
        public string ICAO { get; set; }
        public string IATA { get; set; }
        public string Name { get; set; }
        public string City { get; set; }
        public string Country { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public int RunwaySize { get; set; }

        public int Elevation { get; set; }

        public int Trasition { get; set; }

        /*public List<AirportModel> GetAll()
        {
            var data = new LocalDataBase();
            var allBases = data.SelectAllBase();

            var lstResult = new List<AirportModel>();
            foreach (var myBase in allBases)
            {
                lstResult.Add(AirportDatabaseFile.FindAirportInfo(myBase.ICAO));
            }

            return lstResult;
        }

        public void Insert()
        {
            var myBase = AirportDatabaseFile.FindAirportInfo(ICAO);
            if (myBase != null)
            {
                new LocalDataBase().InsertBase(myBase);
            }
            else
            {
                throw new NotFoundException();
            }
        }


        public void Delete()
        {
            var myBase = AirportDatabaseFile.FindAirportInfo(ICAO);
            if (myBase != null)
            {
                new LocalDataBase().DeleteBase(myBase);
            }
            else
            {
                throw new NotFoundException();
            }
        }*/
    }
}