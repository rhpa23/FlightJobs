namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class JobVideo : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "VideoUrl", c => c.String(nullable: false));
            AddColumn("dbo.JobDbModels", "VideoDescription", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "VideoDescription");
            DropColumn("dbo.JobDbModels", "VideoUrl");
        }
    }
}
