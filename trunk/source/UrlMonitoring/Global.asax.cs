using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

using System.Web.DynamicData;

namespace YAWAMT.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            MetaModel model = new MetaModel();
            model.RegisterContext(() => new YAWAMT.DataClassesDataContext(new Config().ConnectionString), new ContextConfiguration() { ScaffoldAllTables = false });
            
            routes.Add(new DynamicDataRoute("Data/{table}/ListDetails.aspx")
            {
                Action = PageAction.List,
                ViewName = "ListDetails",
                Model = model
            });
            routes.Add(new DynamicDataRoute("Data/{table}/ListDetails.aspx")
            {
                Action = PageAction.Details,
                ViewName = "ListDetails",
                Model = model
            });



            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            //routes.Add(new DynamicDataRoute("Data/{table}/{action}.aspx")
            //{
            //    Constraints = new RouteValueDictionary(new { action = "List|Details|Edit|Insert" }),
            //    Model = model
            //});

            routes.MapRoute(
                "Default",                                              // Route name
                "{controller}/{action}/{id}",                           // URL with parameters
                new { controller = "Home", action = "Index", id = "" }  // Parameter defaults
            );

        }

        protected void Application_Start()
        {
            RegisterRoutes(RouteTable.Routes);
        }

        protected void Application_BeginRequest()
        {

        }

        protected void Application_Error()
        {
            Exception e = Server.GetLastError();
        }
    }
}