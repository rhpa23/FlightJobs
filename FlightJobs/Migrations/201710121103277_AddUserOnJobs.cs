namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddUserOnJobs : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "UserId", c => c.Int(nullable: false));
            AddColumn("dbo.JobDbModels", "User_Id", c => c.String(maxLength: 128));
            CreateIndex("dbo.JobDbModels", "User_Id");
            AddForeignKey("dbo.JobDbModels", "User_Id", "dbo.AspNetUsers", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.JobDbModels", "User_Id", "dbo.AspNetUsers");
            DropIndex("dbo.JobDbModels", new[] { "User_Id" });
            DropColumn("dbo.JobDbModels", "User_Id");
            DropColumn("dbo.JobDbModels", "UserId");
        }
    }
}
