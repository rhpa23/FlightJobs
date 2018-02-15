namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AirlineProperties : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AirlineDbModels", "BankBalance", c => c.Long(nullable: false));
            AddColumn("dbo.AirlineDbModels", "AirlineScore", c => c.Long(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.AirlineDbModels", "AirlineScore");
            DropColumn("dbo.AirlineDbModels", "BankBalance");
        }
    }
}
