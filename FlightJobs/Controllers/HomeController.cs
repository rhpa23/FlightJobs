using FlightJobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PagedList;
using System.Data.SqlClient;
using System.Data;

namespace FlightJobs.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(int? pageNumber)
        {
            var homeModel = new HomeViewModel();
            var dbContext = new ApplicationDbContext();
            var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user != null)
            {
                var statistics = dbContext.StatisticsDbModels.FirstOrDefault(s => s.User.Id == user.Id);
                if (statistics != null)
                {
                    homeModel.Statistics = statistics;
                }
            }
            var jobList = dbContext.JobDbModels.Where(j => !j.IsDone && j.User.Id == user.Id).OrderBy(j => j.Id).ToPagedList(pageNumber ?? 1, 7);
            homeModel.Jobs = jobList;
            return View(homeModel);
        }


        public ActionResult ActivateJob(int? jobId)
        {
            var dbContext = new ApplicationDbContext();
            var jobs = dbContext.JobDbModels.ToList();
            foreach (var job in jobs)
            {
                job.IsActivated = (job.Id == jobId);
                dbContext.SaveChanges();
            }

            return RedirectToAction("Index");
        }

        public ActionResult DeleteJob(int id)
        {
            var dbContext = new ApplicationDbContext();
            JobDbModel job = new JobDbModel() { Id = id };
            dbContext.JobDbModels.Attach(job);
            dbContext.JobDbModels.Remove(job);
            dbContext.SaveChanges();

            return RedirectToAction("Index");
        }

        public ActionResult About()
        {
            ViewBag.Message = "Version beta. This site is under construction.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "rhpa23@gmail.com.";

            return View();
        }


        public ActionResult Backup()
        {
            string connectionString = @"Data Source=(LocalDb)\MSSQLLocalDB;AttachDbFilename=|DataDirectory|\aspnet-FlightJobs-20171009084556.mdf;Initial Catalog=aspnet-FlightJobs-20171009084556;Integrated Security=True";

            var dbContext = new ApplicationDbContext();
            //var user = dbContext.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            var jobDbRemote =  dbContext.JobDbModels.FirstOrDefault();


            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                //INSERT INTO "flightjobsdb"."dbo"."JobDbModels" ("DepartureICAO", "ArrivalICAO", "Dist", "Pax", "Cargo", "Pay", "FirstClass", "User_Id", "ModelName", "ModelDescription", "StartFuelWeight", "FinishFuelWeight") VALUES (N'EDDS', N'EHAM', '55', '55', '55', '55', '1', N'55', N'A320', N'A555', '55', '55');
                string sql = "INSERT INTO JobDbModels (DepartureICAO, ArrivalICAO, Dist, Pax, Cargo, Pay, FirstClass, User_Id, ModelName, ModelDescription, StartFuelWeight, FinishFuelWeight, StartTime, EndTime, IsDone, IsActivated, InProgress) " +
                    "VALUES (@param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10, @param11, @param12, @param13, @param14, @param15, @param16, @param17);";
                SqlCommand cmd = new SqlCommand(sql, connection);
                cmd.Parameters.AddWithValue("@param1", jobDbRemote.DepartureICAO);
                cmd.Parameters.AddWithValue("@param2", jobDbRemote.ArrivalICAO);
                cmd.Parameters.AddWithValue("@param3", jobDbRemote.Dist);
                cmd.Parameters.AddWithValue("@param4", jobDbRemote.Pax);
                cmd.Parameters.AddWithValue("@param5", jobDbRemote.Cargo);
                cmd.Parameters.AddWithValue("@param6", jobDbRemote.Pay);
                cmd.Parameters.AddWithValue("@param7", jobDbRemote.FirstClass);
                cmd.Parameters.AddWithValue("@param8", jobDbRemote.User.Id);
                cmd.Parameters.AddWithValue("@param9", jobDbRemote.ModelName);
                cmd.Parameters.AddWithValue("@param10", jobDbRemote.ModelDescription);
                cmd.Parameters.AddWithValue("@param11", jobDbRemote.StartFuelWeight);
                cmd.Parameters.AddWithValue("@param12", jobDbRemote.FinishFuelWeight);
                cmd.Parameters.AddWithValue("@param13", jobDbRemote.StartTime);
                cmd.Parameters.AddWithValue("@param14", jobDbRemote.EndTime);
                cmd.Parameters.AddWithValue("@param15", jobDbRemote.IsDone);
                cmd.Parameters.AddWithValue("@param16", jobDbRemote.IsActivated);
                cmd.Parameters.AddWithValue("@param17", jobDbRemote.InProgress);

                cmd.CommandType = CommandType.Text;
                cmd.ExecuteNonQuery();
            }

            return RedirectToAction("Index");
        }

    }
}