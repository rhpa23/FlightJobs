namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RemoveUserID : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.JobDbModels", "UserId");
        }
        
        public override void Down()
        {
            AddColumn("dbo.JobDbModels", "UserId", c => c.Int(nullable: false));
        }
    }
}
