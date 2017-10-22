namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class scoreBalanceToLong : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.StatisticsDbModels", "BankBalance", c => c.Long(nullable: false));
            AlterColumn("dbo.StatisticsDbModels", "PilotScore", c => c.Long(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.StatisticsDbModels", "PilotScore", c => c.Int(nullable: false));
            AlterColumn("dbo.StatisticsDbModels", "BankBalance", c => c.Int(nullable: false));
        }
    }
}
