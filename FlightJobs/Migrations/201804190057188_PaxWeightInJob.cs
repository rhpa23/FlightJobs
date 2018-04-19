namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class PaxWeightInJob : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "PaxWeight", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "PaxWeight");
        }
    }
}
