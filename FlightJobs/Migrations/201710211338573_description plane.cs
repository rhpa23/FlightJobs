namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class descriptionplane : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "ModelDescription", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "ModelDescription");
        }
    }
}
