namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class UsedFuelWeight : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "StartFuelWeight", c => c.Long(nullable: false));
            AddColumn("dbo.JobDbModels", "FinishFuelWeight", c => c.Long(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "FinishFuelWeight");
            DropColumn("dbo.JobDbModels", "StartFuelWeight");
        }
    }
}
