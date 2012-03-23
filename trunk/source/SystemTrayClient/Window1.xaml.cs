using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Reflection;
using System.IO;

namespace YAWAMT.SystemTrayClient
{
    /// <summary>
    /// Interaction logic for Window1.xaml
    /// </summary>
    public partial class Window1 : Window
    {
        System.Windows.Forms.NotifyIcon _systemtray;
        bool _systemtrayballoonshown = false;

        public Window1()
        {
            InitializeComponent();

            _systemtray = new System.Windows.Forms.NotifyIcon();

            Assembly a = Assembly.GetExecutingAssembly();
            Stream logoStream = a.GetManifestResourceStream("YAWAMT.SystemTrayClient.yawamt.ico");

            _systemtray.Icon = new System.Drawing.Icon(logoStream);
            _systemtray.Visible = true;

            _systemtray.Click += new EventHandler(SystemTrayIcon_Click);
            _systemtray.MouseMove += new System.Windows.Forms.MouseEventHandler(SystemTrayIcon_MouseMove);
            _systemtray.BalloonTipShown += new EventHandler(SystemTrayIcon_BalloonTipShown);
            _systemtray.BalloonTipClosed += new EventHandler(SystemTrayIcon_BalloonTipClosed);

            _systemtray.BalloonTipIcon = System.Windows.Forms.ToolTipIcon.Info;
            _systemtray.BalloonTipTitle = "yawamt";
            _systemtray.BalloonTipText = "3 down, 5 up";

            AttachContextMenu();

            try
            {
                IconBitmapDecoder decoder = new IconBitmapDecoder(logoStream, BitmapCreateOptions.PreservePixelFormat, BitmapCacheOption.Default);
                imglogo.Source = decoder.Frames[0];
            }
            catch { }

            this.Hide();

            //if (string.IsNullOrEmpty(YAWAMT.SystemTrayClient.Properties.Settings.Default.Url))
            //    ContextMenuSettings(this, EventArgs.Empty);
        }

        private void AttachContextMenu()
        {
            _systemtray.ContextMenu =
                new System.Windows.Forms.ContextMenu(
                    new System.Windows.Forms.MenuItem[] { 
                          new System.Windows.Forms.MenuItem("settings", new EventHandler(ContextMenuSettings))
                        , new System.Windows.Forms.MenuItem("exit", new EventHandler(ContextMenuExit))
                    }
                );
        }

        protected void ContextMenuExit(object sender, EventArgs args)
        {
            Close();
        }

        protected void ContextMenuSettings(object sender, EventArgs args)
        {
            Assembly a = Assembly.GetExecutingAssembly();
            Stream logoStream = a.GetManifestResourceStream("YAWAMT.SystemTrayClient.yawamt.png");

            Settings s = new Settings();
            PngBitmapDecoder decoder = new PngBitmapDecoder(logoStream, BitmapCreateOptions.PreservePixelFormat, BitmapCacheOption.Default);
            s.Icon = decoder.Frames[0];
            s.Title = "settings - yawamt";

            s.Show();
        }

        void SystemTrayIcon_BalloonTipClosed(object sender, EventArgs e)
        {
            _systemtrayballoonshown = false;
        }

        void SystemTrayIcon_BalloonTipShown(object sender, EventArgs e)
        {
            _systemtrayballoonshown = true;
        }

        void SystemTrayIcon_MouseMove(object sender, System.Windows.Forms.MouseEventArgs e)
        {
            if (!_systemtrayballoonshown)
                _systemtray.ShowBalloonTip(10);
        }

        void SystemTrayIcon_Click(object sender, EventArgs e)
        {
            Notification n = new Notification(Color.FromRgb(255, 0, 0), "www.google.nl", DateTime.Now);
            n.Show();
            //throw new NotImplementedException();
        }

        protected override void OnStateChanged(EventArgs e)
        {
            if (WindowState == WindowState.Minimized)
                this.Hide();

            base.OnStateChanged(e);
        }

        protected override void OnClosed(EventArgs e)
        {
            HideSystemTray();
            base.OnClosed(e);
        }

        internal void HideSystemTray()
        {
            _systemtray.Visible = false;
        }
    }
}
