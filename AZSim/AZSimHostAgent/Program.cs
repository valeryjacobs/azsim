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
            string simulatorHostId = Guid.NewGuid().ToString();
            var client = new DeepStreamClient("40.118.108.105", 6020);

            if (await client.LoginAsync())
            {
                await client.Rpcs.RegisterProviderAsync<string, string>(simulatorHostId, HandleCommand);
                record = await client.Records.GetRecordAsync(simulatorHostId);

                record["runtime"] = "W10 Console";
                record["status"] = "Ready";
                record["simulatorHostId"] = simulatorHostId;

                var list = await client.Records.GetListAsync("simulatorhosts");

                list.Add(simulatorHostId);
                //var record = await client.Records.GetListAsync.(hostAgentId);
                //record["ID"] = hostAgentId;
                //record["Type"] = "Local PC";
                //record["Location"] = "Europe";
                //record["IPAddress"] = "10.0.0.1";
                //record["CPUCapacity"] = "10";


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
            //proc.WaitForExit();


            //switch (input.command)
            //{
            //    case "runNodeApp":
            //await RunProcess(input);
            //        break;
            //}
          

            response.Send("Process completed");
            record["status"] = "Completed";
        }

    }
}
