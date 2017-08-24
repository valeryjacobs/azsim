using DeepStreamNet;
using System;
using System.Threading.Tasks;

namespace AZSimAgent
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Read();
        }

        async static Task Exec()
        {
            string simulatorId = Guid.NewGuid().ToString();
            var client = new DeepStreamClient("40.118.108.105", 6020);

            if (await client.LoginAsync())
            {
                var record = await client.Records.GetRecordAsync(simulatorId);

                record["runtime"] = "console";
                record["status"] = "waiting";
                record["simulatorId"] = simulatorId;
                record["frequency"] = 0;
                record["payload"] = "";
                record["runtime"] = "console";

                var list = await client.Records.GetListAsync("simulators");

                list.Add(simulatorId);

                //var disp = await client.Events.SubscribeAsync("test", Console.WriteLine);

                //await Task.Delay(2000);

                //client.Events.Publish("test", "Hello World");

                //await Task.Delay(30000);

                Console.ReadKey();

                //await disp.DisposeAsync();
            }

            client.Dispose();
        }
    }
}
