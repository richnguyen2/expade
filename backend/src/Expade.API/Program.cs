using Expade.API.Endpoints;
using Expade.API.Handlers;
using Expade.API.Middleware;
using Expade.Application.Appointments;
using Expade.Application.BlockedTimes;
using Expade.Application.BusinessRequests;
using Expade.Application.Businesses;
using Expade.API.Validators;
using Expade.Application.Common;
using Expade.Core.Enums;
using FluentValidation;
using Expade.Core.Interfaces;
using Expade.Infrastructure;
using Microsoft.AspNetCore.HttpOverrides;
using Expade.Infrastructure.Repositories;
using Expade.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Security.Claims;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

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
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IBlockedTimeRepository, BlockedTimeRepository>();

// Application services (use-case orchestrators)
builder.Services.AddScoped<IBusinessAccess, BusinessAccess>();
builder.Services.AddScoped<IBusinessRequestAppService, BusinessRequestAppService>();
builder.Services.AddScoped<IBusinessAppService, BusinessAppService>();
builder.Services.AddScoped<IAppointmentAppService, AppointmentAppService>();
builder.Services.AddScoped<IBlockedTimeAppService, BlockedTimeAppService>();

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
builder.Services.AddHttpClient<IClerkService, ClerkService>();

builder.Services.AddOpenApi();

// FluentValidation validators (applied per-endpoint via ValidationFilter<T>).
builder.Services.AddValidatorsFromAssemblyContaining<CreateServiceValidator>();

// Map exceptions to RFC 7807 ProblemDetails via GlobalExceptionHandler.
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Rate-limit the address-search proxy per authenticated user (fallback IP) so it can't be abused.
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy(AddressEndpoints.SearchRateLimitPolicy, httpContext =>
    {
        var key = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? httpContext.Connection.RemoteIpAddress?.ToString()
                  ?? "anonymous";
        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
        });
    });
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

// Behind a cloud proxy (Fly/Render/etc.) TLS is terminated at the edge and HTTP is forwarded to the
// container. Honor X-Forwarded-Proto/For so the app sees the real https scheme + client IP. Must run
// before any middleware that depends on the scheme (HTTPS redirect, auth, rate limiting).
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
forwardedHeadersOptions.KnownIPNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

// Just-in-time mirror the authenticated Clerk user into our DB if it's missing.
app.UseMiddleware<EnsureUserMiddleware>();

app.MapBusinessEndpoints();
app.MapBusinessRequestEndpoints();
app.MapCategoryEndpoints();
app.MapAppointmentEndpoints();
app.MapBlockedTimeEndpoints();
app.MapAddressEndpoints();
app.MapWebhookEndpoints();

// Apply pending EF migrations on startup so a fresh/containerized database is provisioned.
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}

app.Run();