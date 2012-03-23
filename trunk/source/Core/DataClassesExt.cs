using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace YAWAMT
{
    [MetadataType(typeof(Metadata))]
    public partial class Downtime
    {
        [ScaffoldTable(false)]
        public class Metadata
        {
            [ScaffoldColumn(false)]
            public object ID;

            [ScaffoldColumn(false)]
            public object Begintijd;

            [ScaffoldColumn(false)]
            public object Eindtijd;

            [ScaffoldColumn(false)]
            public object Hard;

            [ScaffoldColumn(false)]
            public object Url;

            [ScaffoldColumn(false)]
            public object Url1;

        }
    }

    [MetadataType(typeof(Metadata))]
    public partial class ServiceUptime
    {
        [ScaffoldTable(false)]
        public class Metadata
        {
            [ScaffoldColumn(false)]
            public object ID;

            [ScaffoldColumn(false)]
            public object StartTime;

            [ScaffoldColumn(false)]
            public object ShutdownTime;

        }
    }

    [MetadataType(typeof(Metadata))]
    public partial class Setting
    {
        [ScaffoldTable(true)]
        public class Metadata
        {
            [ScaffoldColumn(false)]
            public object ID;

            [ScaffoldColumn(true)]
            public object Naam;

            [ScaffoldColumn(true)]
            public object Periode;

            [ScaffoldColumn(true)]
            public object Retries;

            [ScaffoldColumn(true)]
            public object RetriesPeriode;

            [ScaffoldColumn(false)]
            public object Urls;

        }
    }

    [MetadataType(typeof(Metadata))]
    public partial class ServiceStatus
    {
        [ScaffoldTable(false)]
        public class Metadata
        {
            [ScaffoldColumn(false)]
            public object VolgendePulse;

            [ScaffoldColumn(false)]
            public object LaatstePulse;

            [ScaffoldColumn(false)]
            public object ID;

        }
    }


    [MetadataType(typeof(Metadata))]
    public partial class Url
    {
        [ScaffoldTable(false)]
        public class Metadata
        {
            [ScaffoldColumn(false)]
            public object UrlAsUri;

            [ScaffoldColumn(false)]
            public object Url1;

            [ScaffoldColumn(false)]
            public object ID;

            [ScaffoldColumn(false)]
            public object Naam;

            [ScaffoldColumn(false)]
            public object Settings;

            [ScaffoldColumn(false)]
            public object LaatstePulse;

            [ScaffoldColumn(false)]
            public object CurrentPeriode;

            [ScaffoldColumn(false)]
            public object Downtimes;

            [ScaffoldColumn(false)]
            public object Setting;

        }

        /// <summary>
        /// Geeft terug of er een openstaande downtime is.
        /// true als de downtime 'hard' is, false als die 'zacht' is. null als ie er niet is.
        /// </summary>
        /// <returns></returns>
        public bool? HasDownTime()
        {
            var downtimes = from d in this.Downtimes where d.Eindtijd == null select d;
            foreach (Downtime d in downtimes)
                return d.Hard;
            return null;
        }

        public Uri UrlAsUri { get { return new Uri(this.Url1); } }

        public override string ToString()
        {
            return string.Format("{0} ({1}:{2})", this.Url1, this.ID, this.Naam);
        }
    }
}
