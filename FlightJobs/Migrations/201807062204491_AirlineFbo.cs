namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AirlineFbo : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.AirlineFboDbModels",
                c => new
                    {
                        Id = c.Long(nullable: false, identity: true),
                        Icao = c.String(),
                        Airport_ICAO = c.String(),
                        Airport_IATA = c.String(),
                        Airport_Name = c.String(),
                        Airport_City = c.String(),
                        Airport_Country = c.String(),
                        Airport_Latitude = c.Double(nullable: false),
                        Airport_Longitude = c.Double(nullable: false),
                        Airport_RunwaySize = c.Int(nullable: false),
                        Airport_Elevation = c.Int(nullable: false),
                        Airport_Trasition = c.Int(nullable: false),
                        Availability = c.Int(nullable: false),
                        ScoreIncrease = c.Int(nullable: false),
                        FuelPriceDiscount = c.Decimal(nullable: false, precision: 18, scale: 2),
                        GroundCrewDiscount = c.Decimal(nullable: false, precision: 18, scale: 2),
                        Price = c.Int(nullable: false),
                        Airline_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AirlineDbModels", t => t.Airline_Id)
                .Index(t => t.Airline_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.AirlineFboDbModels", "Airline_Id", "dbo.AirlineDbModels");
            DropIndex("dbo.AirlineFboDbModels", new[] { "Airline_Id" });
            DropTable("dbo.AirlineFboDbModels");
        }
    }
}
