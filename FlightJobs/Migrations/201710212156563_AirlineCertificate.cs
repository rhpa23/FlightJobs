namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AirlineCertificate : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.AirlineCertificatesDbModels",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Airline_Id = c.Int(),
                        Certificate_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AirlineDbModels", t => t.Airline_Id)
                .ForeignKey("dbo.CertificateDbModels", t => t.Certificate_Id)
                .Index(t => t.Airline_Id)
                .Index(t => t.Certificate_Id);
            
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
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.AirlineCertificatesDbModels", "Certificate_Id", "dbo.CertificateDbModels");
            DropForeignKey("dbo.AirlineCertificatesDbModels", "Airline_Id", "dbo.AirlineDbModels");
            DropIndex("dbo.AirlineCertificatesDbModels", new[] { "Certificate_Id" });
            DropIndex("dbo.AirlineCertificatesDbModels", new[] { "Airline_Id" });
            DropTable("dbo.CertificateDbModels");
            DropTable("dbo.AirlineCertificatesDbModels");
        }
    }
}
