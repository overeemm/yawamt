using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Net;
using System.Timers;

namespace YAWAMT.Service
{
    public partial class Service1 : ServiceBase
    {
        Dictionary<int, UrlTimer> m_urlTimers;
        Timer m_settingsTimer;
        Config m_config;

        public Service1()
        {
            InitializeComponent();
            m_urlTimers = new Dictionary<int, UrlTimer>();
            m_config = new Config();
        }

        protected override void OnStart(string[] args)
        {
            try
            {
                using (DataClassesDataContext context = m_config.GetNewContext())
                {
                    //sluit alle openstaande serviceuptimes
                    foreach (var uptime in context.ServiceUptimes)
                    {
                        if (uptime.ShutdownTime == null)
                            uptime.ShutdownTime = DateTime.Now;
                    }

                    ServiceUptime newUptime = new ServiceUptime();
                    newUptime.StartTime = DateTime.Now;
                    context.ServiceUptimes.InsertOnSubmit(newUptime);
                    context.SubmitChanges();
                }
                // wat nu, kijken hoeveel urls er zijn en per url een timer aanmaken.
                // en dan nog een timer voor de settings? maar dan moet je de overige timers locken natuurlijk.
                StartTimers();
            }
            catch (Exception exc)
            {
                LogCriticalError("De service kon niet gestart worden", "Error in OnStart"
                                , new Dictionary<string, object>().Create("exception", exc));
                throw;
            }
        }

        public void StartTimers()
        {
            using (DataClassesDataContext context = m_config.GetNewContext())
            {
                foreach (var u in (context.Urls.Select(x => x)))
                {
                    UrlTester tester = new UrlTester(u, m_config);
                    Timer t = new Timer();
                    t.SetIntervalInSeconds(u.Setting.Periode);
                    t.Elapsed += new ElapsedEventHandler(tester.Test);
                    t.Start();

                    m_urlTimers.Add(u.ID, new UrlTimer { Timer = t, Tester = tester });

                    LogDebug(string.Format("Timer aangemaakt voor {0}", u));
                }
            }
            // extra timer om de instellingen bij te werken.
            m_settingsTimer = new Timer();
            m_settingsTimer.SetIntervalInSeconds(10);
            m_settingsTimer.Elapsed += new ElapsedEventHandler(RefreshUrlCollection);
            m_settingsTimer.Start();
        }

        void RefreshUrlCollection(object sender, ElapsedEventArgs e)
        {
            try
            {
                // lock de hele collectie en haal alles op?
                using (DataClassesDataContext context = m_config.GetNewContext())
                {
                    Dictionary<int, UrlTimer> touchedTimers = new Dictionary<int, UrlTimer>();
                    foreach (var u in (context.Urls.Select(x => x)))
                    {
                        if (!m_urlTimers.ContainsKey(u.ID))
                        {
                            AddNewUrlTester(touchedTimers, u);
                        }
                        else
                        {
                            ChangeUrlTester(touchedTimers, u);
                        }
                    }

                    foreach (KeyValuePair<int, UrlTimer> t in touchedTimers)
                    {
                        if (t.Value != null)
                            m_urlTimers.Add(t.Key, t.Value);
                    }

                    // opruimen van de verwijderde urls
                    List<int> timerstodelete = new List<int>();
                    foreach (KeyValuePair<int, UrlTimer> timer in m_urlTimers)
                    {
                        if (!touchedTimers.ContainsKey(timer.Key))
                            timerstodelete.Add(timer.Key);
                    }

                    foreach (int urlid in timerstodelete)
                    {
                        m_urlTimers.Remove(urlid);
                        LogDebug(string.Format("Timer verwijderd voor {0}", urlid));
                    }
                }
            }
            catch (Exception exc)
            {
                LogCriticalError("De timers konden niet bijgewerkt worden.", "Error in refresh"
                                , new Dictionary<string, object>().Create("exception", exc));
            }
        }

