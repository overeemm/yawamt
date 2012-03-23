using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Win32;

namespace YAWAMT
{
    public class Config
    {
        public Config()
        {
        }

        private string m_connectionstring = null;
        
        public string ConnectionString
        {
            get
            {
                if (string.IsNullOrEmpty(m_connectionstring))
                {
                    RegistryKey key = Registry.LocalMachine.OpenSubKey("Software\\yawamt");
                    if (key != null)
                    {
                        object constringObject = key.GetValue("connectionstring");
                        if (constringObject != null)
                            m_connectionstring = constringObject.ToString();

                    }
                }

                return m_connectionstring;
            }
        }

        public DataClassesDataContext GetNewContext()
        {
            return new DataClassesDataContext(ConnectionString);
        }
    }
}
