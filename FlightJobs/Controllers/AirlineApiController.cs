using FlightJobs.DTOs;
using FlightJobs.Models;
using PagedList;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace FlightJobs.Controllers
{
    public class AirlineApiController : ApiController
    {
        [HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage GetAirliners(string sortOrder, string currentSort, int? pageNumber, [FromBody] PaginatedAirlineFilterTO airlineFilterTO)
        {
            // TODO: sortOrder = String.IsNullOrEmpty(sortOrder) ? "Date" : sortOrder;
            int pageSize = 40;

            var dbContext = new ApplicationDbContext();
            var list = dbContext.AirlineDbModels.Where(x => 
            (
                x.Name.Equals(airlineFilterTO.Name, StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(airlineFilterTO.Name)) &&
                (x.Country.Equals(airlineFilterTO.Country, StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(airlineFilterTO.Country))
            ).OrderByDescending(x => x.AirlineScore).ToList();

            var userStatistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == airlineFilterTO.UserId);
            // Remove user airline
            var userAirline = list.FirstOrDefault(x => x.Id == userStatistics?.Airline?.Id);
            if (userAirline != null)
                list.Remove(userAirline);

            var pagedJobs = list.ToPagedList(pageNumber ?? 1, pageSize);
            var paginatedAirlines = new PaginatedAirlinersTO()
            {
                HasNextPage = pagedJobs.HasNextPage,
                HasPreviousPage = pagedJobs.HasPreviousPage,
                IsFirstPage = pagedJobs.IsFirstPage,
                IsLastPage = pagedJobs.IsLastPage,
                PageCount = pagedJobs.PageCount,
                PageNumber = pagedJobs.PageNumber,
                PageSize = pagedJobs.PageSize,
                TotalItemCount = pagedJobs.TotalItemCount,
                Airlines = pagedJobs.ToList()
            };
            return Request.CreateResponse(HttpStatusCode.OK, paginatedAirlines);
        }

        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage GetPilotsHired(int id)
        {
            var airlinePilotsHired = new AirlinesController().PilotsHired(id);
            var list = airlinePilotsHired.ToList().Select(x =>
                new UserSimpleTO() { Id = x.User.Id, UserName = x.User.UserName, Email = x.User.Email }
            );
            return Request.CreateResponse(HttpStatusCode.OK, list.ToList());
        }

        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage GetAirlineFBOs(int id)
        {
            var list = new ProfileController().GetHiredFbos(id);
            return Request.CreateResponse(HttpStatusCode.OK, list.ToList());
        }

        [HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage CreateAirline([FromBody] AirlineTO airlineTO)
        {
            var dbContext = new ApplicationDbContext();

            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == airlineTO.UserId);

            if (statistics != null && statistics.BankBalance >= AirlinesController.AIRLINE_PRICE)
            {
                var dbModel = new AirlineDbModel()
                {
                    Name = airlineTO.Airline.Name,
                    Description = airlineTO.Airline.Description,
                    Country = airlineTO.Airline.Country,
                    Salary = 20,
                    Score = airlineTO.Airline.Score,
                    UserId = airlineTO.UserId,
                    DebtMaturityDate = DateTime.Now,
                    Logo = airlineTO.Airline.Logo
                };

                dbContext.AirlineDbModels.Add(dbModel);

                statistics.BankBalance = statistics.BankBalance - AirlinesController.AIRLINE_PRICE;
                statistics.Airline = dbModel;

                dbContext.SaveChanges();

                return Request.CreateResponse(HttpStatusCode.OK, dbModel);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.NoContent);
            }
        }

        [HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage UpdateAirline([FromBody] AirlineTO airlineTO)
        {
            var dbContext = new ApplicationDbContext();
            // Check GUEST
            var user = dbContext.Users.FirstOrDefault(u => u.Id == airlineTO.UserId);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound, false);
            }
            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == airlineTO.Airline.Id && a.UserId == user.Id);

            if (airline != null)
            {
                var certsAirline = dbContext.AirlineCertificatesDbModels.Include("Certificate").Where(c => c.Airline.Id == airline.Id).ToList();

                airline.Name = airlineTO.Airline.Name;
                airline.Description = airlineTO.Airline.Description;
                airline.Country = airlineTO.Airline.Country;
                airline.Score = airlineTO.Airline.Score;
                airline.Logo = airlineTO.Airline.Logo;

                dbContext.SaveChanges();
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.NotFound, false);
            }
            return Request.CreateResponse(HttpStatusCode.OK, true);
        }

        [HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage PayAirlineDebts([FromBody] AirlineTO airlineTO)
        {
            new HomeController().PayDebt(airlineTO.Airline.Id, airlineTO.UserId);
            return Request.CreateResponse(HttpStatusCode.OK, true);
        }

        [HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage GetAirlineLedger(int airlineId, int pageNumber, [FromBody] JobTO JobFilter)
        {
            var listLedger = new ProfileController().GetAirlineLedgerByFilter(airlineId, pageNumber, JobFilter);
            var paginatedJobs = new PaginatedAirlineJobsTO()
            {
                HasNextPage = listLedger.HasNextPage,
                HasPreviousPage = listLedger.HasPreviousPage,
                IsFirstPage = listLedger.IsFirstPage,
                IsLastPage = listLedger.IsLastPage,
                PageCount = listLedger.PageCount,
                PageNumber = listLedger.PageNumber,
                PageSize = listLedger.PageSize,
                TotalItemCount = listLedger.TotalItemCount,
                AirlineJobs = listLedger.ToList()
            };

            return Request.CreateResponse(HttpStatusCode.OK, paginatedJobs);
        }

        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage GetFOBs(string icao, int airlineId)
        {
            var airlineFbos = new ProfileController().GetFboListByFilter(icao, airlineId);
            return Request.CreateResponse(HttpStatusCode.OK, airlineFbos.FboResults);
        }

        [HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage HireAirlineFbo(HireFboTO hireFboTO)
        {
            var airlineFbo = new ProfileController().HireFboData(hireFboTO.Icao, hireFboTO.UserId);
            if (airlineFbo.Data is AirlineFboView)
            {
                return Request.CreateResponse(HttpStatusCode.OK, ((AirlineFboView)airlineFbo.Data).FboHired);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.NotFound, airlineFbo);
            }
        }

        [HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage JoinAirline([FromBody] AirlineTO airlineTO)
        {
            var dbContext = new ApplicationDbContext();

            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == airlineTO.Airline.Id);
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == airlineTO.UserId);
            if (statistics != null && statistics.PilotScore >= airline.Score)
            {
                statistics.Airline = airline;
                dbContext.SaveChanges();

                var msg = $"Congratulations, you signed contract with {airline.Name} airline in Brazil.";
                return Request.CreateResponse(HttpStatusCode.OK, msg);
            }
            else
            {
                var validationMessage = $"You need {airline.Score} scores to join with {airline.Name}. *** Your current score is: {statistics.PilotScore} ***";
                return Request.CreateResponse(HttpStatusCode.BadRequest, validationMessage);
            }
        }

        [HttpPost]
        [System.Web.Mvc.AllowAnonymous]
        public HttpResponseMessage ExitAirline([FromBody] AirlineTO airlineTO)
        {
            var dbContext = new ApplicationDbContext();

            var statistics = dbContext.StatisticsDbModels.Include("Airline").FirstOrDefault(s => s.User.Id == airlineTO.UserId && s.Airline.Id == airlineTO.Airline.Id);
            if (statistics != null)
            {
                statistics.Airline = null;
                dbContext.Entry(statistics).State = System.Data.Entity.EntityState.Modified;
                dbContext.SaveChanges();

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }
        }

        public HttpResponseMessage GetRanking()
        {
            var dbContext = new ApplicationDbContext();
            var listAirlines = dbContext.AirlineDbModels.OrderByDescending(a => a.AirlineScore).Take(5);

            return Request.CreateResponse(HttpStatusCode.OK, listAirlines.ToList());
        }
    }
}