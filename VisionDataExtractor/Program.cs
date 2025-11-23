using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using VisionDataExtractor;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<VisionDataExtractor.Pages.VisionExtractor>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri("/") });

await builder.Build().RunAsync();
