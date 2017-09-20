using DeepStreamNet;
using DeepStreamNet.Contracts;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace AZSimHostAgent
{
    class Program
    {
        static  IDeepStreamRecord record;
        static void Main(string[] args)
        {
            MainAsync(args).GetAwaiter().GetResult();

            Console.Read();
        }

        static Task MainAsync(string[] args)
        {
            return Exec();
        }

        async static Task Exec()
        {
            Console.WriteLine("Connecting to " + Environment.GetEnvironmentVariable("AZSIM_ComHub_IP") + "...");
            string simulatorHostId = Guid.NewGuid().ToString();
            var client = new DeepStreamClient(Environment.GetEnvironmentVariable("AZSIM_ComHub_IP"), 6020);

            if (await client.LoginAsync())
            {
                Console.WriteLine("Connection to hub established");
                Console.WriteLine("Registered as simulator host " + simulatorHostId);
                await client.Rpcs.RegisterProviderAsync<string, string>(simulatorHostId, HandleCommand);
                record = await client.Records.GetRecordAsync(simulatorHostId);

                record["runtime"] = "W10 Console";
                record["status"] = "Ready";
                record["simulatorHostId"] = simulatorHostId;

                var list = await client.Records.GetListAsync("simulatorhosts");

                list.Add(simulatorHostId);  
            }
        }

        static async Task HandleCommand(dynamic input, IRpcResponse<string> response)
        {
            record["status"] = "Handling command";
            Console.WriteLine(input.command);

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "node";
            psi.Arguments = input.commandParams;
            psi.UseShellExecute = true;


            Process proc = new Process
            {
                StartInfo = psi
            };

            proc.Start();
  
            response.Send("Process completed");
            record["status"] = "Completed";
        }
    }
}
