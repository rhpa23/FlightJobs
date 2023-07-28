using FlightJobs.Domain.Navdata.Entities;
using FlightJobs.Domain.Navdata.Interface;
using FlightJobs.Domain.Navdata.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightJobs.Domain.Navdata.Helpers
{
    public class RunwayHelper
    {
        private double _heading;
        private double _latitude;
        private double _longitude;

        public RunwayHelper(double heading, double latitude, double longitude)
        {
            _heading = heading;
            _latitude = latitude;
            _longitude = longitude;
        }

        public RunwayEntity GetRunway(IList<RunwayEntity> runways)
        {
            RunwayEntity rwyResult = runways[0];
            double centerDistance = 100000;
            foreach (var rwy in runways)
            {
                int range = 30;
                var headingRangeA = rwy.HeadingTrue + range;// > 360 ? rwy.HeadingTrue + range - 360 : rwy.HeadingTrue + range;
                var headingRangeB = rwy.HeadingTrue - range;// < 0 ? 360 - rwy.HeadingTrue - range : rwy.HeadingTrue - range;
                var planeHeading = (_heading - 3) < 0 ? 360 : _heading; // check when Rwy36

                if (planeHeading <= headingRangeA &&
                    planeHeading >= headingRangeB)
                {
                    double tempCenterDistance = GetCenterLineDistance(rwy);
                    if (tempCenterDistance < centerDistance)
                    {
                        rwyResult = rwy;
                    }
                    centerDistance = tempCenterDistance;
                }

            }
            return rwyResult;
        }

        public double GetRunwayLength(RunwayEntity rwy)
        {
            return GeoCalculationsUtil.CalcDistance(rwy.PrimaryLaty, rwy.PrimaryLonx, rwy.SecondaryLaty, rwy.SecondaryLonx);
        }

        public double GetCenterLineDistance(RunwayEntity rwy)
        {
            var rwyLen = GetRunwayLength(rwy);
            var distP = GeoCalculationsUtil.CalcDistance(rwy.PrimaryLaty, rwy.PrimaryLonx, _latitude, _longitude);
            var distS = GeoCalculationsUtil.CalcDistance(rwy.SecondaryLaty, rwy.SecondaryLonx, _latitude, _longitude);

            return Math.Round(GeoCalculationsUtil.GetTriangleHeight(rwyLen, distP, distS), 1);
        }

        public AirportEntity GetJobAirport(ISqLiteDbContext sqLiteDbContext, string icao, string alternativeICAO)
        {
            var airport = sqLiteDbContext.GetAirportByIcao(icao);
            if (GeoCalculationsUtil.CheckClosestLocation(_latitude, _longitude, airport.Laty, airport.Lonx))
            {
                return airport;
            }
            else
            {
                if (alternativeICAO == null) return null;

                var aptAlternative = sqLiteDbContext.GetAirportByIcao(alternativeICAO);
                if (GeoCalculationsUtil.CheckClosestLocation(_latitude, _longitude, aptAlternative.Laty, aptAlternative.Lonx))
                {
                    return aptAlternative;
                }
            }
            return null;
        }

        public double GetTouchdownThresholdDistance(RunwayEntity rwy)
        {
            var rwyLat = rwy.PrimaryLaty;
            var rwyLon = rwy.PrimaryLonx;

            if (rwy.EndType == "S") // P = Primary    S = Secondary
            {
                rwyLat = rwy.SecondaryLaty;
                rwyLon = rwy.SecondaryLonx;
            }
            var offsetThresholdMeters = DataConversionUtil.ConvertFeetToMeters(rwy.OffsetThreshold);

            var dist = GeoCalculationsUtil.CalcDistance(rwyLat, rwyLon, _latitude, _longitude) - offsetThresholdMeters;

            return Math.Round(dist, 0);
        }
    }
}
