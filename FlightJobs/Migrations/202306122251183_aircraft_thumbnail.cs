namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class aircraft_thumbnail : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.customplanecapacitydbmodels", "ImagePath", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.customplanecapacitydbmodels", "ImagePath");
        }
    }
}
