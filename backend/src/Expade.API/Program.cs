using Expade.API.Endpoints;
using Expade.Core.Interfaces;
using Expade.Infrastructure;
using Expade.Infrastructure.Repositories;
using Expade.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Tell EF Core to use PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register Repositories for Dependency Injection
builder.Services.AddScoped<IBusinessRepository, BusinessRepository>();

builder.Services.AddHttpClient<IGeocodingService, OpenCageGeocodingService>();

// Set your API key in user-secrets or environment variable and retrieve it here
var apiKey = builder.Configuration["OpenCageApiKey"];

builder.Services.AddSingleton<IGeocodingService>(sp => 
    new OpenCageGeocodingService(new HttpClient(), apiKey));


builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.MapBusinessEndpoints();

app.Run();