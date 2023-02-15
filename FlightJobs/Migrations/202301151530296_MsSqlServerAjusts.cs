namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class MsSqlServerAjusts : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.airlinedbmodels", "Name", c => c.String());
            AlterColumn("dbo.airlinedbmodels", "Description", c => c.String());
            AlterColumn("dbo.airlinedbmodels", "Country", c => c.String());
            AlterColumn("dbo.airlinedbmodels", "Logo", c => c.String());
            AlterColumn("dbo.airlinedbmodels", "UserId", c => c.String());
            AlterColumn("dbo.airlinedbmodels", "DebtMaturityDate", c => c.DateTime(nullable: false));
            AlterColumn("dbo.certificatedbmodels", "Name", c => c.String());
            AlterColumn("dbo.certificatedbmodels", "Logo", c => c.String());
            AlterColumn("dbo.airlinefbodbmodels", "Icao", c => c.String());
            AlterColumn("dbo.customplanecapacitydbmodels", "CustomNameCapacity", c => c.String(nullable: false));
            AlterColumn("dbo.aspnetusers", "PasswordHash", c => c.String());
            AlterColumn("dbo.aspnetusers", "SecurityStamp", c => c.String());
            AlterColumn("dbo.aspnetusers", "PhoneNumber", c => c.String());
            AlterColumn("dbo.aspnetusers", "LockoutEndDateUtc", c => c.DateTime());
            AlterColumn("dbo.aspnetuserclaims", "ClaimType", c => c.String());
            AlterColumn("dbo.aspnetuserclaims", "ClaimValue", c => c.String());
            AlterColumn("dbo.jobdbmodels", "DepartureICAO", c => c.String());
            AlterColumn("dbo.jobdbmodels", "ArrivalICAO", c => c.String());
            AlterColumn("dbo.jobdbmodels", "AlternativeICAO", c => c.String());
            AlterColumn("dbo.jobdbmodels", "StartTime", c => c.DateTime(nullable: false));
            AlterColumn("dbo.jobdbmodels", "EndTime", c => c.DateTime(nullable: false));
            AlterColumn("dbo.jobdbmodels", "ModelName", c => c.String());
            AlterColumn("dbo.jobdbmodels", "ModelDescription", c => c.String());
            AlterColumn("dbo.jobdbmodels", "VideoUrl", c => c.String());
            AlterColumn("dbo.jobdbmodels", "VideoDescription", c => c.String());
            AlterColumn("dbo.jobdbmodels", "ChallengeCreatorUserId", c => c.String());
            AlterColumn("dbo.jobdbmodels", "ChallengeExpirationDate", c => c.DateTime(nullable: false));
            AlterColumn("dbo.pilotlicenseitemdbmodels", "Name", c => c.String());
            AlterColumn("dbo.pilotlicenseitemdbmodels", "Image", c => c.String());
            AlterColumn("dbo.pilotlicenseexpensesdbmodels", "Name", c => c.String());
            AlterColumn("dbo.pilotlicenseexpensesuserdbmodels", "MaturityDate", c => c.DateTime(nullable: false));
            AlterColumn("dbo.statisticsdbmodels", "Logo", c => c.String());
            AlterColumn("dbo.statisticsdbmodels", "WeightUnit", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.statisticsdbmodels", "WeightUnit", c => c.String(unicode: false));
            AlterColumn("dbo.statisticsdbmodels", "Logo", c => c.String(unicode: false));
            AlterColumn("dbo.pilotlicenseexpensesuserdbmodels", "MaturityDate", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.pilotlicenseexpensesdbmodels", "Name", c => c.String(unicode: false));
            AlterColumn("dbo.pilotlicenseitemdbmodels", "Image", c => c.String(unicode: false));
            AlterColumn("dbo.pilotlicenseitemdbmodels", "Name", c => c.String(unicode: false));
            AlterColumn("dbo.jobdbmodels", "ChallengeExpirationDate", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.jobdbmodels", "ChallengeCreatorUserId", c => c.String(unicode: false));
            AlterColumn("dbo.jobdbmodels", "VideoDescription", c => c.String(unicode: false));
            AlterColumn("dbo.jobdbmodels", "VideoUrl", c => c.String(unicode: false));
            AlterColumn("dbo.jobdbmodels", "ModelDescription", c => c.String(unicode: false));
            AlterColumn("dbo.jobdbmodels", "ModelName", c => c.String(unicode: false));
            AlterColumn("dbo.jobdbmodels", "EndTime", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.jobdbmodels", "StartTime", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.jobdbmodels", "AlternativeICAO", c => c.String(unicode: false));
            AlterColumn("dbo.jobdbmodels", "ArrivalICAO", c => c.String(unicode: false));
            AlterColumn("dbo.jobdbmodels", "DepartureICAO", c => c.String(unicode: false));
            AlterColumn("dbo.aspnetuserclaims", "ClaimValue", c => c.String(unicode: false));
            AlterColumn("dbo.aspnetuserclaims", "ClaimType", c => c.String(unicode: false));
            AlterColumn("dbo.aspnetusers", "LockoutEndDateUtc", c => c.DateTime(precision: 0));
            AlterColumn("dbo.aspnetusers", "PhoneNumber", c => c.String(unicode: false));
            AlterColumn("dbo.aspnetusers", "SecurityStamp", c => c.String(unicode: false));
            AlterColumn("dbo.aspnetusers", "PasswordHash", c => c.String(unicode: false));
            AlterColumn("dbo.customplanecapacitydbmodels", "CustomNameCapacity", c => c.String(nullable: false, unicode: false));
            AlterColumn("dbo.airlinefbodbmodels", "Icao", c => c.String(unicode: false));
            AlterColumn("dbo.certificatedbmodels", "Logo", c => c.String(unicode: false));
            AlterColumn("dbo.certificatedbmodels", "Name", c => c.String(unicode: false));
            AlterColumn("dbo.airlinedbmodels", "DebtMaturityDate", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.airlinedbmodels", "UserId", c => c.String(unicode: false));
            AlterColumn("dbo.airlinedbmodels", "Logo", c => c.String(unicode: false));
            AlterColumn("dbo.airlinedbmodels", "Country", c => c.String(unicode: false));
            AlterColumn("dbo.airlinedbmodels", "Description", c => c.String(unicode: false));
            AlterColumn("dbo.airlinedbmodels", "Name", c => c.String(unicode: false));
        }
    }
}
