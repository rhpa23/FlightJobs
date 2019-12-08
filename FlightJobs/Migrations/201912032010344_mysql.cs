namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class mysql : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.AirlineDbModels", "Name", c => c.String(unicode: false));
            AlterColumn("dbo.AirlineDbModels", "Description", c => c.String(unicode: false));
            AlterColumn("dbo.AirlineDbModels", "Country", c => c.String(unicode: false));
            AlterColumn("dbo.AirlineDbModels", "Logo", c => c.String(unicode: false));
            AlterColumn("dbo.AirlineDbModels", "UserId", c => c.String(unicode: false));
            AlterColumn("dbo.AirlineDbModels", "DebtMaturityDate", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.CertificateDbModels", "Name", c => c.String(unicode: false));
            AlterColumn("dbo.CertificateDbModels", "Logo", c => c.String(unicode: false));
            AlterColumn("dbo.AirlineFboDbModels", "Icao", c => c.String(unicode: false));
            AlterColumn("dbo.CustomPlaneCapacityDbModels", "CustomNameCapacity", c => c.String(nullable: false, unicode: false));
            AlterColumn("dbo.AspNetUsers", "PasswordHash", c => c.String(unicode: false));
            AlterColumn("dbo.AspNetUsers", "SecurityStamp", c => c.String(unicode: false));
            AlterColumn("dbo.AspNetUsers", "PhoneNumber", c => c.String(unicode: false));
            AlterColumn("dbo.AspNetUsers", "LockoutEndDateUtc", c => c.DateTime(precision: 0));
            AlterColumn("dbo.AspNetUserClaims", "ClaimType", c => c.String(unicode: false));
            AlterColumn("dbo.AspNetUserClaims", "ClaimValue", c => c.String(unicode: false));
            AlterColumn("dbo.JobDbModels", "DepartureICAO", c => c.String(unicode: false));
            AlterColumn("dbo.JobDbModels", "ArrivalICAO", c => c.String(unicode: false));
            AlterColumn("dbo.JobDbModels", "AlternativeICAO", c => c.String(unicode: false));
            AlterColumn("dbo.JobDbModels", "StartTime", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.JobDbModels", "EndTime", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.JobDbModels", "ModelName", c => c.String(unicode: false));
            AlterColumn("dbo.JobDbModels", "ModelDescription", c => c.String(unicode: false));
            AlterColumn("dbo.JobDbModels", "VideoUrl", c => c.String(unicode: false));
            AlterColumn("dbo.JobDbModels", "VideoDescription", c => c.String(unicode: false));
            AlterColumn("dbo.JobDbModels", "ChallengeCreatorUserId", c => c.String(unicode: false));
            AlterColumn("dbo.JobDbModels", "ChallengeExpirationDate", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.PilotLicenseItemDbModels", "Name", c => c.String(unicode: false));
            AlterColumn("dbo.PilotLicenseItemDbModels", "Image", c => c.String(unicode: false));
            AlterColumn("dbo.PilotLicenseExpensesDbModels", "Name", c => c.String(unicode: false));
            AlterColumn("dbo.PilotLicenseExpensesUserDbModels", "MaturityDate", c => c.DateTime(nullable: false, precision: 0));
            AlterColumn("dbo.StatisticsDbModels", "Logo", c => c.String(unicode: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.StatisticsDbModels", "Logo", c => c.String());
            AlterColumn("dbo.PilotLicenseExpensesUserDbModels", "MaturityDate", c => c.DateTime(nullable: false));
            AlterColumn("dbo.PilotLicenseExpensesDbModels", "Name", c => c.String());
            AlterColumn("dbo.PilotLicenseItemDbModels", "Image", c => c.String());
            AlterColumn("dbo.PilotLicenseItemDbModels", "Name", c => c.String());
            AlterColumn("dbo.JobDbModels", "ChallengeExpirationDate", c => c.DateTime(nullable: false));
            AlterColumn("dbo.JobDbModels", "ChallengeCreatorUserId", c => c.String());
            AlterColumn("dbo.JobDbModels", "VideoDescription", c => c.String());
            AlterColumn("dbo.JobDbModels", "VideoUrl", c => c.String());
            AlterColumn("dbo.JobDbModels", "ModelDescription", c => c.String());
            AlterColumn("dbo.JobDbModels", "ModelName", c => c.String());
            AlterColumn("dbo.JobDbModels", "EndTime", c => c.DateTime(nullable: false));
            AlterColumn("dbo.JobDbModels", "StartTime", c => c.DateTime(nullable: false));
            AlterColumn("dbo.JobDbModels", "AlternativeICAO", c => c.String());
            AlterColumn("dbo.JobDbModels", "ArrivalICAO", c => c.String());
            AlterColumn("dbo.JobDbModels", "DepartureICAO", c => c.String());
            AlterColumn("dbo.AspNetUserClaims", "ClaimValue", c => c.String());
            AlterColumn("dbo.AspNetUserClaims", "ClaimType", c => c.String());
            AlterColumn("dbo.AspNetUsers", "LockoutEndDateUtc", c => c.DateTime());
            AlterColumn("dbo.AspNetUsers", "PhoneNumber", c => c.String());
            AlterColumn("dbo.AspNetUsers", "SecurityStamp", c => c.String());
            AlterColumn("dbo.AspNetUsers", "PasswordHash", c => c.String());
            AlterColumn("dbo.CustomPlaneCapacityDbModels", "CustomNameCapacity", c => c.String(nullable: false));
            AlterColumn("dbo.AirlineFboDbModels", "Icao", c => c.String());
            AlterColumn("dbo.CertificateDbModels", "Logo", c => c.String());
            AlterColumn("dbo.CertificateDbModels", "Name", c => c.String());
            AlterColumn("dbo.AirlineDbModels", "DebtMaturityDate", c => c.DateTime(nullable: false));
            AlterColumn("dbo.AirlineDbModels", "UserId", c => c.String());
            AlterColumn("dbo.AirlineDbModels", "Logo", c => c.String());
            AlterColumn("dbo.AirlineDbModels", "Country", c => c.String());
            AlterColumn("dbo.AirlineDbModels", "Description", c => c.String());
            AlterColumn("dbo.AirlineDbModels", "Name", c => c.String());
        }
    }
}
