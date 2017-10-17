using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.AspNet.Identity;
using System.Web;
using System.Web.Mvc;
using System.Threading.Tasks;

namespace FlightJobs.Controllers
{
    public class WebApiController : ApiController
    {
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.Current.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }

        // GET: api/Api
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        [System.Web.Http.HttpGet]
        [System.Web.Mvc.AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<HttpResponseMessage> Login(int id)
        {
            string email = Request.Headers.GetValues("Email").First();
            string password = Request.Headers.GetValues("Password").First();

            var response = Request.CreateResponse(HttpStatusCode.OK, "Login ok");

            var userModel = await UserManager.FindByNameAsync(email);
            if (userModel == null)
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized, "Invalid login attempt.");
            }
            //Add this to check if the email was confirmed.
            if (!await UserManager.IsEmailConfirmedAsync(userModel.Id))
            {
                return Request.CreateResponse(HttpStatusCode.Forbidden, "You need to confirm your email.");
            }

            // Isso não conta falhas de login em relação ao bloqueio de conta
            // Para permitir que falhas de senha acionem o bloqueio da conta, altere para shouldLockout: true
            var result = await SignInManager.PasswordSignInAsync(email, password, true, shouldLockout: false);
            switch (result)
            {
                case SignInStatus.Success:
                    return Request.CreateResponse(HttpStatusCode.OK, "Login ok");
                case SignInStatus.LockedOut:
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Lockout");
                case SignInStatus.RequiresVerification:
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Requires verification");
                case SignInStatus.Failure:
                    return Request.CreateResponse(HttpStatusCode.Forbidden, "Your login attempt failed.");
            }

            // Set headers for paging
           // response.Headers.Add("HEADER_TEST", "HEADER_TEST_VALUE");
           
            return response;
        }

        // POST: api/Api
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Api/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Api/5
        public void Delete(int id)
        {
        }
    }
}
