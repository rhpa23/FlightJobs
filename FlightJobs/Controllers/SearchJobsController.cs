using FlightJobs.Models;
using FlightJobs.Util;
using System;
using System.Collections.Generic;
using System.Device.Location;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity.Owin;

namespace FlightJobs.Controllers
{
    public class SearchJobsController : Controller
    {
        private double taxEcon = 0.009; // por NM
        private double taxFirstC = 0.013; // por NM

        private double taxCargo = 0.0004; // por NM

        private ApplicationUserManager _userManager;

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }


        // GET: SearchJobs
        public ActionResult Index()
        {
            Session.Remove("JobSearchResult");
            if (Session["JobSerachModel"] != null)
            {
                JobSerachModel model = (JobSerachModel)Session["JobSerachModel"];
                return View(model);
            }
            else
            {
                var model = new JobSerachModel() {
                    MaxRange = 450, MinRange = 10
                };
                return View(model);
            }
           
        }

        [HttpPost]
        public ActionResult Index(JobSerachModel model)
        {
            Session.Add("JobSerachModel", model);
            ViewBag.JobSerachModel = model;
            return Result(-1, string.Empty);
        }

        public ActionResult Result(int? pageNumber, string ids)
        {
            if (Session["JobSerachModel"] != null)
            {
                IList<JobListModel> jobs = new List<JobListModel>();
                JobSerachModel modelParam = (JobSerachModel)Session["JobSerachModel"];
                if (pageNumber == -1)
                {
                    pageNumber = 1;
                    jobs = GenerateBoardJobs(modelParam);
                    Session.Add("JobSearchResult", jobs);
                }
                else
                {
                    if (Session["JobSearchResult"] != null)
                    {
                        jobs = (IList<JobListModel>)Session["JobSearchResult"];
                    }
                }

                string[] idSel = string.IsNullOrEmpty(ids) ? new string[]{ } : ids.Split(',');
                foreach (var id in idSel)
                {
                    var job = jobs.FirstOrDefault(j => j.Id == Convert.ToInt32(id));
                    job.Selected = true;
                }

                return View("Result", jobs.OrderBy(x => x.Dist).ToPagedList(pageNumber ?? 1, 45));
            }
            else
            {
                return View("Index");
            }
        }

        [HttpPost]
        public ActionResult ResultNext(FormCollection form)
        {
            var ids = new List<int>();
            var pageSelsIds = form["sels"];
            if (pageSelsIds != null)
            {
                string[] sList = pageSelsIds.ToString().Split(',');
                foreach (var idString in sList)
                {
                    ids.Add(Convert.ToInt32(idString));
                }
            }

            long totalPax = 0;
            long totalCargo = 0;
            long totalPay = 0;

            var list = new Dictionary<string, JobDbModel>();
            var jobs = (IList<JobListModel>)Session["JobSearchResult"];
            if (jobs != null)
            {
                foreach (var job in jobs.Where(j => j.Selected || ids.Contains(j.Id)))
                {
                    JobDbModel jobDB;
                    if (!list.ContainsKey(job.Arrival))
                    {
                        jobDB = new JobDbModel()
                        {
                            DepartureICAO = job.Departure.ICAO,
                            ArrivalICAO = job.Arrival,
                            Dist = job.Dist,
                            Pax = job.Pax,
                            Cargo = job.Cargo,
                            Pay = job.Pay,
                            FirstClass = job.FirstClass
                        };

                        list.Add(job.Arrival, jobDB);
                    }
                    else
                    {
                        jobDB = list[job.Arrival];

                        jobDB.Pax += job.Pax;
                        jobDB.Cargo += job.Cargo;
                        jobDB.Pay += job.Pay;
                    }
                    totalPax += job.Pax;
                    totalCargo += job.Cargo;
                    totalPay += job.Pay;
                }
            }

            //ViewBag.TotalPax = totalPax;
            //ViewBag.TotalCargo = totalCargo;
            //ViewBag.TotalPay = string.Format("{0:C}", totalPay);
            //ViewBag.TotalPayload = string.Format("{0:G}", (totalPax * JobDbModel.PaxWeight) + totalCargo);

            var jobList = list.Values.ToList();
            Session.Add("ListSelJobs", jobList);

            var viewModel = new ConfirmJobsViewModel()
            {
                JobsList = jobList,
                TotalPax = totalPax,
                TotalCargo = totalCargo,
                TotalPay = string.Format("{0:C}", totalPay),
                TotalPayload = string.Format("{0:G}", (totalPax * JobDbModel.PaxWeight) + totalCargo)
        };

            //return View("Confirm", list.Values.ToList());
            //return Result(1, pageSelsIds);
            //return Json(new { Data = form, success = ModelState.IsValid ? true : false }, JsonRequestBehavior.AllowGet);
            return PartialView("Confirm", viewModel);
        }

