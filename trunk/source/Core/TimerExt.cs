using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace YAWAMT
{
    public static class TimerExt
    {
        public static void SetIntervalInSeconds(this System.Timers.Timer t, int seconds)
        {
            t.Interval = seconds * 1000;
        }

        public static bool HasDifferentIntervalInSeconds(this System.Timers.Timer t, int seconds)
        {
            return t.Interval != seconds * 1000;
        }
    }
}
