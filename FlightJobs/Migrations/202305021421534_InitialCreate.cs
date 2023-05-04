namespace FlightJobs.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitialCreate : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.airlinecertificatesdbmodels",
                c => new
                {
                    Id = c.Int(nullable: false, identity: true),
                    Airline_Id = c.Int(),
                    Certificate_Id = c.Int(),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.airlinedbmodels", t => t.Airline_Id)
                .ForeignKey("dbo.certificatedbmodels", t => t.Certificate_Id);
                //.Index(t => t.Airline_Id)
                //.Index(t => t.Certificate_Id);
            Sql("CREATE index  `IX_Airline_Id` on `airlinecertificatesdbmodels` (`Airline_Id` DESC)");
            Sql("CREATE index  `IX_Certificate_Id` on `airlinecertificatesdbmodels` (`Certificate_Id` DESC)");

            CreateTable(
                "dbo.airlinedbmodels",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(unicode: false),
                        Description = c.String(unicode: false),
                        Country = c.String(unicode: false),
                        Salary = c.Long(nullable: false),
                        Score = c.Long(nullable: false),
                        Logo = c.String(unicode: false),
                        BankBalance = c.Long(nullable: false),
                        AirlineScore = c.Long(nullable: false),
                        UserId = c.String(unicode: false),
                        DebtValue = c.Long(nullable: false),
                        DebtMaturityDate = c.DateTime(nullable: false, precision: 0),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.certificatedbmodels",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(unicode: false),
                        Price = c.Long(nullable: false),
                        Score = c.Long(nullable: false),
                        Logo = c.String(unicode: false),
                    })
                .PrimaryKey(t => t.Id);

            CreateTable(
                "dbo.airlinefbodbmodels",
                c => new
                {
                    Id = c.Long(nullable: false, identity: true),
                    Icao = c.String(unicode: false),
                    Availability = c.Int(nullable: false),
                    ScoreIncrease = c.Int(nullable: false),
                    FuelPriceDiscount = c.Double(nullable: false),
                    GroundCrewDiscount = c.Double(nullable: false),
                    Price = c.Int(nullable: false),
                    Airline_Id = c.Int(),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.airlinedbmodels", t => t.Airline_Id);
                //.Index(t => t.Airline_Id);
                
                Sql("CREATE index  `IX_Airline_Id` on `airlinefbodbmodels` (`Airline_Id` DESC)");

            CreateTable(
                "dbo.customplanecapacitydbmodels",
                c => new
                {
                    Id = c.Long(nullable: false, identity: true),
                    CustomPassengerCapacity = c.Int(nullable: false),
                    CustomCargoCapacityWeight = c.Int(nullable: false),
                    CustomNameCapacity = c.String(nullable: false, unicode: false),
                    CustomPaxWeight = c.Long(nullable: false),
                    User_Id = c.String(maxLength: 128, storeType: "nvarchar"),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.aspnetusers", t => t.User_Id);
                //.Index(t => t.User_Id);
                Sql("CREATE index  `IX_User_Id` on `customplanecapacitydbmodels` (`User_Id` DESC)");

            CreateTable(
                "dbo.aspnetusers",
                c => new
                {
                    Id = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                    Email = c.String(maxLength: 256, storeType: "nvarchar"),
                    EmailConfirmed = c.Boolean(nullable: false),
                    PasswordHash = c.String(unicode: false),
                    SecurityStamp = c.String(unicode: false),
                    PhoneNumber = c.String(unicode: false),
                    PhoneNumberConfirmed = c.Boolean(nullable: false),
                    TwoFactorEnabled = c.Boolean(nullable: false),
                    LockoutEndDateUtc = c.DateTime(precision: 0),
                    LockoutEnabled = c.Boolean(nullable: false),
                    AccessFailedCount = c.Int(nullable: false),
                    UserName = c.String(nullable: false, maxLength: 256, storeType: "nvarchar"),
                })
                .PrimaryKey(t => t.Id);
                //.Index(t => t.UserName, unique: true, name: "UserNameIndex");
                Sql("CREATE UNIQUE index  `IX_UserName` on `aspnetusers` (`UserName` DESC)");

            CreateTable(
                "dbo.aspnetuserclaims",
                c => new
                {
                    Id = c.Int(nullable: false, identity: true),
                    UserId = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                    ClaimType = c.String(unicode: false),
                    ClaimValue = c.String(unicode: false),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.aspnetusers", t => t.UserId, cascadeDelete: true);
                //.Index(t => t.UserId);
                Sql("CREATE index  `IX_UserId` on `aspnetuserclaims` (`UserId` DESC)");

            CreateTable(
                "dbo.aspnetuserlogins",
                c => new
                {
                    LoginProvider = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                    ProviderKey = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                    UserId = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                })
                .PrimaryKey(t => new { t.LoginProvider, t.ProviderKey, t.UserId })
                .ForeignKey("dbo.aspnetusers", t => t.UserId, cascadeDelete: true);
                //.Index(t => t.UserId);
                Sql("CREATE index  `IX_UserId` on `aspnetuserlogins` (`UserId` DESC)");

            CreateTable(
                "dbo.aspnetuserroles",
                c => new
                {
                    UserId = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                    RoleId = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                })
                .PrimaryKey(t => new { t.UserId, t.RoleId })
                .ForeignKey("dbo.aspnetusers", t => t.UserId, cascadeDelete: true)
                .ForeignKey("dbo.aspnetroles", t => t.RoleId, cascadeDelete: true);
                //.Index(t => t.UserId)
                //.Index(t => t.RoleId);
                Sql("CREATE index  `IX_UserId` on `aspnetuserroles` (`UserId` DESC)");
                Sql("CREATE index  `IX_RoleId` on `aspnetuserroles` (`RoleId` DESC)");

            CreateTable(
                "dbo.jobairlinedbmodels",
                c => new
                {
                    Id = c.Long(nullable: false, identity: true),
                    JobDebtValue = c.Long(nullable: false),
                    Airline_Id = c.Int(),
                    Job_Id = c.Int(),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.airlinedbmodels", t => t.Airline_Id)
                .ForeignKey("dbo.jobdbmodels", t => t.Job_Id);
                //.Index(t => t.Airline_Id)
                //.Index(t => t.Job_Id);
                Sql("CREATE index  `IX_Airline_Id` on `jobairlinedbmodels` (`Airline_Id` DESC)");
                Sql("CREATE index  `IX_Job_Id` on `jobairlinedbmodels` (`Job_Id` DESC)");

            CreateTable(
                "dbo.jobdbmodels",
                c => new
                {
                    Id = c.Int(nullable: false, identity: true),
                    PaxWeight = c.Int(nullable: false),
                    DepartureICAO = c.String(unicode: false),
                    ArrivalICAO = c.String(unicode: false),
                    AlternativeICAO = c.String(unicode: false),
                    Dist = c.Long(nullable: false),
                    Pax = c.Long(nullable: false),
                    Cargo = c.Long(nullable: false),
                    Pay = c.Long(nullable: false),
                    FirstClass = c.Boolean(nullable: false),
                    IsDone = c.Boolean(nullable: false),
                    IsActivated = c.Boolean(nullable: false),
                    InProgress = c.Boolean(nullable: false),
                    StartTime = c.DateTime(nullable: false, precision: 0),
                    EndTime = c.DateTime(nullable: false, precision: 0),
                    ModelName = c.String(unicode: false),
                    ModelDescription = c.String(unicode: false),
                    StartFuelWeight = c.Long(nullable: false),
                    FinishFuelWeight = c.Long(nullable: false),
                    AviationType = c.Int(nullable: false),
                    VideoUrl = c.String(unicode: false),
                    VideoDescription = c.String(unicode: false),
                    ChallengeCreatorUserId = c.String(unicode: false),
                    IsChallenge = c.Boolean(nullable: false),
                    ChallengeExpirationDate = c.DateTime(nullable: false, precision: 0),
                    ChallengeType = c.Int(nullable: false),
                    User_Id = c.String(maxLength: 128, storeType: "nvarchar"),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.aspnetusers", t => t.User_Id);
                //.Index(t => t.User_Id);
                Sql("CREATE index  `IX_User_Id` on `jobdbmodels` (`User_Id` DESC)");

            CreateTable(
                "dbo.licenseitemuserdbmodels",
                c => new
                {
                    Id = c.Long(nullable: false, identity: true),
                    IsBought = c.Boolean(nullable: false),
                    PilotLicenseItem_Id = c.Long(),
                    User_Id = c.String(maxLength: 128, storeType: "nvarchar"),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.pilotlicenseitemdbmodels", t => t.PilotLicenseItem_Id)
                .ForeignKey("dbo.aspnetusers", t => t.User_Id);
                //.Index(t => t.PilotLicenseItem_Id)
                //.Index(t => t.User_Id);
                Sql("CREATE index  `IX_PilotLicenseItem_Id` on `licenseitemuserdbmodels` (`PilotLicenseItem_Id` DESC)");
                Sql("CREATE index  `IX_User_Id` on `licenseitemuserdbmodels` (`User_Id` DESC)");

            CreateTable(
                "dbo.pilotlicenseitemdbmodels",
                c => new
                {
                    Id = c.Long(nullable: false, identity: true),
                    Name = c.String(unicode: false),
                    Price = c.Long(nullable: false),
                    Image = c.String(unicode: false),
                    PilotLicenseExpense_Id = c.Long(),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.pilotlicenseexpensesdbmodels", t => t.PilotLicenseExpense_Id);
                //.Index(t => t.PilotLicenseExpense_Id);
                Sql("CREATE index  `IX_PilotLicenseExpense_Id` on `pilotlicenseitemdbmodels` (`PilotLicenseExpense_Id` DESC)");

            CreateTable(
                "dbo.pilotlicenseexpensesdbmodels",
                c => new
                    {
                        Id = c.Long(nullable: false, identity: true),
                        Name = c.String(unicode: false),
                        DaysMaturity = c.Int(nullable: false),
                        Mandatory = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);

            CreateTable(
                "dbo.pilotlicenseexpensesuserdbmodels",
                c => new
                {
                    Id = c.Long(nullable: false, identity: true),
                    MaturityDate = c.DateTime(nullable: false, precision: 0),
                    OverdueProcessed = c.Boolean(nullable: false),
                    PilotLicenseExpense_Id = c.Long(),
                    User_Id = c.String(maxLength: 128, storeType: "nvarchar"),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.pilotlicenseexpensesdbmodels", t => t.PilotLicenseExpense_Id)
                .ForeignKey("dbo.aspnetusers", t => t.User_Id);
                //.Index(t => t.PilotLicenseExpense_Id)
                //.Index(t => t.User_Id);
                Sql("CREATE index  `IX_PilotLicenseExpense_Id` on `pilotlicenseexpensesuserdbmodels` (`PilotLicenseExpense_Id` DESC)");
                Sql("CREATE index  `IX_User_Id` on `pilotlicenseexpensesuserdbmodels` (`User_Id` DESC)");

            CreateTable(
                "dbo.aspnetroles",
                c => new
                {
                    Id = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                    Name = c.String(nullable: false, maxLength: 256, storeType: "nvarchar"),
                })
                .PrimaryKey(t => t.Id);
                //.Index(t => t.Name, unique: true, name: "RoleNameIndex");
                Sql("CREATE UNIQUE index  `IX_RoleName` on `aspnetroles` (`Name` DESC)");

            CreateTable(
                "dbo.statisticcertificatesdbmodels",
                c => new
                {
                    Id = c.Int(nullable: false, identity: true),
                    Certificate_Id = c.Int(),
                    Statistic_Id = c.Int(),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.certificatedbmodels", t => t.Certificate_Id)
                .ForeignKey("dbo.statisticsdbmodels", t => t.Statistic_Id);
                //.Index(t => t.Certificate_Id)
                //.Index(t => t.Statistic_Id);
                Sql("CREATE index  `IX_Certificate_Id` on `statisticcertificatesdbmodels` (`Certificate_Id` DESC)");
                Sql("CREATE index  `IX_Statistic_Id` on `statisticcertificatesdbmodels` (`Statistic_Id` DESC)");

            CreateTable(
                "dbo.statisticsdbmodels",
                c => new
                {
                    Id = c.Int(nullable: false, identity: true),
                    BankBalance = c.Long(nullable: false),
                    PilotScore = c.Long(nullable: false),
                    Logo = c.String(unicode: false),
                    SendLicenseWarning = c.Boolean(nullable: false),
                    SendAirlineBillsWarning = c.Boolean(nullable: false),
                    LicenseWarningSent = c.Boolean(nullable: false),
                    AirlineBillsWarningSent = c.Boolean(nullable: false),
                    UseCustomPlaneCapacity = c.Boolean(nullable: false),
                    WeightUnit = c.String(unicode: false),
                    Airline_Id = c.Int(),
                    CustomPlaneCapacity_Id = c.Long(),
                    User_Id = c.String(maxLength: 128, storeType: "nvarchar"),
                })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.airlinedbmodels", t => t.Airline_Id)
                .ForeignKey("dbo.customplanecapacitydbmodels", t => t.CustomPlaneCapacity_Id)
                .ForeignKey("dbo.aspnetusers", t => t.User_Id);
                //.Index(t => t.Airline_Id)
                //.Index(t => t.CustomPlaneCapacity_Id)
                //.Index(t => t.User_Id);
                Sql("CREATE index  `IX_Airline_Id` on `statisticsdbmodels` (`Airline_Id` DESC)");
                Sql("CREATE index  `IX_CustomPlaneCapacity_Id` on `statisticsdbmodels` (`CustomPlaneCapacity_Id` DESC)");
                Sql("CREATE index  `IX_User_Id` on `statisticsdbmodels` (`User_Id` DESC)");

        }
        
        public override void Down()
        {
            DropForeignKey("dbo.statisticcertificatesdbmodels", "Statistic_Id", "dbo.statisticsdbmodels");
            DropForeignKey("dbo.statisticsdbmodels", "User_Id", "dbo.aspnetusers");
            DropForeignKey("dbo.statisticsdbmodels", "CustomPlaneCapacity_Id", "dbo.customplanecapacitydbmodels");
            DropForeignKey("dbo.statisticsdbmodels", "Airline_Id", "dbo.airlinedbmodels");
            DropForeignKey("dbo.statisticcertificatesdbmodels", "Certificate_Id", "dbo.certificatedbmodels");
            DropForeignKey("dbo.aspnetuserroles", "RoleId", "dbo.aspnetroles");
            DropForeignKey("dbo.pilotlicenseexpensesuserdbmodels", "User_Id", "dbo.aspnetusers");
            DropForeignKey("dbo.pilotlicenseexpensesuserdbmodels", "PilotLicenseExpense_Id", "dbo.pilotlicenseexpensesdbmodels");
            DropForeignKey("dbo.licenseitemuserdbmodels", "User_Id", "dbo.aspnetusers");
            DropForeignKey("dbo.licenseitemuserdbmodels", "PilotLicenseItem_Id", "dbo.pilotlicenseitemdbmodels");
            DropForeignKey("dbo.pilotlicenseitemdbmodels", "PilotLicenseExpense_Id", "dbo.pilotlicenseexpensesdbmodels");
            DropForeignKey("dbo.jobairlinedbmodels", "Job_Id", "dbo.jobdbmodels");
            DropForeignKey("dbo.jobdbmodels", "User_Id", "dbo.aspnetusers");
            DropForeignKey("dbo.jobairlinedbmodels", "Airline_Id", "dbo.airlinedbmodels");
            DropForeignKey("dbo.customplanecapacitydbmodels", "User_Id", "dbo.aspnetusers");
            DropForeignKey("dbo.aspnetuserroles", "UserId", "dbo.aspnetusers");
            DropForeignKey("dbo.aspnetuserlogins", "UserId", "dbo.aspnetusers");
            DropForeignKey("dbo.aspnetuserclaims", "UserId", "dbo.aspnetusers");
            DropForeignKey("dbo.airlinefbodbmodels", "Airline_Id", "dbo.airlinedbmodels");
            DropForeignKey("dbo.airlinecertificatesdbmodels", "Certificate_Id", "dbo.certificatedbmodels");
            DropForeignKey("dbo.airlinecertificatesdbmodels", "Airline_Id", "dbo.airlinedbmodels");
            DropIndex("dbo.statisticsdbmodels", new[] { "User_Id" });
            DropIndex("dbo.statisticsdbmodels", new[] { "CustomPlaneCapacity_Id" });
            DropIndex("dbo.statisticsdbmodels", new[] { "Airline_Id" });
            DropIndex("dbo.statisticcertificatesdbmodels", new[] { "Statistic_Id" });
            DropIndex("dbo.statisticcertificatesdbmodels", new[] { "Certificate_Id" });
            DropIndex("dbo.aspnetroles", "RoleNameIndex");
            DropIndex("dbo.pilotlicenseexpensesuserdbmodels", new[] { "User_Id" });
            DropIndex("dbo.pilotlicenseexpensesuserdbmodels", new[] { "PilotLicenseExpense_Id" });
            DropIndex("dbo.pilotlicenseitemdbmodels", new[] { "PilotLicenseExpense_Id" });
            DropIndex("dbo.licenseitemuserdbmodels", new[] { "User_Id" });
            DropIndex("dbo.licenseitemuserdbmodels", new[] { "PilotLicenseItem_Id" });
            DropIndex("dbo.jobdbmodels", new[] { "User_Id" });
            DropIndex("dbo.jobairlinedbmodels", new[] { "Job_Id" });
            DropIndex("dbo.jobairlinedbmodels", new[] { "Airline_Id" });
            DropIndex("dbo.aspnetuserroles", new[] { "RoleId" });
            DropIndex("dbo.aspnetuserroles", new[] { "UserId" });
            DropIndex("dbo.aspnetuserlogins", new[] { "UserId" });
            DropIndex("dbo.aspnetuserclaims", new[] { "UserId" });
            DropIndex("dbo.aspnetusers", "UserNameIndex");
            DropIndex("dbo.customplanecapacitydbmodels", new[] { "User_Id" });
            DropIndex("dbo.airlinefbodbmodels", new[] { "Airline_Id" });
            DropIndex("dbo.airlinecertificatesdbmodels", new[] { "Certificate_Id" });
            DropIndex("dbo.airlinecertificatesdbmodels", new[] { "Airline_Id" });
            DropTable("dbo.statisticsdbmodels");
            DropTable("dbo.statisticcertificatesdbmodels");
            DropTable("dbo.aspnetroles");
            DropTable("dbo.pilotlicenseexpensesuserdbmodels");
            DropTable("dbo.pilotlicenseexpensesdbmodels");
            DropTable("dbo.pilotlicenseitemdbmodels");
            DropTable("dbo.licenseitemuserdbmodels");
            DropTable("dbo.jobdbmodels");
            DropTable("dbo.jobairlinedbmodels");
            DropTable("dbo.aspnetuserroles");
            DropTable("dbo.aspnetuserlogins");
            DropTable("dbo.aspnetuserclaims");
            DropTable("dbo.aspnetusers");
            DropTable("dbo.customplanecapacitydbmodels");
            DropTable("dbo.airlinefbodbmodels");
            DropTable("dbo.certificatedbmodels");
            DropTable("dbo.airlinedbmodels");
            DropTable("dbo.airlinecertificatesdbmodels");
        }
    }
}
