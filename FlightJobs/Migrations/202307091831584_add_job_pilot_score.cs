namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_job_pilot_score : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.jobdbmodels", "PilotScore", c => c.Long(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.jobdbmodels", "PilotScore");
        }
    }
}
