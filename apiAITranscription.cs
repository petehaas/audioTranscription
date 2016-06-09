ing System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApiAiSDK;
using ApiAiSDK.Model;
using System.IO;
using System.Reflection;

namespace Api.ai
{
    class Program
    {
        static void Main(string[] args)
        {
            test();
        }

        private static void test()
        {
            var config = new AIConfiguration("[ADD your API]", SupportedLanguage.English);
            var client = new ApiAi(config);
            var result = client.VoiceRequest(ReadFileFromResource(Path.Combine(Environment.CurrentDirectory, "[Add your WAV]")));
            Console.WriteLine(result.Result.ResolvedQuery);
            Console.ReadLine();
        }

        private static Stream ReadFileFromResource(string resourceId)
        {
            Stream stream = File.OpenRead(resourceId);
            return stream;
        }
    }
}

