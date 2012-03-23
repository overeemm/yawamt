using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Text;
using YAWAMT;

namespace YAWAMT.Utility
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                Config m_config = new Config();

                string mainswitch = args.Length == 0 ? "" : args[0];

                switch (mainswitch)
                {
                    case "--createdb":

                        Console.WriteLine("Creating database on connectionstring " + m_config.ConnectionString);

                        DataClassesDataContext context = m_config.GetNewContext();
                        context.CreateDatabase();

                        Console.WriteLine("Database created on connectionstring " + m_config.ConnectionString);
                        break;
                    default:

                        Console.WriteLine("--help         This page");
                        Console.WriteLine("--createdb     Creates an empty database using the registry connectionstring");

                        break;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
                Console.ReadLine();

            }
        }
    }
}
