namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddIsdoneToJobs : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "IsDone", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "IsDone");
        }
    }
}
