namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RemoveStatiticsID : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.CertificateDbModels", "StatisticsDbModel_Id", "dbo.StatisticsDbModels");
            DropIndex("dbo.CertificateDbModels", new[] { "StatisticsDbModel_Id" });
            DropColumn("dbo.CertificateDbModels", "StatisticsDbModel_Id");
        }
        
        public override void Down()
        {
            AddColumn("dbo.CertificateDbModels", "StatisticsDbModel_Id", c => c.Int());
            CreateIndex("dbo.CertificateDbModels", "StatisticsDbModel_Id");
            AddForeignKey("dbo.CertificateDbModels", "StatisticsDbModel_Id", "dbo.StatisticsDbModels", "Id");
        }
    }
}
