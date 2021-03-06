﻿using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace AZSimOrchestrator.Controllers
{
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        [Route("login")]
        public HttpResponseMessage Login([FromBody] dynamic authData)
        {
            //TODO: Implement AAD integration
            if (authData.username == "validusername" & authData.userPWD == "validpwd")
            {
                return new HttpResponseMessage(System.Net.HttpStatusCode.Accepted);
            }
            else
            {
                return new HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized);
            }
        }
    }
}
