namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class CustomPlaneCapacityFix01 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.StatisticsDbModels", "CustomPlaneCapacity_Id", c => c.Long());
            CreateIndex("dbo.StatisticsDbModels", "CustomPlaneCapacity_Id");
            AddForeignKey("dbo.StatisticsDbModels", "CustomPlaneCapacity_Id", "dbo.CustomPlaneCapacityDbModels", "Id");
            DropColumn("dbo.StatisticsDbModels", "UseCustomPlaneCapacity");
        }
        
        public override void Down()
        {
            AddColumn("dbo.StatisticsDbModels", "UseCustomPlaneCapacity", c => c.Boolean(nullable: false));
            DropForeignKey("dbo.StatisticsDbModels", "CustomPlaneCapacity_Id", "dbo.CustomPlaneCapacityDbModels");
            DropIndex("dbo.StatisticsDbModels", new[] { "CustomPlaneCapacity_Id" });
            DropColumn("dbo.StatisticsDbModels", "CustomPlaneCapacity_Id");
        }
    }
}
