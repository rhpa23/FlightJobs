namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class JobVideoDelRequired : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.JobDbModels", "VideoUrl", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.JobDbModels", "VideoUrl", c => c.String(nullable: false));
        }
    }
}
