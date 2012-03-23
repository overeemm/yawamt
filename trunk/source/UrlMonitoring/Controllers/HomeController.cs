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
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Feed()
        {
            List<UrlStatus> urllist = new List<UrlStatus>();

            DataClassesDataContext context = new Config().GetNewContext();
            var urls = from u in context.Urls orderby u.Naam select u;
            foreach (Url url in urls)
            {
                var downtime = (from u in context.Urls where u.ID == url.ID select u.HasDownTime()).First();

                urllist.Add(new UrlStatus { Url = url, Down = downtime });
            }

            ViewData["urllist"] = urllist;

            return View();
        }
    }
}
