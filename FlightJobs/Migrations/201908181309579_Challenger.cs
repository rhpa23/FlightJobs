namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Challenger : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.JobDbModels", "ChallengeCreatorUserId", c => c.String());
            AddColumn("dbo.JobDbModels", "IsChallenge", c => c.Boolean(nullable: false));
            AddColumn("dbo.JobDbModels", "ChallengeExpirationDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.JobDbModels", "ChallengeType", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.JobDbModels", "ChallengeType");
            DropColumn("dbo.JobDbModels", "ChallengeExpirationDate");
            DropColumn("dbo.JobDbModels", "IsChallenge");
            DropColumn("dbo.JobDbModels", "ChallengeCreatorUserId");
        }
    }
}
