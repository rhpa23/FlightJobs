namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AirlineDebt : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AirlineDbModels", "DebtValue", c => c.Long(nullable: false));
            AddColumn("dbo.AirlineDbModels", "DebtMaturityDate", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.AirlineDbModels", "DebtMaturityDate");
            DropColumn("dbo.AirlineDbModels", "DebtValue");
        }
    }
}
