namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AirlineOwnerId : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AirlineDbModels", "UserId", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.AirlineDbModels", "UserId");
        }
    }
}
