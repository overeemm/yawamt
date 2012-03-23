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
using System.Windows.Shapes;
using System.Reflection;
using System.IO;

namespace YAWAMT.SystemTrayClient
{
    /// <summary>
    /// Interaction logic for Notification.xaml
    /// </summary>
    public partial class Notification : Window
    {
        public Notification(Color startcolor, string url, DateTime downtime)
        {
            InitializeComponent();

            this.Background = new LinearGradientBrush(startcolor, Color.FromRgb(0, 0, 0), 90);
            this.Opacity = 0.7;
            
            label1.Content = url;
            label2.Content = downtime.ToString();

            Assembly a = Assembly.GetExecutingAssembly();
            Stream globe = a.GetManifestResourceStream("YAWAMT.SystemTrayClient.globe.png");

            PngBitmapDecoder decoder = new PngBitmapDecoder(globe, BitmapCreateOptions.PreservePixelFormat, BitmapCacheOption.Default);
            image1.Source = decoder.Frames[0];
        }

        private void CloseWindow(object sender, MouseButtonEventArgs e)
        {
            this.Close();
        }
    }
}
