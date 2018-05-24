namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class PilotLicenseExpenses : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.LicenseItemUserDbModels",
                c => new
                    {
                        Id = c.Long(nullable: false, identity: true),
                        IsBought = c.Boolean(nullable: false),
                        PilotLicenseItem_Id = c.Long(),
                        User_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.PilotLicenseItemDbModels", t => t.PilotLicenseItem_Id)
                .ForeignKey("dbo.AspNetUsers", t => t.User_Id)
                .Index(t => t.PilotLicenseItem_Id)
                .Index(t => t.User_Id);
            
            CreateTable(
                "dbo.PilotLicenseItemDbModels",
                c => new
                    {
                        Id = c.Long(nullable: false, identity: true),
                        Name = c.String(),
                        Price = c.Long(nullable: false),
                        Image = c.String(),
                        PilotLicenseExpense_Id = c.Long(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.PilotLicenseExpensesDbModels", t => t.PilotLicenseExpense_Id)
                .Index(t => t.PilotLicenseExpense_Id);
            
            CreateTable(
                "dbo.PilotLicenseExpensesDbModels",
                c => new
                    {
                        Id = c.Long(nullable: false, identity: true),
                        Name = c.String(),
                        DaysMaturity = c.Int(nullable: false),
                        Mandatory = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.PilotLicenseExpensesUserDbModels",
                c => new
                    {
                        Id = c.Long(nullable: false, identity: true),
                        MaturityDate = c.DateTime(nullable: false),
                        PilotLicenseExpense_Id = c.Long(),
                        User_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.PilotLicenseExpensesDbModels", t => t.PilotLicenseExpense_Id)
                .ForeignKey("dbo.AspNetUsers", t => t.User_Id)
                .Index(t => t.PilotLicenseExpense_Id)
                .Index(t => t.User_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.PilotLicenseExpensesUserDbModels", "User_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.PilotLicenseExpensesUserDbModels", "PilotLicenseExpense_Id", "dbo.PilotLicenseExpensesDbModels");
            DropForeignKey("dbo.LicenseItemUserDbModels", "User_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.LicenseItemUserDbModels", "PilotLicenseItem_Id", "dbo.PilotLicenseItemDbModels");
            DropForeignKey("dbo.PilotLicenseItemDbModels", "PilotLicenseExpense_Id", "dbo.PilotLicenseExpensesDbModels");
            DropIndex("dbo.PilotLicenseExpensesUserDbModels", new[] { "User_Id" });
            DropIndex("dbo.PilotLicenseExpensesUserDbModels", new[] { "PilotLicenseExpense_Id" });
            DropIndex("dbo.PilotLicenseItemDbModels", new[] { "PilotLicenseExpense_Id" });
            DropIndex("dbo.LicenseItemUserDbModels", new[] { "User_Id" });
            DropIndex("dbo.LicenseItemUserDbModels", new[] { "PilotLicenseItem_Id" });
            DropTable("dbo.PilotLicenseExpensesUserDbModels");
            DropTable("dbo.PilotLicenseExpensesDbModels");
            DropTable("dbo.PilotLicenseItemDbModels");
            DropTable("dbo.LicenseItemUserDbModels");
        }
    }
}
