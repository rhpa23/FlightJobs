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

            string[] infoArray = airportInfo.Split(',');

            double lat = 0;
            double log = 0;
            if (!isPositionEmpty(infoArray))
            {
                lat = double.Parse(infoArray[3]);
                log = double.Parse(infoArray[4]);
            }

            AirportModel airportBase = new AirportModel()
            {
                ICAO = infoArray[1],
                IATA = "",
                Name = infoArray[2],
                City = infoArray[2],
                Country = "",
                Latitude = lat,
                Longitude = log,
                Altitude = string.IsNullOrEmpty(infoArray[5]) ? 0 : int.Parse(infoArray[5])
            };
            return airportBase;
        }

        private static bool isPositionEmpty(string[] infoArray)
        {
            return string.IsNullOrEmpty(infoArray[3]) || string.IsNullOrEmpty(infoArray[4]);
        }

    }
}
