using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace YAWAMT
{


    public class TimelineEvent
    {

        public string Begintijd { get; set; }
        public string Eindtijd { get; set; }
        public string CSSClass { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Duration { get; set; }

        public static TimelineEvent Create(Url u, Downtime d)
        {
            return Create(d.Begintijd, d.Hard ? "downtime-hard" : "downtime-zacht"
                , string.Format("{1} ({0})", d.Hard ? "error" : "waarschuwing", u.Naam)
                , string.Format("<a href=\"{0}\">{1}</a>", u.Url1, u.Naam)
                , d.Eindtijd);
        }

        public static TimelineEvent Create(Downtime d)
        {
            return Create(d.Begintijd, d.Hard ? "downtime-hard" : "downtime-zacht"
                , string.Format("Downtime ({0})", d.Hard ? "error" : "waarschuwing")
                , "", d.Eindtijd);
        }

        public static TimelineEvent Create(DateTime begintijd, string css, string title, string desc, DateTime? eindtijd)
        {
            return new TimelineEvent
            {
                Begintijd = begintijd.ToString("MMM dd yyyy HH:mm:ss", new System.Globalization.CultureInfo("en-US", false))
                ,
                CSSClass = css
                ,
                Title = title
                ,
                Description = desc
                ,
                Eindtijd = eindtijd != null ? eindtijd.Value.ToString("MMM dd yyyy HH:mm:ss", new System.Globalization.CultureInfo("en-US", false)) : ""
                ,
                Duration = eindtijd == null ? "false" : "true"
            };
        }
    }
}
