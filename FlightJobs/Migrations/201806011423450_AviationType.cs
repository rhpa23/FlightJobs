namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AviationType : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "AviationType", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "AviationType");
        }
    }
}
