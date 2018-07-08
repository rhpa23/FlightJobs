using System.Data.Entity;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace FlightJobs.Models
{
    // You can add profile data for the user by adding more properties to your ApplicationUser class, please visit https://go.microsoft.com/fwlink/?LinkID=317594 to learn more.
    public class ApplicationUser : IdentityUser
    {
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
        {
            // Observe que o authenticationType deve corresponder àquele definido em CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            // Adicionar declarações de usuário personalizado aqui
            return userIdentity;
        }
    }

    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<JobDbModel> JobDbModels { get; set; }
        public DbSet<AirlineDbModel> AirlineDbModels { get; set; }
        public DbSet<AirlineCertificatesDbModel> AirlineCertificatesDbModels { get; set; }
        public DbSet<StatisticCertificatesDbModel> StatisticCertificatesDbModels { get; set; }
        public DbSet<CertificateDbModel> CertificateDbModels { get; set; }
        public DbSet<StatisticsDbModel> StatisticsDbModels { get; set; }
        public DbSet<JobAirlineDbModel> JobAirlineDbModels { get; set; }
        public DbSet<PilotLicenseExpensesDbModel> PilotLicenseExpenses { get; set; }
        public DbSet<PilotLicenseItemDbModel> PilotLicenseItem { get; set; }
        public DbSet<LicenseItemUserDbModel> LicenseItemUser { get; set; }
        public DbSet<PilotLicenseExpensesUserDbModel> PilotLicenseExpensesUser { get; set; }
        public DbSet<AirlineFboDbModel> AirlineFbo { get; set; }
        
        public ApplicationDbContext()
            : base("DefaultConnection", throwIfV1Schema: false)
        {
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }
    }
}