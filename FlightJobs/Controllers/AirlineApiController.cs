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
        //GetAirliners
        [System.Web.Http.HttpPost]
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
    }
}