# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy the solution and all project files for restoration
# We copy them specifically so Docker can cache the "restore" layer
COPY *.slnx .
COPY src/Expade.API/*.csproj ./src/Expade.API/
COPY src/Expade.Core/*.csproj ./src/Expade.Core/
COPY src/Expade.Infrastructure/*.csproj ./src/Expade.Infrastructure/

# Restore dependencies for the entire solution
RUN dotnet restore

# Copy the remaining source code and build the release version
COPY . .
RUN dotnet build -c Release -o /app/build

# Stage 2: Final Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/build .

# Expose the API port
EXPOSE 8080

# Run the API
ENTRYPOINT ["dotnet", "Expade.API.dll"]