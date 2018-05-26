namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class OverdueProcessed : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PilotLicenseExpensesUserDbModels", "OverdueProcessed", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.PilotLicenseExpensesUserDbModels", "OverdueProcessed");
        }
    }
}
