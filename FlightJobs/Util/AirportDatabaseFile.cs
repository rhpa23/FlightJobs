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
        /*

           Airport Tuple contains the following pieces of information:

           01.)Airport ICAO Code (4)
           02.)Airport IATA (3)
           03.)Airport Name (?)
           04.)City or Town or Suburb (?)
           05.)Country (?)
           06.)Latitude Degrees (2)
           07.)Latitude Minutes (2)
           08.)Latitude Seconds (2)
           09.)Latitude Direction (2)
           10.)Longitude Degrees (1)
           11.)Longitude Minutes (2)
           12.)Longitude Seconds (2)
           13.)Longitude Direction (1)
           14.)Altitude (?)

        */

        private static string fileName = HttpContext.Current.Server.MapPath("~/App_Data/GlobalAirportDatabase.txt"); 

        public static AirportModel FindAirportInfo(string code)
        {
            var lines = File.ReadLines(fileName);
            var airportInfo = lines.First(line => Regex.IsMatch(line, "(^"+ code.ToUpper() +".*$)"));
            Console.WriteLine(airportInfo);

            string[] infoArray = airportInfo.Split(':');

            double lat = 0;
            double log = 0;
            if (!isPositionEmpty(infoArray))
            {
                lat = double.Parse(infoArray[5] + CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator + infoArray[6] + infoArray[7]);
                log = double.Parse(infoArray[9] + CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator + infoArray[10] + infoArray[11]);

                if ("S".Equals(infoArray[8])) lat = lat * -1;

                if ("U".Equals(infoArray[12])) log = log * -1;
            }

            AirportModel airportBase = new AirportModel()
            {
                ICAO = infoArray[0],
                IATA = infoArray[1],
                Name = infoArray[2],
                City = infoArray[3],
                Country = infoArray[4],
                Latitude = lat,
                Longitude = log,
                Altitude = string.IsNullOrEmpty(infoArray[13]) ? 0 : int.Parse(infoArray[13])
            };
            return airportBase;
        }

        public static List<AirportModel> GetAllAirportInfo()
        {
            var list = new List<AirportModel>();
            foreach (var airportInfo in File.ReadLines(fileName))
            {
                try
                {
                    string[] infoArray = airportInfo.Split(':');

                    double lat = 0;
                    double log = 0;
                    if (!isPositionEmpty(infoArray))
                    {
                        lat = double.Parse(infoArray[5] + CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator + infoArray[6] + infoArray[7]);
                        log = double.Parse(infoArray[9] + CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator + infoArray[10] + infoArray[11]);

                        if ("S".Equals(infoArray[8])) lat = lat * -1;

                        if ("U".Equals(infoArray[12])) log = log * -1;
                    }

                    AirportModel airportBase = new AirportModel()
                    {
                        ICAO = infoArray[0],
                        IATA = infoArray[1],
                        Name = infoArray[2],
                        City = infoArray[3],
                        Country = infoArray[4],
                        Latitude = lat,
                        Longitude = log,
                        Altitude = string.IsNullOrEmpty(infoArray[13]) ? 0 : int.Parse(infoArray[13])
                    };
                    list.Add(airportBase);
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
            return string.IsNullOrEmpty(infoArray[5]) || string.IsNullOrEmpty(infoArray[6]) || string.IsNullOrEmpty(infoArray[7]) &&
                    string.IsNullOrEmpty(infoArray[9]) || string.IsNullOrEmpty(infoArray[10]) || string.IsNullOrEmpty(infoArray[11]);
        }

    }
}
