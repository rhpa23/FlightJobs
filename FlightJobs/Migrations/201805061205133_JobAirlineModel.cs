namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class JobAirlineModel : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.JobAirlineDbModels",
                c => new
                    {
                        Id = c.Long(nullable: false, identity: true),
                        JobDebtValue = c.Long(nullable: false),
                        Airline_Id = c.Int(),
                        Job_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AirlineDbModels", t => t.Airline_Id)
                .ForeignKey("dbo.JobDbModels", t => t.Job_Id)
                .Index(t => t.Airline_Id)
                .Index(t => t.Job_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.JobAirlineDbModels", "Job_Id", "dbo.JobDbModels");
            DropForeignKey("dbo.JobAirlineDbModels", "Airline_Id", "dbo.AirlineDbModels");
            DropIndex("dbo.JobAirlineDbModels", new[] { "Job_Id" });
            DropIndex("dbo.JobAirlineDbModels", new[] { "Airline_Id" });
            DropTable("dbo.JobAirlineDbModels");
        }
    }
}
