using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

namespace FlightJobs.Util
{
    public class AirportDatabaseFile
    {
        private static string fileName = HttpContext.Current.Server.MapPath("~/App_Data/GlobalAirportDatabase.txt"); 

        public static AirportModel FindAirportInfo(string code)
        {
            //A,EDDS,STUTTGART,48.689878,9.221964,1276,5000,0,10900,0

            var lines = File.ReadLines(fileName);
            var airportInfo = lines.First(line => Regex.IsMatch(line, "(^A,"+ code.ToUpper() +".*$)"));
            Console.WriteLine(airportInfo);

            return BindModel(airportInfo);
        }

        private static AirportModel BindModel(string line)
        {
            string[] lineArray = line.Split(',');

            double lat = 0;
            double log = 0;
            if (!isPositionEmpty(lineArray))
            {
                lat = double.Parse(lineArray[3]);
                log = double.Parse(lineArray[4]);
            }

            AirportModel airportBase = new AirportModel()
            {
                ICAO = lineArray[1],
                IATA = "",
                Name = lineArray[2],
                City = lineArray[2],
                Country = "",
                Latitude = lat,
                Longitude = log,
                Elevation = string.IsNullOrEmpty(lineArray[5]) ? 0 : int.Parse(lineArray[5]),
                Trasition = string.IsNullOrEmpty(lineArray[6]) ? 0 : int.Parse(lineArray[6]),
                RunwaySize = string.IsNullOrEmpty(lineArray[8]) ? 0 : int.Parse(lineArray[8]),
            };
            return airportBase;
        }

        public static List<AirportModel> GetAllAirportInfo()
        {
            var list = new List<AirportModel>();
            foreach (var airportInfo in File.ReadLines(fileName).Where(s => s.StartsWith("A,")))
            {
                try
                {
                    var model = BindModel(airportInfo);

                    list.Add(model);
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
            return list;
        }

        private static bool isPositionEmpty(string[] infoArray)
        {
            return string.IsNullOrEmpty(infoArray[3]) || string.IsNullOrEmpty(infoArray[4]);
        }

    }
}
