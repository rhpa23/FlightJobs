using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;

namespace FlightJobs.Controllers
{
    public class AirlinesController : Controller
    {
        private int airlinePrice = 40000;

        private string path = "/Content/img/logo/";

        // GET: Airlines
        public ActionResult Index()
        {
            ViewBag.Message = TempData["Message"];
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var list = dbContext.AirlineDbModels.OrderByDescending(x => x.Id).ToList();
            var statisticsList = dbContext.StatisticsDbModels;

            var userStatistics = statisticsList.FirstOrDefault(s => s.User.Id == user.Id);

            foreach (var airline in list)
            {
                var airlinePilotsHired = statisticsList.Where(s => s.Airline != null && s.Airline.Id == airline.Id).ToList();
                airline.AlowExit = airlinePilotsHired.Any(x => x.User.Id == user.Id);

                var ownerUserStatistics = statisticsList.FirstOrDefault(s => airline.UserId != null && s.User.Id == airline.UserId);
                if (ownerUserStatistics != null)
                {
                    airline.OwnerUserStatistics = ownerUserStatistics;
                    airline.OwnerUserStatistics.AirlinePilotsHired = airlinePilotsHired;
                    airline.AlowEdit = airline.UserId == user.Id;
                }
            }

            if (userStatistics != null && userStatistics.Airline != null)
            {
                // Move user airline to first position
                var a = list.FirstOrDefault(x => x.Id == userStatistics.Airline.Id);
                list.Remove(a);
                list.Insert(0, a);
            }
            

            return View(list);
        }

        public ActionResult Sign(int id)
        {
            var dbContext = new ApplicationDbContext();
            // Check GUEST
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                TempData["GuestMessage"] = AccountController.GuestMessage;
                return RedirectToAction("Register", "Account");
            }

