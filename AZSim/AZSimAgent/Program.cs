using DeepStreamNet;
using DeepStreamNet.Contracts;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace AZSimAgent
{
    public static class Program
    {
        public static void Main(string[] args)
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
            string simulatorId = Guid.NewGuid().ToString();
            var client = new DeepStreamClient(Environment.GetEnvironmentVariable("AZSIM_ComHub_IP"), 6020);

            var proc = await client.Rpcs.RegisterProviderAsync<string, string>("command", HandleCommand);


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

        static async Task HandleCommand(string input, IRpcResponse<string> response)
        {
            if (string.IsNullOrEmpty(input))
                response.Error("invalid input");

            if (false)
                response.Reject();

            switch (input)
            {
                case "runProcess":
                    await RunProcess();
                    break;
            }

            response.Send(input);
        }

        static async Task<bool> RunProcess()
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "node";
            psi.Arguments = @"C:\Code\azsim\AZSim\AZSimAgentJS\app.js";
            psi.UseShellExecute = false;

            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;

            Process proc = new Process
            {
                StartInfo = psi
            };

            proc.Start();

            string error = proc.StandardError.ReadToEnd();

            if (!string.IsNullOrEmpty(error))
                return false;

            string output = proc.StandardOutput.ReadToEnd();

            await Task.Run(() =>
                {
                    proc.WaitForExit();
                });

            return true;
        }
    }
}