        public async Task<ActionResult> Confirm()
        {
            if (Session["ListSelJobs"] != null)
            {
                var dbContext = new ApplicationDbContext();
                var user =  dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);

                foreach (var selJob in (List<JobDbModel>)Session["ListSelJobs"])
                {
                    selJob.User = user;
                    selJob.StartTime = DateTime.Now;
                    selJob.EndTime = DateTime.Now;

                    if (Session["JobSerachModel"] != null)
                    {
                        JobSerachModel searchModel = (JobSerachModel)Session["JobSerachModel"];
                        if (!string.IsNullOrEmpty(searchModel.Alternative) && searchModel.Alternative.Length == 4)
                        {
                            selJob.AlternativeICAO = searchModel.Alternative.ToUpper();
                        }
                    }

                    dbContext.JobDbModels.Add(selJob);
                }
                dbContext.SaveChanges();
            }

            return RedirectToAction("Index", "Home");
        }

        private IList<JobListModel> GenerateBoardJobs(JobSerachModel model)
        {
            IList<JobListModel> listBoardJobs = new List<JobListModel>();

            try
            {
                var dep = AirportDatabaseFile.FindAirportInfo(model.Departure);

                var depCoord = new GeoCoordinate(dep.Latitude, dep.Longitude);
                var randomPob = new Random();
                var randomCargo = new Random();
                int id = 0;

                foreach (var arrival in AirportDatabaseFile.GetAllAirportInfo())
                {
                    
                    var arrCoord = new GeoCoordinate(arrival.Latitude, arrival.Longitude);
                    var distMeters = depCoord.GetDistanceTo(arrCoord);
                    var distMiles = (int)DataConversion.ConvertMetersToMiles(distMeters);
                    if (distMiles >= model.MinRange && distMiles <= model.MaxRange && arrival.ICAO.ToUpper() != dep.ICAO.ToUpper() && 
                        arrival.ICAO.ToUpper() == model.Arrival.ToUpper())
                    {
                        int index = randomPob.Next(14, 25);

                        for (int i = 0; i < index; i++)
                        {
                            int pob = 0;
                            int cargo = 0;
                            long profit = 0;
                            bool isFisrtClass = Convert.ToBoolean(randomPob.Next(2));


                            int isCargo = randomPob.Next(2);
                            if (isCargo == 0)
                            {
                                if (model.AviationType == "GeneralAviation")
                                {
                                    cargo = randomCargo.Next(10, 300);
                                }
                                else if (model.AviationType == "AirTransport")
                                {
                                    cargo = randomCargo.Next(100, 3000);
                                }
                                else // HeavyAirTransport
                                {
                                    cargo = randomCargo.Next(800, 6000);
                                }
                                
                                profit = Convert.ToInt32(taxCargo * distMiles * cargo);
                            }
                            else
                            {
                                if (model.AviationType == "GeneralAviation")
                                {
                                    pob = randomPob.Next(1, 10);
                                }
                                else if (model.AviationType == "AirTransport")
                                {
                                    pob = randomPob.Next(10, 80);
                                }
                                else // HeavyAirTransport
                                {
                                    pob = randomPob.Next(50, 140);
                                }

                                profit = isFisrtClass ? Convert.ToInt32(taxFirstC * distMiles * pob) : Convert.ToInt32(taxEcon * distMiles * pob);
                            }

                            listBoardJobs.Add(new JobListModel()
                            {
                                Id = id++,
                                Departure = dep,
                                Arrival = arrival.ICAO,
                                Dist = distMiles,
                                Pax = pob,
                                Cargo = cargo,
                                PayloadView = (isCargo == 0) ? "[Cargo] " + cargo + " Kg" : (isFisrtClass) ? "[Premium] " + pob + " Pax" : "[Promo] " + pob + " Pax",
                                Pay = profit,
                                FirstClass = isFisrtClass
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("error", ex.Message);
            }

            return listBoardJobs.OrderBy(j => j.Arrival).ThenBy(x => x.PayloadView).ToList();
        }

    }
}
