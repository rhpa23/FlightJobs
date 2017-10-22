namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class statisticsLogo : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.StatisticsDbModels", "Logo", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.StatisticsDbModels", "Logo");
        }
    }
}
