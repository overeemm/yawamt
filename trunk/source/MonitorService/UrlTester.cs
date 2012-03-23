using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Net;
using System.Timers;
using Microsoft.Win32;

namespace YAWAMT.Service
{
    public class UrlTester
    {
        public const int DEFAULT_REQUEST_TIMEOUT = 30000; // 1000 * 30 (30 sec)
        private static int m_request_timeout = -1;
        private static DateTime m_request_timeout_lastread = DateTime.Now;
        public int RequestTimeout
        {
            get
            {
                if (m_request_timeout == -1 || ((TimeSpan)(DateTime.Now - m_request_timeout_lastread)).Minutes >= 5)
                {
                    m_request_timeout = DEFAULT_REQUEST_TIMEOUT;

                    RegistryKey key = Registry.LocalMachine.OpenSubKey("Software\\yawamt");
                    if (key != null)
                    {
                        object timeoutvalue = key.GetValue("requesttimeout");
                        if (timeoutvalue != null)
                        {
                            int value;
                            if (int.TryParse(timeoutvalue.ToString(), out value))
                                m_request_timeout = value;
                        }
                    }

                    m_request_timeout_lastread = DateTime.Now;
                }

                return m_request_timeout;
            }
        }

        private static object webrequestlock = new object();

        private int m_urlid;
        private int m_retries;
        private Config m_config;

        public UrlTester(Url url, Config config)
        {
            m_urlid = url.ID;
            m_retries = -1;
            m_config = config;
        }

        public bool IsInRetryMode { get; set; }

        public void Test(object sender, System.Timers.ElapsedEventArgs e)
        {
            bool result = false;
            DataClassesDataContext context = null;
            try
            {
                Url url = GetUrlFromDatabase(out context);

                if (url != null)
                {
                    lock (webrequestlock)
                    {
                        result = TestUrl(url, RequestTimeout);

                        if (result)
                            OnSucces(url, context);
                        else
                            OnFailure(url, context, sender);

                        using (DataClassesDataContext context2 = new Config().GetNewContext())
                        {
                            int aantal = context.ServiceStatus.Count();
                            if (aantal != 0)
                            {
                                context2.ServiceStatus.First().VolgendePulse = DateTime.Now.AddMilliseconds(((Timer)sender).Interval);
                                context2.SubmitChanges();
                            }
                        }

                        url.LaatstePulse = DateTime.Now;
                        context.SubmitChanges();
                    }
                }
            }
            catch (Exception exc)
            {
                Dictionary<string, object> props = new Dictionary<string, object>();
                props.Add("exception", exc);
                props.Add("url", this);
                props.Add("result", result);

                Service1.LogCriticalError("Fout tijdens verwerken van het test resulaat"
                                , "Verwerken testresultaat ging fout"
                                , props);
            }
            finally
            {
                if (context != null)
                    context.Dispose();
            }
        }

        private void OnFailure(Url url, DataClassesDataContext context, object sender)
        {
            // alleen retries doen als dat aanstaat (geconfigureerd)
            // en als er niet al een open downtime is (van type Hard
            int countopendowntime = (from d in url.Downtimes where d.Eindtijd == null && d.Hard select d).Count();
            if (url.Setting.Retries != null && countopendowntime == 0)
            {
                if (m_retries == -1)
                {
                    if (url != null) // kan null zijn
                    {
                        url.Downtimes.Add(new Downtime { Begintijd = DateTime.Now, Hard = false });
                        context.SubmitChanges();
                    }
                }

                m_retries++;

                // als we het aanal retries bereikt hebben gaan we weer gewoon testen
                if (m_retries >= url.Setting.Retries)
                {
                    // nadat het aantal retries zijn geweest, gaan we weer om de zoveeltijd kijken.
                    ChangeTime((Timer)sender, url, context, url.Setting.Periode);
                    IsInRetryMode = false;

                    // zet de downtime op hard:
                    if (url != null)
                    {
                        foreach (Downtime d in url.Downtimes)
                        {
                            if (d.Eindtijd == null && !d.Hard)
                                d.Hard = true;
                        }
                        context.SubmitChanges();
                    }
                }
                // hier moeten we vervolgens zorgen dat de timer aangepast wordt en iets sneller gaat checken.
                else
                {
                    ChangeTime((Timer)sender, url, context, url.Setting.RetriesPeriode.Value);
                    IsInRetryMode = true;
                }
            }
        }

        private Url GetUrlFromDatabase(out DataClassesDataContext context)
        {
            context = m_config.GetNewContext();
            var url = (from u in context.Urls where u.ID == m_urlid select u).FirstOrDefault();
            return url;
        }

        private void OnSucces(Url url, DataClassesDataContext context)
        {
            m_retries = -1;
            if (url != null)
            {
                foreach (Downtime d in url.Downtimes)
                {
                    if (d.Eindtijd == null)
                        d.Eindtijd = DateTime.Now;
                }
                context.SubmitChanges();
            }
        }

        private void ChangeTime(Timer timer, Url url, DataClassesDataContext context, int interval)
        {
            Debug.WriteLine(string.Format("{0} veranderd naar {1}", this, interval));
            timer.SetIntervalInSeconds(interval);

            url.CurrentPeriode = interval;
            context.SubmitChanges();
        }

        private bool TestUrl(Url url, int milliseconds)
        {
            try
            {

                using (DataClassesDataContext context = new Config().GetNewContext())
                {
                    int aantal = context.ServiceStatus.Count();
                    if (aantal == 0)
                    {
                        context.ServiceStatus.InsertOnSubmit(new ServiceStatus() { LaatstePulse = DateTime.Now });
                        context.SubmitChanges();
                    }
                    else
                    {
                        context.ServiceStatus.First().LaatstePulse = DateTime.Now;
                        context.SubmitChanges();
                    }

                }

                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url.UrlAsUri);
                request.Timeout = milliseconds;
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    if (response == null || response.StatusCode != HttpStatusCode.OK)
                        return false;
                    else
                        return true;
                }

            }
            catch
            {
                return false;
            }
        }

        public override string ToString()
        {
            return string.Format("[Url {0}, {1} retries]", this.m_urlid, this.m_retries);
        }
    }
}
