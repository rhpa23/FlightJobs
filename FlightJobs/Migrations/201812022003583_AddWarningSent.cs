namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddWarningSent : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.StatisticsDbModels", "LicenseWarningSent", c => c.Boolean(nullable: false));
            AddColumn("dbo.StatisticsDbModels", "AirlineBillsWarningSent", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.StatisticsDbModels", "AirlineBillsWarningSent");
            DropColumn("dbo.StatisticsDbModels", "LicenseWarningSent");
        }
    }
}
