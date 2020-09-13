namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class WeightUnit : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.StatisticsDbModels", "WeightUnit", c => c.String(unicode: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.StatisticsDbModels", "WeightUnit");
        }
    }
}
