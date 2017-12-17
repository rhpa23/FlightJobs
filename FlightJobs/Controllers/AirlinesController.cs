using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;

namespace FlightJobs.Controllers
{
    public class AirlinesController : Controller
    {
        // GET: Airlines
        public ActionResult Index()
        {
            ViewBag.Message = TempData["Message"];
            var dbContext = new ApplicationDbContext();
            return View(dbContext.AirlineDbModels.ToList());
        }

        public ActionResult Sign(int id)
        {
            var certificateView = new CertificateViewModel();
            certificateView.Certificates = new List<CertificateDbModel>();

            var dbContext = new ApplicationDbContext();
            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == id);
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
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
                TempData["Message"] = "You don't have enough scores to sign contract with this airline.";
                return RedirectToAction("Index");
            }
        }

        public ActionResult Buy(int id, int airlineId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
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
            }
            else
            {
                ViewBag.Message = "You don't have enough bank balance to buy this certificate.";
            }

            return Sign(airlineId);
        }

        public ActionResult Confirm(int id)
        {
            var certificateView = new CertificateViewModel();
            certificateView.Certificates = new List<CertificateDbModel>();

            var dbContext = new ApplicationDbContext();
            var airline = dbContext.AirlineDbModels.FirstOrDefault(a => a.Id == id);
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);

            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            certificateView.Airline = airline;
            certificateView.Statistic = statistics;

            var certsAirline = dbContext.AirlineCertificatesDbModels.Include("Certificate").Where(c => c.Airline.Id == id).ToList();
            var certsUser = dbContext.StatisticCertificatesDbModels.Where(u => u.Statistic.Id == statistics.Id).ToList();
            foreach (var airCert in certsAirline)
            {
                airCert.Certificate.Selected = certsUser.Any(u => u.Certificate.Id == airCert.Certificate.Id);
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
                ViewBag.Message = "Congratulations, you signed contract with " + airline.Name +  " airline in " + airline.Country + ".";
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
    }
}