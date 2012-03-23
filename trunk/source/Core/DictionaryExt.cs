using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace YAWAMT
{
    public static class DictionaryExt
    {
        public static Dictionary<T, U> Create<T, U>(this Dictionary<T, U> dic, T key, U value)
        {
            dic.Add(key, value);
            return dic;
        }
        public static Dictionary<T, U> Create<T, U>(this Dictionary<T, U> dic, T[] key, U[] value)
        {
            if (key.Length != value.Length)
                throw new ArgumentException("Key aray is niet even lang als value array");

            for(int i = 0; i < key.Length; i++)
                dic.Add(key[i], value[i]);

            return dic;
        }
    }
}
