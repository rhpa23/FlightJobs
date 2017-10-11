using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(FlightJobs.Startup))]
namespace FlightJobs
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
