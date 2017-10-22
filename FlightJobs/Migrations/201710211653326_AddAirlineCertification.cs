namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddAirlineCertification : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.AirlineDbModels",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Country = c.String(),
                        Salary = c.Long(nullable: false),
                        Score = c.Long(nullable: false),
                        Logo = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            AddColumn("dbo.StatisticsDbModels", "Airline_Id", c => c.Int());
            CreateIndex("dbo.StatisticsDbModels", "Airline_Id");
            AddForeignKey("dbo.StatisticsDbModels", "Airline_Id", "dbo.AirlineDbModels", "Id");
            DropColumn("dbo.StatisticsDbModels", "LastFlight");
            DropColumn("dbo.StatisticsDbModels", "MinutesFlown");
            DropColumn("dbo.StatisticsDbModels", "MilesFlown");
            DropColumn("dbo.StatisticsDbModels", "NumberFlights");
        }
        
        public override void Down()
        {
            AddColumn("dbo.StatisticsDbModels", "NumberFlights", c => c.Int(nullable: false));
            AddColumn("dbo.StatisticsDbModels", "MilesFlown", c => c.Int(nullable: false));
            AddColumn("dbo.StatisticsDbModels", "MinutesFlown", c => c.Int(nullable: false));
            AddColumn("dbo.StatisticsDbModels", "LastFlight", c => c.DateTime(nullable: false));
            DropForeignKey("dbo.StatisticsDbModels", "Airline_Id", "dbo.AirlineDbModels");
            DropIndex("dbo.StatisticsDbModels", new[] { "Airline_Id" });
            DropColumn("dbo.StatisticsDbModels", "Airline_Id");
            DropTable("dbo.AirlineDbModels");
        }
    }
}
