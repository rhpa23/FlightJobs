namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddedInProgressProp : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "InProgress", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "InProgress");
        }
    }
}
