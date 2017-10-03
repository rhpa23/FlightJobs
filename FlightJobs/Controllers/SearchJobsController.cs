using FlightJobs.Models;
using FlightJobs.Util;
using System;
using System.Collections.Generic;
using System.Device.Location;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;


namespace FlightJobs.Controllers
{
    public class SearchJobsController : Controller
    {
        private double taxEcon = 0.54; // por NM
        private double taxFirstC = 0.67; // por NM

        private double taxCargo = 0.012; // por NM


        // GET: SearchJobs
        public ActionResult Index()
        {
            if (Session["JobSerachModel"] != null)
            {
                JobSerachModel model = (JobSerachModel)Session["JobSerachModel"];
                return View(model);
            }
            else
            {
                return View();
            }
           
        }

        [HttpPost]
        public ActionResult Index(JobSerachModel model)
        {
            Session.Add("JobSerachModel", model);
            ViewBag.JobSerachModel = model;
            return Result(-1);
        }

        public ActionResult Result(int? pageNumber)
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

                if (Session["ListSelJobs"] != null)
                {
                    foreach (var selJob in (List<JobDbModel>)Session["ListSelJobs"])
                    {
                        jobs.FirstOrDefault(j => j.Arrival == selJob.ArrivalICAO && j.Pay == selJob.Pay).Selected = true;
                    }
                }

                return View("Result", jobs.OrderBy(x => x.Dist).ToPagedList(pageNumber ?? 1, 10));
            }
            else
            {
                return View("Index");
            }
        }

        [HttpPost]
        public ActionResult Result(string[] sels, FormCollection form)
        {
            //List<JobDbModel> listSelJobs = new List<JobDbModel>();
            var list = new Dictionary<string, JobDbModel>();
            long totalPax = 0;
            long totalCargo = 0;
            long totalPay = 0;

            if (sels != null && sels.Length > 0)
            {
                foreach (var item in sels)
                {
                    string[] iSelJob = item.Split('|');
                    // Departure | Arrival | Dist | Pax | Cargo | Pay | FirstClass
                    string arrival = iSelJob[1];

                    JobDbModel job;

                    if (!list.ContainsKey(arrival))
                    {
                        totalPax = 0;
                        totalCargo = 0;
                        totalPay = 0;

                        job = new JobDbModel()
                        {
                            DepartureICAO = iSelJob[0],
                            ArrivalICAO = iSelJob[1],
                            Dist = string.IsNullOrEmpty(iSelJob[2]) ? 0 : long.Parse(iSelJob[2]),
                            Pax = string.IsNullOrEmpty(iSelJob[3]) ? 0 : long.Parse(iSelJob[3]),
                            Cargo = string.IsNullOrEmpty(iSelJob[4]) ? 0 : long.Parse(iSelJob[4]),
                            Pay = string.IsNullOrEmpty(iSelJob[5]) ? 0 : long.Parse(iSelJob[5]),
                            FirstClass = Convert.ToBoolean(iSelJob[6])
                        };

                        list.Add(arrival, job);
                    }
                    else
                    {
                        job = list[arrival];

                        job.Pax += string.IsNullOrEmpty(iSelJob[3]) ? 0 : long.Parse(iSelJob[3]);
                        job.Cargo += string.IsNullOrEmpty(iSelJob[4]) ? 0 : long.Parse(iSelJob[4]);
                        job.Pay += string.IsNullOrEmpty(iSelJob[5]) ? 0 : long.Parse(iSelJob[5]);
                    }
                }
            }
            ViewBag.TotalPax = totalPax;
            ViewBag.TotalCargo = totalCargo;
            ViewBag.TotalPay = string.Format("{0:C}", totalPay);


            Session.Add("ListSelJobs", list.Values.ToList());


            return View("Confirm", list.Values.ToList());
        }


        [HttpPost]
        public ActionResult Confirm()
        {
            if (Session["ListSelJobs"] != null)
            {
                foreach (var selJob in (List<JobListModel>)Session["ListSelJobs"])
                {

                }
            }

            return View("Index");
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

                foreach (var arrival in AirportDatabaseFile.GetAllAirportInfo())
                {
                    var arrCoord = new GeoCoordinate(arrival.Latitude, arrival.Longitude);
                    var distMeters = depCoord.GetDistanceTo(arrCoord);
                    var distMiles = (int)DataConversion.ConvertMetersToMiles(distMeters);
                    if (distMiles <= model.Range && arrival.ICAO.ToUpper() != dep.ICAO.ToUpper() && 
                        (model.Arrival == null || arrival.ICAO.ToUpper().Contains(model.Arrival.ToUpper())))
                    {
                        int index = randomPob.Next(4, 11);

                        for (int i = 0; i < index; i++)
                        {
                            int pob = 0;
                            int cargo = 0;
                            long profit = 0;
                            bool isFisrtClass = Convert.ToBoolean(randomPob.Next(2));

                            int isCargo = randomPob.Next(2);
                            if (isCargo == 0)
                            {
                                cargo = randomCargo.Next(100, 3000);
                                profit = Convert.ToInt32(taxCargo * distMiles * cargo);
                            }
                            else
                            {
                                pob = randomPob.Next(10, 60); 
                                profit = isFisrtClass ? Convert.ToInt32(taxFirstC * distMiles * pob) : Convert.ToInt32(taxEcon * distMiles * pob);
                            }

                            listBoardJobs.Add(new JobListModel()
                            {
                                Departure = dep,
                                Arrival = arrival.ICAO,
                                Dist = distMiles,
                                Pax = pob,
                                Cargo = cargo,
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

            return listBoardJobs;
        }

    }
}
