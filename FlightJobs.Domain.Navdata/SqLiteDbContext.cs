using FlightJobs.Domain.Navdata.Entities;
using FlightJobs.Domain.Navdata.Interface;
using FlightJobs.Domain.Navdata.Mapper;
using FlightJobs.Domain.Navdata.Utils;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.SQLite;
using System.Device.Location;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace FlightJobs.Domain.Navdata
{
    public class SqLiteDbContext : ISqLiteDbContext
    {
        private static SQLiteConnection _sqliteConnection;

        public SqLiteDbContext()
        {
            _sqliteConnection = new SQLiteConnection($"data source={AssemblyDirectory}\\navdata.sqlite;initial catalog=navdata;App=EntityFramework;");
            // ConfigurationManager.ConnectionStrings["NavdataContext"].ConnectionString);
        }

        public string AssemblyDirectory
        {
            get
            {
                string codeBase = Assembly.GetExecutingAssembly().CodeBase;
                UriBuilder uri = new UriBuilder(codeBase);
                string path = Uri.UnescapeDataString(uri.Path);
                return Path.GetDirectoryName(path);
            }
        }

        public IList<AirportEntity> GetAirportsByIcaoAndName(string term)
        {
            var airports = new List<AirportEntity>();
            DataTable dt = new DataTable();
            using (var cmd = _sqliteConnection.CreateCommand())
            {
                cmd.CommandText = $"SELECT * FROM airport WHERE ident like '{term}%' OR name LIKE '{term}%';";
                var da = new SQLiteDataAdapter(cmd.CommandText, _sqliteConnection);
                da.Fill(dt);

                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    var airport = EntityDbMapper.CreateItemFromRow<AirportEntity>(dt.Rows[i]);
                    airports.Add(airport);
                }
                return airports;
            }
        }

        public AirportEntity GetAirportByIcao(string icao)
        {
            DataTable dt = new DataTable();
            using (var cmd = _sqliteConnection.CreateCommand())
            {
                cmd.CommandText = $"SELECT * FROM airport WHERE UPPER(ident) = '{icao?.ToUpper()}'";
                var da = new SQLiteDataAdapter(cmd.CommandText, _sqliteConnection);
                da.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    var airport = EntityDbMapper.CreateItemFromRow<AirportEntity>(dt.Rows[0]);
                    airport.Runways = GetRunwaysByIcao(icao);
                    return airport;
                }
                return null;
            }
        }

        public IList<AirportEntity> GetAirportsByIcaos(string[] icaos)
        {
            var airportEntities = new List<AirportEntity>();
            DataTable dt = new DataTable();
            using (var cmd = _sqliteConnection.CreateCommand())
            {
                var icaoParams = string.Join("','", icaos);
                cmd.CommandText = $"SELECT * FROM airport WHERE UPPER(ident) in ('{icaoParams}')";
                var da = new SQLiteDataAdapter(cmd.CommandText, _sqliteConnection);
                da.Fill(dt);

                foreach (DataRow dr in dt.Rows)
                {
                    var airport = EntityDbMapper.CreateItemFromRow<AirportEntity>(dr);
                    airportEntities.Add(airport);
                }
            }

            return airportEntities;
        }

        public IList<AirportEntity> GetAirportsByTerm(string icaoTerm)
        {
            var airportEntities = new List<AirportEntity>();
            DataTable dt = new DataTable();
            using (var cmd = _sqliteConnection.CreateCommand())
            {
                cmd.CommandText = $"SELECT * FROM airport WHERE UPPER(ident) like '{icaoTerm?.ToUpper()}%'";
                var da = new SQLiteDataAdapter(cmd.CommandText, _sqliteConnection);
                da.Fill(dt);

                foreach (DataRow dr in dt.Rows)
                {
                    var airport = EntityDbMapper.CreateItemFromRow<AirportEntity>(dr);
                    airportEntities.Add(airport);
                }
            }

            return airportEntities;
        }

        public IList<AirportEntity> GetAllCloseAirports(AirportEntity airport)
        {
            var airportEntities = new List<AirportEntity>();

            double latDownOffset = airport.Laty - 2;
            double latUpOffset = airport.Laty + 2;
            double lonDownOffset = airport.Lonx - 2;
            double lonUpOffset = airport.Lonx + 2;

            DataTable dt = new DataTable();
            using (var cmd = _sqliteConnection.CreateCommand())
            {
                cmd.CommandText = $"SELECT * FROM airport WHERE ident <> '{airport.Ident}' AND laty > {latDownOffset} AND laty < {latUpOffset} AND lonx > {lonDownOffset} AND lonx < {lonUpOffset}";
                var da = new SQLiteDataAdapter(cmd.CommandText, _sqliteConnection);
                da.Fill(dt);

                airportEntities = EntityDbMapper.CreateItemsFromRows<AirportEntity>(dt.Rows).ToList();
            }

            return airportEntities;
        }

        public AirportEntity GetCloseAirport(double latitude, double longitude)
        {
            AirportEntity airportEntity = new AirportEntity();
            var coord = new GeoCoordinate(latitude, longitude);

            double latDownOffset = latitude - 2;
            double latUpOffset = latitude + 2;
            double lonDownOffset = longitude - 2;
            double lonUpOffset = longitude + 2;
            int minDistance = 15000;

            DataTable dt = new DataTable();
            using (var cmd = _sqliteConnection.CreateCommand())
            {
                cmd.CommandText = $"SELECT * FROM airport WHERE laty > {latDownOffset} AND laty < {latUpOffset} AND lonx > {lonDownOffset} AND lonx < {lonUpOffset}";
                var da = new SQLiteDataAdapter(cmd.CommandText, _sqliteConnection);
                da.Fill(dt);

                var airportEntities = EntityDbMapper.CreateItemsFromRows<AirportEntity>(dt.Rows);

                airportEntity = airportEntities.Select(x => new { nearest = x, co = new GeoCoordinate(x.Laty, x.Lonx) })
                                               .OrderBy(x => x.co.GetDistanceTo(coord))
                                               .Take(5)
                                               .FirstOrDefault(x => x.co.GetDistanceTo(coord) < minDistance).nearest;
            }

            return airportEntity;
        }

        public IList<RunwayEntity> GetRunwaysByIcao(string icao)
        {
            var runways = new List<RunwayEntity>();
            DataTable dt = new DataTable();
            using (var cmd = _sqliteConnection.CreateCommand())
            {
                cmd.CommandText = $@"SELECT r.*, re.name, re.offset_threshold, re.heading AS heading_true, re.end_type FROM runway r
                                        INNER JOIN airport a ON r.airport_id = a.airport_id
                                        INNER JOIN runway_end re ON r.primary_end_id = re.runway_end_id OR r.secondary_end_id = re.runway_end_id
                                        WHERE a.ident = '{icao}'";
                var da = new SQLiteDataAdapter(cmd.CommandText, _sqliteConnection);
                da.Fill(dt);

                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    var rwyData = EntityDbMapper.CreateItemFromRow<RunwayEntity>(dt.Rows[i]);
                    runways.Add(rwyData);
                }
                return runways;
            }
        }
    }
}