            var certificateView = new CertificateViewModel();
            certificateView.Certificates = new List<CertificateDbModel>();

            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == id);
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            if (statistics != null && statistics.PilotScore >= airline.Score)
            {
                certificateView.Airline = airline;
                certificateView.Statistic = statistics;

                var certsAirline = dbContext.AirlineCertificatesDbModels.Include("Certificate").Where(c => c.Airline.Id == id).ToList();
                var certsUser = dbContext.StatisticCertificatesDbModels.Include("Certificate").Where(u => u.Statistic.Id == statistics.Id).ToList();
                foreach (var airCert in certsAirline)
                {
                    airCert.Certificate.Selected = certsUser.Any(u => u.Certificate.Id == airCert.Certificate.Id);
                    certificateView.Certificates.Add(airCert.Certificate);
                }

                return View("Contract", certificateView);
            }
            else
            {
                TempData["Message"] = string.Format("You need {0} scores to sign contract with {1}.", airline.Score, airline.Name);
                return RedirectToAction("Index");
            }
        }

        public ActionResult Exit(int id)
        {
            var dbContext = new ApplicationDbContext();
            // Check GUEST
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                TempData["GuestMessage"] = AccountController.GuestMessage;
                return RedirectToAction("Register", "Account");
            }

            var statistics = dbContext.StatisticsDbModels.Include("Airline").FirstOrDefault(s => s.User.Id == user.Id && s.Airline.Id == id);
            if (statistics != null)
            {
                var certsUser = dbContext.StatisticCertificatesDbModels.Include("Certificate").Where(u => u.Statistic.Id == statistics.Id).ToList();
                dbContext.StatisticCertificatesDbModels.RemoveRange(certsUser);
                statistics.Airline = null;
                dbContext.Entry(statistics).State = System.Data.Entity.EntityState.Modified;

                dbContext.SaveChanges();
                TempData["ExitMessage"] = $"You are out of the airline.";
            }
            return RedirectToAction("Index");
        }

        public ActionResult Buy(int id, int airlineId)
        {
            var dbContext = new ApplicationDbContext();
            // Check GUEST
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                TempData["GuestMessage"] = AccountController.GuestMessage;
                return RedirectToAction("Register", "Account");
            }
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            var certificate = dbContext.CertificateDbModels.FirstOrDefault(c => c.Id == id);

            if (statistics != null && statistics.BankBalance >= certificate.Price)
            {
                var statisticCertificate = new StatisticCertificatesDbModel();
                statisticCertificate.Certificate = certificate;
                statisticCertificate.Statistic = statistics;
                dbContext.StatisticCertificatesDbModels.Add(statisticCertificate);

                statistics.BankBalance = statistics.BankBalance - certificate.Price;

                dbContext.SaveChanges();

                PopUpCertificateTest(certificate);
                Session["HeaderStatistics"] = null;
            }
            else
            {
                ViewBag.Message = "You don't have enough bank balance to buy this certificate.";
            }

            return Sign(airlineId);
        }

        public ActionResult Confirm(int id)
        {
            var dbContext = new ApplicationDbContext();
            // Check GUEST
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                TempData["GuestMessage"] = AccountController.GuestMessage;
                return RedirectToAction("Register", "Account");
            }
            var certificateView = new CertificateViewModel();
            certificateView.Certificates = new List<CertificateDbModel>();

            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == id);

            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            certificateView.Airline = airline;
            certificateView.Statistic = statistics;

            var certsAirline = dbContext.AirlineCertificatesDbModels.Include("Certificate").Where(c => c.Airline.Id == id).ToList();
            var certsUser = dbContext.StatisticCertificatesDbModels.Where(u => u.Statistic.Id == statistics.Id).ToList();
            foreach (var airCert in certsAirline)
            {
                airCert.Certificate.Selected = certsUser.Any(u => u.Certificate != null && u.Certificate.Id == airCert.Certificate.Id);
                certificateView.Certificates.Add(airCert.Certificate);
            }

            if (certsAirline.Any(c => c.Certificate.Selected == false))
            {
                ViewBag.Message = "You need to buy all certificates to sign contract.";
            }
            else
            {
                dbContext.StatisticCertificatesDbModels.RemoveRange(certsUser); // To recycle certificates in next contract.

                statistics.Airline = airline;
                dbContext.SaveChanges();
                ViewBag.Message = "Congratulations, you signed contract with " + airline.Name + " airline in " + airline.Country + ".";
                Session["HeaderStatistics"] = null;
            }

            return View("Contract", certificateView);

        }

        private void PopUpCertificateTest(CertificateDbModel certificate)
        {
            string strUrl = "https://goo.gl/forms/8GHdrmENEDHpF2tG3";
            switch (certificate.Name)
            {
                case "Private Pilot":
                    strUrl = "https://goo.gl/forms/8GHdrmENEDHpF2tG3";
                    break;
                case "Commercial Pilot":
                    strUrl = "https://goo.gl/forms/DH7ISfSdaU1JGpQi1";
                    break;
                case "Instrument flying requirements":
                    strUrl = "https://goo.gl/forms/DaDZMTTgs9VFd29n1";
                    break;
                case "Night flying requirements":
                    strUrl = "https://goo.gl/forms/5ZQYl1FJQJ3ALDqB2";
                    break;

                default:
                    break;
            }
            Response.Write("<script>window.open('" + strUrl + "' ,'_blank')</script>");
        }

        public JsonResult AirlineNameAvailable(string name)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);

            var nameUsed = dbContext.AirlineDbModels.Any(a => a.Name.ToUpper() == name.Trim().ToUpper() && a.UserId != user.Id);

            if (!nameUsed)
                return Json(true, JsonRequestBehavior.AllowGet);

            string suggestedUID = String.Format(CultureInfo.InvariantCulture,
                "The name '{0}' is already used.", name);

            return Json(suggestedUID, JsonRequestBehavior.AllowGet);            
        }

        [HttpPost]
        public ActionResult Add(AirlineViewModel model)
        {
            var dbContext = new ApplicationDbContext();
            // Check GUEST
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                TempData["GuestMessage"] = AccountController.GuestMessage;
                return RedirectToAction("Register", "Account");
            }
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);

            if (statistics != null && statistics.BankBalance >= airlinePrice)
            {
                var dbModel = new AirlineDbModel()
                {
                    Name = model.Name,
                    Description = model.Description,
                    Country = model.Country,
                    Salary = 20,
                    Score = model.Score,
                    UserId = user.Id,
                    DebtMaturityDate = DateTime.Now
                };

                if (model.FilesInput != null && model.FilesInput.Any())
                {
                    var file = model.FilesInput.FirstOrDefault();
                    string filePath = @"/Content/img/logo/LogoDefault.png";//Upload(file);
                    dbModel.Logo = filePath;
                }

                dbContext.AirlineDbModels.Add(dbModel);

                statistics.BankBalance = statistics.BankBalance - airlinePrice;
                statistics.Airline = dbModel;

                if (model.RequireCertificates)
                {
                    foreach (var cert in dbContext.CertificateDbModels)
                    {
                        var airlineCertificates = new AirlineCertificatesDbModel()
                        {
                            Certificate = cert,
                            Airline = dbModel
                        };
                        dbContext.AirlineCertificatesDbModels.Add(airlineCertificates);
                    }
                }

                dbContext.SaveChanges();

                TempData["Message"] = "Congratulation you created a new airline. Now you can invite pilots to work with you.";
                Session["HeaderStatistics"] = null;
            }
            else
            {
                TempData["Message"] = "You don't have enough bank balance to buy new airline.";
            }
            return RedirectToAction("Index");
        }

        public string Upload(HttpPostedFileBase file)
        {
            //if (file != null && file.ContentLength > 0)
            //{
            //    var dbContext = new ApplicationDbContext();
            //    var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            //    var fileName = Path.GetFileName(user.Id + Path.GetExtension(file.FileName));

            //    path = Path.Combine(path, fileName);
            //    file.SaveAs(Server.MapPath("~" + path));
            //}
            //else
            //{
            //    path = path + "LogoDefault.png";
            //}

            //return path;
            return path + "LogoDefault.png"; ;
        }

        public ActionResult AddView()
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            
            if (statistics != null && statistics.BankBalance >= airlinePrice)
            {

                var airlineModel = new AirlineViewModel();
                return PartialView("Add", airlineModel);
            }
            else
            {
                TempData["Message"] = "You don't have enough bank balance to buy new airline.";
                return null;
            }
        }

        public ActionResult EditView(int id)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == id && a.UserId == user.Id);

            if (airline != null)
            {
                var anyCertificates = dbContext.AirlineCertificatesDbModels.Any(c => c.Airline.Id == airline.Id);
                var view = new AirlineViewModel()
                {
                    Id = airline.Id,
                    Name = airline.Name,
                    Description = airline.Description,
                    Country = airline.Country,
                    Score = airline.Score,
                    LogoPath = airline.Logo,
                    RequireCertificates = anyCertificates
                };
                return PartialView("Edit", view);
            }
            else
            {
                TempData["Message"] = "You must be the owner of the airline to edit.";
                return null;
            }
        }

        [HttpPost]
        public ActionResult Update(AirlineViewModel model)
        {
            var dbContext = new ApplicationDbContext();
            // Check GUEST
            var user = dbContext.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
            if (user != null && user.Email == AccountController.GuestEmail)
            {
                TempData["GuestMessage"] = AccountController.GuestMessage;
                return RedirectToAction("Register", "Account");
            }
            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == model.Id && a.UserId == user.Id);

            if (airline != null)
            {
                var certsAirline = dbContext.AirlineCertificatesDbModels.Include("Certificate").Where(c => c.Airline.Id == airline.Id).ToList();
                if (!model.RequireCertificates)
                {
                    dbContext.AirlineCertificatesDbModels.RemoveRange(certsAirline);
                }
                else
                {
                    foreach (var cert in dbContext.CertificateDbModels)
                    {
                        if (!certsAirline.Any(x => x.Certificate.Id == cert.Id))
                        {
                            var airlineCertificates = new AirlineCertificatesDbModel()
                            {
                                Certificate = cert,
                                Airline = airline
                            };
                            dbContext.AirlineCertificatesDbModels.Add(airlineCertificates);
                        }
                    }
                }

                airline.Name = model.Name;
                airline.Description = model.Description;
                airline.Country = model.Country;
                airline.Score = model.Score;

                if (model.FilesInput != null && model.FilesInput.Any())
                {
                    var file = model.FilesInput.FirstOrDefault();
                    if (file != null)
                    {
                        var filePath = Upload(file);
                        airline.Logo = filePath;
                    }
                }


                dbContext.SaveChanges();

                TempData["Message"] = "You update the airline. Now you can invite pilots to work with you.";
                Session["HeaderStatistics"] = null;
            }
            else
            {
                TempData["Message"] = "You must be the owner of the airline to edit.";
            }
            return RedirectToAction("Index");
        }
    }
}