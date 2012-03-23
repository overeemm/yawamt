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
    public class ServiceController : Controller
    {
       
        public JsonResult GetCombinedServiceStatus()
        {
            DataClassesDataContext context = new Config().GetNewContext();
            var statussen = from status in context.ServiceStatus select status;
            var up = from su in context.ServiceUptimes where su.ShutdownTime == null select su;

            CombinedServiceStatus st = new CombinedServiceStatus();
            st.Status = "down";
            st.LaatstePulse = "";
            st.VolgendePulse = "";

            foreach (ServiceUptime time in up)
                st.Status = "up";

            foreach (ServiceStatus status in statussen)
            {
                st.VolgendePulse = status.VolgendePulse == null ? "" : status.VolgendePulse.Value.ToString("MMM dd yyyy HH:mm:ss", new System.Globalization.CultureInfo("en-US", false));
                st.LaatstePulse = status.LaatstePulse == null ? "" : status.LaatstePulse.Value.ToString("MMM dd yyyy HH:mm:ss", new System.Globalization.CultureInfo("en-US", false));
            }

            return Json(st, JsonRequestBehavior.AllowGet);
        }
    }

    class CombinedServiceStatus
    {
        public string VolgendePulse { get; set; }
        public string LaatstePulse { get; set; }
        public string Status { get; set; }
    }
}
