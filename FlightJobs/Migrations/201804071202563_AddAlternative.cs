namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddAlternative : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "AlternativeICAO", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "AlternativeICAO");
        }
    }
}
