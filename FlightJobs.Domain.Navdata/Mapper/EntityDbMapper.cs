using FlightJobs.Domain.Navdata.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace FlightJobs.Domain.Navdata.Mapper
{
    public class EntityDbMapper
    {
        internal static T CreateItemFromRow<T>(DataRow row) where T : new()
        {
            T item = new T();
            SetItemFromRow(item, row);
            return item;
        }

        internal static IList<T> CreateItemsFromRows<T>(DataRowCollection rows) where T : new()
        {
            IList<T> results = new List<T>();

            foreach (DataRow dr in rows)
            {
                T item = new T();
                SetItemFromRow(item, dr);
                results.Add(item);
            }
            return results;
        }

        private static void SetItemFromRow<T>(T item, DataRow row) where T : new()
        {
            foreach (DataColumn c in row.Table.Columns)
            {
                PropertyInfo p = item.GetType().GetProperty(c.ColumnName.Replace("_",""), BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

                if (p != null && row[c] != DBNull.Value)
                {
                    p.SetValue(item, row[c], null);
                }
            }
        }
    }
}
