using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Windows;

namespace YAWAMT.SystemTrayClient
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        protected override void OnExit(ExitEventArgs e)
        {
            if(this.Windows.Count > 0 && this.Windows[0] is Window1)
                ((Window1)this.Windows[0]).HideSystemTray();
            base.OnExit(e);
        }
    }
}
