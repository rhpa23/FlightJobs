namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class CustomPlaneCapacity : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.CustomPlaneCapacityDbModels",
                c => new
                    {
                        Id = c.Long(nullable: false, identity: true),
                        CustomPassengerCapacity = c.Int(nullable: false),
                        CustomCargoCapacityWeight = c.Int(nullable: false),
                        CustomNameCapacity = c.String(nullable: false),
                        User_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AspNetUsers", t => t.User_Id)
                .Index(t => t.User_Id);
            
            AddColumn("dbo.StatisticsDbModels", "UseCustomPlaneCapacity", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.CustomPlaneCapacityDbModels", "User_Id", "dbo.AspNetUsers");
            DropIndex("dbo.CustomPlaneCapacityDbModels", new[] { "User_Id" });
            DropColumn("dbo.StatisticsDbModels", "UseCustomPlaneCapacity");
            DropTable("dbo.CustomPlaneCapacityDbModels");
        }
    }
}
