namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RemoveCountryFroCertificates : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.CertificateDbModels", "Country");
        }
        
        public override void Down()
        {
            AddColumn("dbo.CertificateDbModels", "Country", c => c.String());
        }
    }
}
