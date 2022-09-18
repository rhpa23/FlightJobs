using FlightJobs.Enums;
using FlightJobs.Models;
using FlightJobs.Util;
using PagedList;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FlightJobs.Controllers
{
    public class ChallengeController : BaseController
    {
        private const string CHALLENGE_SESSION_MODEL = "ChallengeSessionModel";
        private const int CHALLENGE_LIMIT = 5;
        private const decimal CHALLENGE_GAIN = 1.15M;

        // GET: Challenge
        public ActionResult Index()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);

            var model = new ChallengeViewModel()
            {
                Pax = 100,
                Cargo = 1000,
                PaxWeight = 84,
                WeightUnit = GetWeightUnit(Request)
            };

            var challengeList = dbContext.JobDbModels.Where(c =>
                            !c.IsDone && c.IsChallenge && 
                            c.ChallengeExpirationDate > DateTime.Now &&
                            c.User == null)
                            .OrderBy(j => j.Id).ToList();

            ViewBag.ChallengeCount = challengeList.Count();

            challengeList.ForEach(x =>
            {
                x.WeightUnit = GetWeightUnit(Request);
                x.IsChallengeFromCurrentUser = x.ChallengeCreatorUserId == user.Id;
            });

            model.UserActiveChallenges = GetUserActiveChallenges(user, dbContext);
            model.Challenges = challengeList.ToPagedList(1, 25);
            ViewBag.TitleChallenge = "Available Challenges";

            return View(model);
        }

        public ActionResult Update(int pax, int cargo, int paxWeight, string departure, string arrival, string type)
        {
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            long totalPayment = 0;
            long distance = 0;
            var weightUnit = GetWeightUnit(Request);
            var jobSerachModel = new JobSerachModel()
            {
                Departure = departure,
                Arrival = arrival,
                AviationType = "AirTransport",
                PassengerWeight = paxWeight,
                WeightUnit = weightUnit,
                CustomPlaneCapacity = new CustomPlaneCapacityDbModel()
                { CustomPassengerCapacity = pax, CustomCargoCapacityWeight = cargo },
            };

            var userStatistics = GetWebUserStatistics();

            var jobs = GenerateBoardJobs(jobSerachModel, userStatistics);
            if (jobs.Count == 0)
            {
                return null;
            }

            foreach (var j in jobs)
            {
                distance = j.Dist;
                totalPayment += j.Pay;
            }

            totalPayment = Convert.ToInt64(totalPayment * CHALLENGE_GAIN);

            var model = GetChallengerView(pax, cargo, paxWeight, departure, arrival, type, totalPayment, distance, weightUnit);

            if (model == null)
            {
                return PartialView("BriefingView", new ChallengeViewModel());
            }

            Session.Add(CHALLENGE_SESSION_MODEL, model);

            return PartialView("BriefingView", model);
        }

        private ChallengeViewModel GetChallengerView(int pax, int cargo, long paxWeight, string departure, string arrival, string type, long totalPayment, long distance, string weightUnit, int jobId = 0)
        {
            var departureModel = AirportDatabaseFile.FindAirportInfo(departure);
            var arrivalModel = AirportDatabaseFile.FindAirportInfo(arrival);

            var model = new ChallengeViewModel()
            {
                WeightUnit = GetWeightUnit(Request),
                ArrivalICAO = arrivalModel.ICAO,
                DepartureICAO = departureModel.ICAO,
                Cargo = cargo,
                Dist = distance,
                Pax = pax,
                PaxWeight = paxWeight,
                Type = type,
                TotalPayment = totalPayment,
                JobId = jobId
            };

            switch (type)
            {
                case "Civilian":
                    model.Briefing = $@"The biggest soccer team charter an unscheduled flight to participate in the championship. 
                The flight will depart from {departureModel.City} with {pax} players and all team delegation. 
                For the team's luggage and equipment will be loaded {model.Cargo}{weightUnit} in the hold of the plane.
                The final destination is {arrivalModel.City} airport. 
                The total payment involved is ${model.TotalPayment}.
                The captain will earn ${model.PaymentCaptain} when complete.
                The creator of the challenge will earn ${model.PaymentCreator}.";

                    model.WaterMarkImg = "/Content/img/challenger/civilian-water-mark-002.png";
                    break;
                case "Military":
                    model.Briefing = $@"The order of crew is transport the Defence Minister and his retinue of peace 
                from {departureModel.City} to {arrivalModel.City} (distance is {model.Dist} NM). 
                For this mission, the aircraft will take {pax} people on board and {model.Cargo}{weightUnit} of cargo 
                (total payload is {model.TotalPayload}{weightUnit}). 
                The total payment involved is ${model.TotalPayment}.
                The captain will earn ${model.PaymentCaptain} when complete this mission.
                The creator of the challenge will earn ${model.PaymentCreator}.";
                    model.WaterMarkImg = "/Content/img/challenger/military-water-mark-002.png";
                    break;
                case "Rescue":
                    model.Briefing = $@"A group of students are lost in a park at {arrivalModel.City}. 
                The only hope for the group is a speedy air rescue. The rescue aircraft will take off from {departureModel.City}
                with {pax} doctors and firefighters aboard, and {model.Cargo}{weightUnit} of rescue and fire containment equipment. 
                The total payment involved is ${model.TotalPayment}.
                The captain will earn ${model.PaymentCaptain} when complete this mission.
                The creator of the challenge will earn ${model.PaymentCreator}.";

                    model.WaterMarkImg = "/Content/img/challenger/rescue-water-mark-001.png";
                    break;
                default:
                    break;
            }
            return model;
        }

        public ActionResult Confirm()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var userChallenger = dbContext.JobDbModels.Count(x => x.IsChallenge && x.ChallengeCreatorUserId == user.Id && !x.IsDone && x.ChallengeExpirationDate > DateTime.Now);

            if (user != null && user.Email != AccountController.GuestEmail && userChallenger <= CHALLENGE_LIMIT)
            {
                
                if (Session[CHALLENGE_SESSION_MODEL] != null)
                {
                    var challenge = (ChallengeViewModel)Session[CHALLENGE_SESSION_MODEL];
                    var job = new JobDbModel()
                    {
                        IsChallenge = true,
                        ChallengeType = (ChallengeTypeEnum)Enum.Parse(typeof(ChallengeTypeEnum), challenge.Type),
                        ChallengeCreatorUserId = user.Id,
                        ChallengeExpirationDate = DateTime.Now.AddDays(5),
                        DepartureICAO = challenge.DepartureICAO,
                        ArrivalICAO = challenge.ArrivalICAO,
                        AviationType = 2,
                        Cargo = challenge.Cargo,
                        Pax = challenge.Pax,
                        Pay = challenge.TotalPayment,
                        Dist = challenge.Dist,
                        StartTime = DateTime.Now,
                        EndTime = DateTime.Now
                    };
                    dbContext.JobDbModels.Add(job);
                    dbContext.SaveChanges();
                }
            }

            return RedirectToAction("Index", "Challenge");
        }

        public ActionResult ShowChallengeDetails(int jobId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var userStatistics = GetUserStatistics(user.Id);
            var viewModel = new ChallengeViewModel();
            var jobDb = dbContext.JobDbModels.FirstOrDefault(j => j.Id == jobId);
            if (jobDb != null)
            {
                var weightUnit = GetWeightUnit(Request);
                var cargo = GetWeight(Request, jobDb.Cargo, userStatistics);
                var paxWeight = jobDb.Pax * GetWeight(Request, jobDb.PaxWeight, userStatistics); 
                viewModel = GetChallengerView((int)jobDb.Pax, (int)cargo, paxWeight, jobDb.DepartureICAO, jobDb.ArrivalICAO, jobDb.ChallengeType.ToString(), jobDb.Pay, jobDb.Dist, weightUnit, jobId);
            }
            else
            {
                TempData["ErroMessage"] = @"This challenge not exist.";
            }

            if (!jobDb.IsActivated)
            {
                dbContext.JobDbModels.Where(j => j.User.Id == user.Id && j.IsActivated).ToList().ForEach(x =>
                            x.IsActivated = false
                        );
                jobDb.IsActivated = true;
                dbContext.SaveChanges();
                TempData["JobsUpdated"] = "When jobs are updated.";
            }

            TempData["ShowDetails"] = "Show Challenge details.";

            return PartialView("BriefingView", viewModel);
        }

        public ActionResult OpenChallengerBriefing(int jobId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);

            var jobDb =  dbContext.JobDbModels.FirstOrDefault(j => j.Id == jobId && j.User == null);
            if (jobDb != null)
            {
                var weightUnit = GetWeightUnit(Request);
                var viewModel = GetChallengerView((int)jobDb.Pax, (int)jobDb.Cargo, jobDb.PaxWeight, jobDb.DepartureICAO, jobDb.ArrivalICAO, jobDb.ChallengeType.ToString(), jobDb.Pay, jobDb.Dist, weightUnit, jobId);
                if (jobDb.ChallengeCreatorUserId == user.Id)
                {
                    TempData["ErroMessage"] = "You cannot take this challenge because you created it yourself.";
                }

                if (UserAlreadyAssignedChallenge(user, dbContext))
                {
                    TempData["ErroMessage"] = @"You already have one challenge to do. 
                          Please complete your current challenge to assign a new one.";
                }

                return PartialView("AssignChallengerView", viewModel);
            }
            else
            {
                TempData["ErroMessage"] = @"This challenge not exist or another pilot already took.";
            }

            return RedirectToAction("Index");
        }

        public ActionResult AssignChallenger(int jobId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var userChallenger = dbContext.JobDbModels.Count(x => x.IsChallenge && x.ChallengeCreatorUserId == user.Id && !x.IsDone && x.ChallengeExpirationDate > DateTime.Now);

            if (user != null && user.Email != AccountController.GuestEmail && userChallenger <= CHALLENGE_LIMIT)
            {
                if (UserAlreadyAssignedChallenge(user, dbContext))
                {
                    TempData["ErroMessageAssign"] =
                        @"You already have one challenge to do. 
                          Please complete your current challenge to assign a new one.";
                    return RedirectToAction("Index");
                }

                var job = dbContext.JobDbModels.FirstOrDefault(j => 
                        j.Id == jobId &&
                        j.User == null &&
                        !j.IsDone &&
                        !j.IsActivated &&
                        j.IsChallenge &&
                        j.ChallengeExpirationDate >= DateTime.Now
                );

                if (job != null)
                {
                    dbContext.JobDbModels.Where(j => j.User.Id == user.Id && j.IsActivated).ToList().ForEach(x =>
                        x.IsActivated = false
                    );
                    job.User = user;
                    job.IsActivated = true;
                    dbContext.SaveChanges();
                }
                else
                {
                    TempData["ErroMessageAssign"] = @"This challenge not exist or another pilot already took.";
                }
            }

            return RedirectToAction("Index");
        }
    }
}