using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace FlightJobs.Models
{
    public class JobAirlineDbModel
    {
        [Key]
        public long Id { get; set; }

        public virtual AirlineDbModel Airline { get; set; }
        public virtual JobDbModel Job { get; set; }

        [DisplayName("Job debt")]
        public long JobDebtValue { get; set; }

        [NotMapped]
        public double FuelPrice { get; set; }

        [NotMapped]
        public double FuelCost { get; set; }

        [NotMapped]
        public double FuelCostPerNM { get; set; }

        [NotMapped]
        public double GroundCrewCost { get; set; }

        [NotMapped]
        public double FlightCrewCost { get; set; }

        [NotMapped]
        public double FlightAttendantCost { get; set; }

        [NotMapped]
        public double TotalCrewCostLabor { get; set; }

        [NotMapped]
        public double TotalFlightCost { get; set; }

        [NotMapped]
        public double RevenueEarned { get; set; }

        [NotMapped]
        public double FlightIncome { get; set; }

        public void CalcAirlineJob(AirlineFboDbModel departureFbo)
        {
            this.FuelPrice = this.Job.AviationType > 1 ? 5.20 : 5.70;

            // FlightCrewCost = JobPay + (JobPay * 0.8)
            this.FlightCrewCost = this.Job.Pay + (this.Job.Pay * 0.8);

            // GroundCrewCost = FlightCrewCost * 0.3;
            this.GroundCrewCost = this.FlightCrewCost * 0.3;

            if (departureFbo != null)
            {
                double fuelDiscount = this.FuelPrice * departureFbo.FuelPriceDiscount;
                this.FuelPrice -= fuelDiscount;

                double grCrewDiscount = this.GroundCrewCost * departureFbo.GroundCrewDiscount;
                this.GroundCrewCost -= grCrewDiscount;
            }

            this.FuelCost = (this.Job.StartFuelWeight - this.Job.FinishFuelWeight) * this.FuelPrice;

            // FuelCostPerNM = FuelCost / Dist
            this.FuelCostPerNM = this.FuelCost / this.Job.Dist;

            // FlightAttendantCost = (JobPax / 60) * (21 * JobFlightTimeHours)
            this.FlightAttendantCost = (this.Job.Pax / 60) * (21 * this.Job.FlightTimeHours);

            // TotalCrewCostLabor = FlightCrewCost + FlightAttendantCost;
            this.TotalCrewCostLabor = this.FlightCrewCost + this.FlightAttendantCost;

            // TotalFlightCost = TotalCrewCostLabor + FuelCost + GroundCrewCost;
            this.TotalFlightCost = this.TotalCrewCostLabor + this.FuelCost + this.GroundCrewCost;

            // RevenueEarned = TotalFlightCost * 1.35;
            this.RevenueEarned = this.TotalFlightCost * 1.35;

            // FlightIncome = RevenueEarned - TotalFlightCost;
            this.FlightIncome = this.RevenueEarned - this.TotalFlightCost;
        }
    }
}