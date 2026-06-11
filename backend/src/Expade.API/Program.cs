using System.Security.Claims;
using Expade.API.Endpoints;
using Expade.Core.Enums;
using Expade.Core.Interfaces;
using Expade.Infrastructure;
using Expade.Infrastructure.Repositories;
using Expade.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Tell EF Core to use PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register Repositories for Dependency Injection
builder.Services.AddScoped<IBusinessRepository, BusinessRepository>();
builder.Services.AddScoped<IBusinessRequestRepository, BusinessRequestRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins ?? Array.Empty<string>())
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Clerk:Authority"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Clerk:Authority"],
            ValidateAudience = false,
            ValidateLifetime = true,

            RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole(nameof(UserRole.Admin)));

    options.AddPolicy("BusinessOwnerOnly", policy => 
        policy.RequireRole(
            nameof(UserRole.Admin), 
            nameof(UserRole.BusinessOwner)
        ));

    options.AddPolicy("Worker", policy => 
        policy.RequireRole(
            nameof(UserRole.Admin), 
            nameof(UserRole.BusinessOwner),
            nameof(UserRole.Worker)
        ));
});

builder.Services.AddHttpClient<IEmailService, EmailService>();
builder.Services.AddHttpClient<IGeocodingService, OpenCageGeocodingService>();

// Set your API key in user-secrets or environment variable and retrieve it here
var apiKey = builder.Configuration["OpenCageApiKey"];

builder.Services.AddOpenApi();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapBusinessEndpoints();
app.MapBusinessRequestEndpoints();
app.MapCategoryEndpoints();
app.MapWebhookEndpoints();

app.Run();