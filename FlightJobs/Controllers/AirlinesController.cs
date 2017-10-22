using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FlightJobs.Controllers
{
    public class AirlinesController : Controller
    {
        // GET: Airlines
        public ActionResult Index()
        {
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
            if (statistics.PilotScore >= airline.Score)
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
                ViewBag.Message = string.Format("You don't have enough scores to sign contract with this airline.");
                return View("Index");
            }
        }

        public ActionResult Buy(int id, int airlineId)
        {
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
            var certificate = dbContext.CertificateDbModels.FirstOrDefault(c => c.Id == id);

            if (statistics.BankBalance >= certificate.Price)
            {
                var statisticCertificate = new StatisticCertificatesDbModel();
                statisticCertificate.Certificate = certificate;
                statisticCertificate.Statistic = statistics;
                dbContext.StatisticCertificatesDbModels.Add(statisticCertificate);

                statistics.BankBalance = statistics.BankBalance - certificate.Price;

                dbContext.SaveChanges();
            }
            else
            {
                // TODO: 
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
                statistics.Airline = airline;
                dbContext.SaveChanges();
                ViewBag.Message = "Congratulations, you signed contract with " + airline.Name +  " airline in " + airline.Country + ".";
            }

            return View("Contract", certificateView);
 
        }
    }
}