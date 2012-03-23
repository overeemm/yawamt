using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;

using YAWAMT;

namespace YAWAMT.Web.Controllers
{
    [HandleError]
    public class UrlController : Controller
    {
        public JsonResult Get()
        {
            DataClassesDataContext context = new Config().GetNewContext();
            var urls = from u in context.Urls orderby u.Naam select new { ID = u.ID, Naam = u.Naam, Url = u.Url1, SettingID = u.Setting.ID };

            return Json(urls, JsonRequestBehavior.AllowGet);
        }

        public JsonResult ServiceStatus()
        {
            DataClassesDataContext context = new Config().GetNewContext();
            var up = from su in context.ServiceUptimes where su.ShutdownTime == null select su;

            foreach (ServiceUptime time in up)
                return Json("up", JsonRequestBehavior.AllowGet);

            return Json("down", JsonRequestBehavior.AllowGet);
        }

        public JsonResult CombinedStatus()
        {
            List<UrlStatusTemp> status = new List<UrlStatusTemp>();

            DataClassesDataContext context = new Config().GetNewContext();

            var downtime = (from u in context.Urls select u);
            foreach (var d in downtime)
                status.Add(new UrlStatusTemp()
                {
                    ID = d.ID.ToString()
                ,   Status = d.HasDownTime() == null ? "none" :
                             d.HasDownTime().Value ?   "hard" :
                                                       "soft"
                ,
                    LaatstePulse = d.LaatstePulse == null ? "" : d.LaatstePulse.Value.ToString("MMM dd yyyy HH:mm:ss", new System.Globalization.CultureInfo("en-US", false))
                ,   Periode = d.CurrentPeriode.ToString()
                });

            return Json(status, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Status(string id)
        {
            int idInt;
            if (int.TryParse(id, out idInt))
            {
                DataClassesDataContext context = new Config().GetNewContext();

                var downtime = (from u in context.Urls where u.ID == idInt select u.HasDownTime()).First();
                return Json(downtime == null ? "none" :
                              downtime.Value ? "hard" :
                                               "soft", JsonRequestBehavior.AllowGet);
            }
            else
                return Json(string.Empty, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Settings()
        {
            DataClassesDataContext context = new Config().GetNewContext();
            var settings = from s in context.Settings orderby s.Naam select new { ID = s.ID, Naam = s.Naam };

            return Json(settings, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs("POST")]
        public JsonResult Delete(int id)
        {
            try
            {
                DataClassesDataContext context = new Config().GetNewContext();
                var urlObj = (from u in context.Urls where u.ID == id select u).First();
                context.Urls.DeleteOnSubmit(urlObj);
                context.SubmitChanges();

                return Json(true);
            }
            catch (Exception exc)
            {
                return Json(false);
            }
        }

        [AcceptVerbs("POST")]
        public JsonResult Insert(FormCollection form)
        {
            try
            {
                string naam = form["naam"];
                string url = form["url"];

                int setting;
                if (!int.TryParse(form["setting"], out setting))
                    throw new ArgumentException();

                try
                {
                    if (!url.StartsWith("http://"))
                        url = "http://" + url;

                    Uri u = new Uri(url);
                    url = u.ToString();
                }
                catch 
                {
                    url = "[FOUT] " + url;
                }

                DataClassesDataContext context = new Config().GetNewContext();
                Url urlObj = new Url();
                urlObj.Naam = naam;
                urlObj.Url1 = url;
                urlObj.Settings = setting;
                context.Urls.InsertOnSubmit(urlObj);
                context.SubmitChanges();

                return Json(urlObj.ID);
            }
            catch (Exception exc)
            {
                return Json(-1);
            }
        }

        [AcceptVerbs("POST")]
        public JsonResult Update(FormCollection form)
        {
            try
            {
                int id;
                if(!int.TryParse(form["id"], out id))
                    throw new ArgumentException();
                
                string naam = form["naam"]; 
                
                string url = form["url"];
                
                int setting;
                if(!int.TryParse(form["setting"], out setting))
                    throw new ArgumentException();

                DataClassesDataContext context = new Config().GetNewContext();
                var urlObj = (from u in context.Urls where u.ID == id select u).First();
                urlObj.Naam = naam;
                urlObj.Url1 = url;
                urlObj.Settings = setting;
                context.SubmitChanges();

                return Json(true);
            }
            catch (Exception exc)
            {
                return Json(false);
            }
        }

        public ActionResult Timeline(int? id)
        {
            List<TimelineEvent> events = new List<TimelineEvent>();

            DataClassesDataContext context = new Config().GetNewContext();
            
            if(id == null) 
            {
                foreach (Downtime d in context.Downtimes)
                    events.Add(TimelineEvent.Create(d.Url1, d));
            } 
            else 
            {
                var url = (from u in context.Urls where u.ID == id.Value select u).First();
                foreach (Downtime d in url.Downtimes)
                    events.Add(TimelineEvent.Create(d));
            }
            
            var uptimes = from s in context.ServiceUptimes orderby s.StartTime select s;
            ServiceUptime prev = null;
            foreach (ServiceUptime s in uptimes)
            {
                if (prev == null)
                    events.Add(TimelineEvent.Create(s.StartTime, "service-start", "Service gestart", "De service voor het eerst gestart", null));
                else
                    events.Add(TimelineEvent.Create(s.StartTime, "service-downtime", "Service down", "De service stond uit", prev.ShutdownTime));
            }
            
            ViewData["events"] = events;
            
            return View();
        }
    }

    class UrlStatusTemp
    {
        public string ID { get; set; }
        public string Status { get; set; }
        public string LaatstePulse { get; set; }
        public string Periode { get; set; }
    }
}
