namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddCustomPaxWeight : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.CustomPlaneCapacityDbModels", "CustomPaxWeight", c => c.Long(nullable: false, defaultValue: 84));
        }
        
        public override void Down()
        {
            DropColumn("dbo.CustomPlaneCapacityDbModels", "CustomPaxWeight");
        }
    }
}