        private void ChangeUrlTester(Dictionary<int, UrlTimer> touchedTimers, Url u)
        {
            if (m_urlTimers[u.ID].Tester.IsInRetryMode)
            {
                if (u.Setting.RetriesPeriode != null)
                {
                    if (m_urlTimers[u.ID].Timer.HasDifferentIntervalInSeconds(u.Setting.RetriesPeriode.Value))
                    {
                        m_urlTimers[u.ID].Timer.Stop(); // even pause zetten

                        m_urlTimers[u.ID].Timer.SetIntervalInSeconds(u.Setting.RetriesPeriode.Value);
                        m_urlTimers[u.ID].Timer.Start();

                        LogDebug(string.Format("Timer veranderd voor {0}", u));
                    }
                }
            }
            else
            {
                if (m_urlTimers[u.ID].Timer.HasDifferentIntervalInSeconds(u.Setting.Periode))
                {
                    m_urlTimers[u.ID].Timer.Stop(); // even pause zetten
                    m_urlTimers[u.ID].Timer.SetIntervalInSeconds(u.Setting.Periode);
                    m_urlTimers[u.ID].Timer.Start();

                    LogDebug(string.Format("Timer veranderd voor {0}", u));
                }
            }

            touchedTimers.Add(u.ID, null);
        }

        private void AddNewUrlTester(Dictionary<int, UrlTimer> touchedTimers, Url u)
        {
            UrlTester tester = new UrlTester(u, m_config);
            Timer t = new Timer();
            t.SetIntervalInSeconds(u.Setting.Periode);
            t.Elapsed += new ElapsedEventHandler(tester.Test);
            t.Start();

            touchedTimers.Add(u.ID, new UrlTimer { Timer = t, Tester = tester });

            LogDebug(string.Format("Timer aangemaakt voor {0}", u));
        }

        protected override void OnStop()
        {
            try
            {
                using (DataClassesDataContext context = m_config.GetNewContext())
                {
                    //sluit alle openstaande serviceuptimes
                    foreach (var uptime in context.ServiceUptimes)
                    {
                        if (uptime.ShutdownTime == null)
                            uptime.ShutdownTime = DateTime.Now;
                    }

                    context.SubmitChanges();
                }
            }
            catch (Exception exc)
            {
                LogCriticalError("Service kon niet succesvol gestopt worden", "Error in OnStop"
                                , new Dictionary<string, object>().Create("exception", exc));
            }
        }

        protected override void OnShutdown()
        {
            this.OnStop();
        }

        protected override void OnPause()
        {
            foreach (UrlTimer timer in m_urlTimers.Values)
                timer.Timer.Stop();
            m_settingsTimer.Stop();
        }

        protected override void OnContinue()
        {
            foreach (UrlTimer timer in m_urlTimers.Values)
                timer.Timer.Start();
            m_settingsTimer.Start();
        }

        public static void LogDebug(string msg)
        {
            //Logger.Write(msg
            //            , new string[] { "Service", "Debug" }, 0, -1
            //            , TraceEventType.Information, "Debug");

            Debug.WriteLine(msg);
        }

        public static void LogDebug(string msg, Dictionary<string, object> props)
        {
            //Logger.Write(msg
            //            , new string[] { "Service", "Debug" }, 0, -1
            //            , TraceEventType.Information, "Debug", props);
            
            Debug.WriteLine(msg);
        }

        public static void LogCriticalError(string msg, string title, Dictionary<string, object> props)
        {
            //Logger.Write(msg
            //            , new string[] { "Service" }, 3, -1
            //            , TraceEventType.Critical, title, props);


           // System.IO.File.WriteAllText(System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, DateTime.Now.Ticks.ToString()+".txt"), msg);

            Debug.WriteLine(msg);
        }
    }

    internal class UrlTimer
    {
        public Timer Timer { get; set; }
        public UrlTester Tester { get; set; }
    }
}
