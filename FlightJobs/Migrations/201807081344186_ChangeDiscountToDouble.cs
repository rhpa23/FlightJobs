namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeDiscountToDouble : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.AirlineFboDbModels", "FuelPriceDiscount", c => c.Double(nullable: false));
            AlterColumn("dbo.AirlineFboDbModels", "GroundCrewDiscount", c => c.Double(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.AirlineFboDbModels", "GroundCrewDiscount", c => c.Decimal(nullable: false, precision: 18, scale: 2));
            AlterColumn("dbo.AirlineFboDbModels", "FuelPriceDiscount", c => c.Decimal(nullable: false, precision: 18, scale: 2));
        }
    }
}
