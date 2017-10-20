namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class TimeModelProps : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "StartTime", c => c.DateTime(nullable: false));
            AddColumn("dbo.JobDbModels", "EndTime", c => c.DateTime(nullable: false));
            AddColumn("dbo.JobDbModels", "ModelName", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "ModelName");
            DropColumn("dbo.JobDbModels", "EndTime");
            DropColumn("dbo.JobDbModels", "StartTime");
        }
    }
}
