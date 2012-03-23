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
    /// Interaction logic for Settings.xaml
    /// </summary>
    public partial class Settings : Window
    {
        public Settings()
        {
            InitializeComponent();

            Assembly a = Assembly.GetExecutingAssembly();
            Stream pngstream = a.GetManifestResourceStream("YAWAMT.SystemTrayClient.save.png");

            PngBitmapDecoder decoder = new PngBitmapDecoder(pngstream, BitmapCreateOptions.PreservePixelFormat, BitmapCacheOption.Default);
            image1.Source = decoder.Frames[0];

            //textBox1.Text = YAWAMT.SystemTrayClient.Properties.Settings.Default.Url;
        }

        private void Save(object sender, MouseButtonEventArgs e)
        {
            //YAWAMT.SystemTrayClient.Properties.Settings.Default.Url = textBox1.Text;
            YAWAMT.SystemTrayClient.Properties.Settings.Default.Save();
        }
    }
}
