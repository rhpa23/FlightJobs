using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightJobs.Domain.Navdata.Utils
{
    public class DataConversionUtil
    {
        public static string WeightUnitCookie = "weight.unit.cookie";
        public static string WeightPounds = "Pounds";
        public static string WeightKilograms = "Kilograms";
        public static string UnitPounds = " lbs";
        public static string UnitKilograms = " kg";

        public static double ConvertMetersToMiles(double meters)
        {
            return (meters / 1852);
        }

        public static double ConvertFeetToMeters(double fets)
        {
            return (fets * 0.3048);
        }

        public static int ConvertKilogramsToPounds(long kg)
        {
            return Convert.ToInt32(kg * 2.20462);
        }

        internal static int ConvertPoundsToKilograms(long lbs)
        {
            return Convert.ToInt32(lbs / 2.20462);
        }
    }
}
