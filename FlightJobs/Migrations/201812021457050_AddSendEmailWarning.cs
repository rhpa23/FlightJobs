namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddSendEmailWarning : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.StatisticsDbModels", "SendLicenseWarning", c => c.Boolean(nullable: false));
            AddColumn("dbo.StatisticsDbModels", "SendAirlineBillsWarning", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.StatisticsDbModels", "SendAirlineBillsWarning");
            DropColumn("dbo.StatisticsDbModels", "SendLicenseWarning");
        }
    }
}
