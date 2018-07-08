namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AirlineFboNotMapped : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.AirlineFboDbModels", "Airport_ICAO");
            DropColumn("dbo.AirlineFboDbModels", "Airport_IATA");
            DropColumn("dbo.AirlineFboDbModels", "Airport_Name");
            DropColumn("dbo.AirlineFboDbModels", "Airport_City");
            DropColumn("dbo.AirlineFboDbModels", "Airport_Country");
            DropColumn("dbo.AirlineFboDbModels", "Airport_Latitude");
            DropColumn("dbo.AirlineFboDbModels", "Airport_Longitude");
            DropColumn("dbo.AirlineFboDbModels", "Airport_RunwaySize");
            DropColumn("dbo.AirlineFboDbModels", "Airport_Elevation");
            DropColumn("dbo.AirlineFboDbModels", "Airport_Trasition");
        }
        
        public override void Down()
        {
            AddColumn("dbo.AirlineFboDbModels", "Airport_Trasition", c => c.Int(nullable: false));
            AddColumn("dbo.AirlineFboDbModels", "Airport_Elevation", c => c.Int(nullable: false));
            AddColumn("dbo.AirlineFboDbModels", "Airport_RunwaySize", c => c.Int(nullable: false));
            AddColumn("dbo.AirlineFboDbModels", "Airport_Longitude", c => c.Double(nullable: false));
            AddColumn("dbo.AirlineFboDbModels", "Airport_Latitude", c => c.Double(nullable: false));
            AddColumn("dbo.AirlineFboDbModels", "Airport_Country", c => c.String());
            AddColumn("dbo.AirlineFboDbModels", "Airport_City", c => c.String());
            AddColumn("dbo.AirlineFboDbModels", "Airport_Name", c => c.String());
            AddColumn("dbo.AirlineFboDbModels", "Airport_IATA", c => c.String());
            AddColumn("dbo.AirlineFboDbModels", "Airport_ICAO", c => c.String());
        }
    }
}
