# ---- build ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first (layer-cached) using just the project files in the API's reference graph.
COPY src/Expade.Core/Expade.Core.csproj src/Expade.Core/
COPY src/Expade.Application/Expade.Application.csproj src/Expade.Application/
COPY src/Expade.Infrastructure/Expade.Infrastructure.csproj src/Expade.Infrastructure/
COPY src/Expade.API/Expade.API.csproj src/Expade.API/
RUN dotnet restore src/Expade.API/Expade.API.csproj

# Build + publish.
COPY src/ src/
RUN dotnet publish src/Expade.API/Expade.API.csproj -c Release -o /app/publish --no-restore

# ---- runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Expade.API.dll"]
