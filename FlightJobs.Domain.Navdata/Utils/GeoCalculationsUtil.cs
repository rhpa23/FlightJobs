using System;
using System.Collections.Generic;
using System.Device.Location;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightJobs.Domain.Navdata.Utils
{
    public class GeoCalculationsUtil
    {
        private static SqLiteDbContext _sqLiteDbContext = new SqLiteDbContext();

        public static int CalcDistance(string departure, string arrival)
        {
            var departureInfo = _sqLiteDbContext.GetAirportByIcao(departure);
            var arrivalInfo = _sqLiteDbContext.GetAirportByIcao(arrival);
            if (departureInfo != null && arrivalInfo != null)
            {
                var departureCoord = new GeoCoordinate(departureInfo.Laty, departureInfo.Lonx);
                var arrivalCoord = new GeoCoordinate(arrivalInfo.Laty, arrivalInfo.Lonx);

                var distMeters = departureCoord.GetDistanceTo(arrivalCoord);
                var distMiles = (int)DataConversionUtil.ConvertMetersToMiles(distMeters);
                return distMiles;
            }
            return 0;
        }

        public static double CalcDistance(double actualLat, double actualLon, double verifyLat, double verifyLon)
        {
            var actualCoord = new GeoCoordinate(actualLat, actualLon);
            var verifyCoord = new GeoCoordinate(verifyLat, verifyLon);
            return verifyCoord.GetDistanceTo(actualCoord);
        }

        public static bool CheckClosestLocation(double actualLat, double actualLon, double verifyLat, double verifyLon)
        {
            return CalcDistance(actualLat, actualLon, verifyLat, verifyLon) < 10000;
        }

        public static double GetTriangleHeight(double triangleBase, double triangleSideA, double triangleSideB)
        {
            if (triangleBase <= 0 || triangleSideA <= 0 || triangleSideB <= 0) return 0;
            double semiPerimeter = (triangleBase + triangleSideA + triangleSideB) / 2;
            double height = 2 / triangleBase * Math.Sqrt(semiPerimeter * (semiPerimeter - triangleBase) * (semiPerimeter - triangleSideA) * (semiPerimeter - triangleSideB));
            return height;
        }
    }
}
