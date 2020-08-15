namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class UseCustomPlaneCapacity : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.StatisticsDbModels", "UseCustomPlaneCapacity", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.StatisticsDbModels", "UseCustomPlaneCapacity");
        }
    }
}
