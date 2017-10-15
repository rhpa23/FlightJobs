namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddIsActivatedToJobs : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "IsActivated", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "IsActivated");
        }
    }
}
