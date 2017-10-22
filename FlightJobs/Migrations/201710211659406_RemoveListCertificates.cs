namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RemoveListCertificates : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.CertificateDbModels", "StatisticsDbModel_Id", "dbo.StatisticsDbModels");
            DropIndex("dbo.CertificateDbModels", new[] { "StatisticsDbModel_Id" });
            DropTable("dbo.CertificateDbModels");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.CertificateDbModels",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Country = c.String(),
                        Price = c.Long(nullable: false),
                        Score = c.Long(nullable: false),
                        Logo = c.String(),
                        StatisticsDbModel_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateIndex("dbo.CertificateDbModels", "StatisticsDbModel_Id");
            AddForeignKey("dbo.CertificateDbModels", "StatisticsDbModel_Id", "dbo.StatisticsDbModels", "Id");
        }
    }
}
