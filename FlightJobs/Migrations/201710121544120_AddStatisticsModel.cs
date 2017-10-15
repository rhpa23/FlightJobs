namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddStatisticsModel : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.StatisticsDbModels",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        BankBalance = c.Int(nullable: false),
                        LastFlight = c.DateTime(nullable: false),
                        PilotScore = c.Int(nullable: false),
                        MinutesFlown = c.Int(nullable: false),
                        MilesFlown = c.Int(nullable: false),
                        NumberFlights = c.Int(nullable: false),
                        User_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AspNetUsers", t => t.User_Id)
                .Index(t => t.User_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.StatisticsDbModels", "User_Id", "dbo.AspNetUsers");
            DropIndex("dbo.StatisticsDbModels", new[] { "User_Id" });
            DropTable("dbo.StatisticsDbModels");
        }
    }
}
