using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;
using FlightJobs.Models;
using System.Text;
using Microsoft.AspNet.Identity;
using System.Net;
using System.IO;
using System.Configuration;

namespace FlightJobs.Schedule
{
    public class BackpupJob : IJob
    {
        public async Task Execute(IJobExecutionContext context)
        {
            bool backupDbFtpFileEnable = bool.Parse(ConfigurationManager.AppSettings.Get("BackupDbFtpFileEnable"));
            if (backupDbFtpFileEnable)
            {
                string sourceFtpUri = ConfigurationManager.AppSettings.Get("FtpSourceDbPath");
                string sourceUsername = ConfigurationManager.AppSettings.Get("FtpSourceUsername");
                string sourcePassword = ConfigurationManager.AppSettings.Get("FtpSourcePassword");
                string destFtpUri = ConfigurationManager.AppSettings.Get("FtpDestDbPath");
                string destUsername = ConfigurationManager.AppSettings.Get("FtpDestUsername");
                string destPassword = ConfigurationManager.AppSettings.Get("FtpDestPassword");
                await CopyFtpFileToAnotherFtp(sourceFtpUri, sourceUsername, sourcePassword,
                                              destFtpUri, destUsername, destPassword);
            }
        }

        public async Task CopyFtpFileToAnotherFtp(
            string sourceFtpUri, string sourceUsername, string sourcePassword,
            string destFtpUri, string destUsername, string destPassword)
        {
            try
            {
                // 1. Download from Source FTP
                FtpWebRequest sourceRequest = (FtpWebRequest)WebRequest.Create(sourceFtpUri);
                sourceRequest.Method = WebRequestMethods.Ftp.DownloadFile;
                sourceRequest.Credentials = new NetworkCredential(sourceUsername, sourcePassword);

                using (FtpWebResponse sourceResponse = (FtpWebResponse)await sourceRequest.GetResponseAsync())
                using (Stream responseStream = sourceResponse.GetResponseStream())
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    responseStream.CopyTo(memoryStream); // Copy downloaded content to memory
                    memoryStream.Position = 0; // Reset stream position for reading

                    // 2. Upload to Destination FTP
                    FtpWebRequest destRequest = (FtpWebRequest)WebRequest.Create(destFtpUri);
                    destRequest.Method = WebRequestMethods.Ftp.UploadFile;
                    destRequest.Credentials = new NetworkCredential(destUsername, destPassword);

                    using (Stream requestStream = destRequest.GetRequestStream())
                    {
                        memoryStream.CopyTo(requestStream); // Write content from memory to destination FTP
                    }

                    using (FtpWebResponse destResponse = (FtpWebResponse)await destRequest.GetResponseAsync())
                    {
                        Console.WriteLine($"File copied successfully. Destination status: {destResponse.StatusDescription}");
                    }
                }
            }
            catch (Exception e)
            {
                throw new Exception($"Error when backpup: {e.ToString()}", e);
            }
        }
    }
}