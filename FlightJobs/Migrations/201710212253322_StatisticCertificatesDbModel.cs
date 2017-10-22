namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class StatisticCertificatesDbModel : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.StatisticCertificatesDbModels",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Certificate_Id = c.Int(),
                        Statistic_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.CertificateDbModels", t => t.Certificate_Id)
                .ForeignKey("dbo.StatisticsDbModels", t => t.Statistic_Id)
                .Index(t => t.Certificate_Id)
                .Index(t => t.Statistic_Id);
            
            AddColumn("dbo.CertificateDbModels", "StatisticsDbModel_Id", c => c.Int());
            CreateIndex("dbo.CertificateDbModels", "StatisticsDbModel_Id");
            AddForeignKey("dbo.CertificateDbModels", "StatisticsDbModel_Id", "dbo.StatisticsDbModels", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.StatisticCertificatesDbModels", "Statistic_Id", "dbo.StatisticsDbModels");
            DropForeignKey("dbo.CertificateDbModels", "StatisticsDbModel_Id", "dbo.StatisticsDbModels");
            DropForeignKey("dbo.StatisticCertificatesDbModels", "Certificate_Id", "dbo.CertificateDbModels");
            DropIndex("dbo.StatisticCertificatesDbModels", new[] { "Statistic_Id" });
            DropIndex("dbo.StatisticCertificatesDbModels", new[] { "Certificate_Id" });
            DropIndex("dbo.CertificateDbModels", new[] { "StatisticsDbModel_Id" });
            DropColumn("dbo.CertificateDbModels", "StatisticsDbModel_Id");
            DropTable("dbo.StatisticCertificatesDbModels");
        }
    }
}
