using DeepStreamNet;
using System;
using System.Threading.Tasks;

namespace AZSimHostAgent
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Read();
        }

        async static Task Exec()
        {
            string hostAgentId = Guid.NewGuid().ToString();
            var client = new DeepStreamClient("40.118.108.105", 6020);

            if (await client.LoginAsync())
            {
                var record = await client.Records.GetListAsync.(hostAgentId);
                record["ID"] = hostAgentId;
                record["Type"] = "Local PC";
                record["Location"] = "Europe";
                record["IPAddress"] = "10.0.0.1";
                record["CPUCapacity"] = "10";

               
            }
        }
    }
}
