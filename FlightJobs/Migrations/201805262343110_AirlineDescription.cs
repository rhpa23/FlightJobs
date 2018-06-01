namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AirlineDescription : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AirlineDbModels", "Description", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.AirlineDbModels", "Description");
        }
    }
}
