﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace FlightJobs.Util
{
    public class DataConversion
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
