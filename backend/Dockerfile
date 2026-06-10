# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project files first (layer cache optimization)
COPY Directory.Build.props .
COPY Directory.Packages.props .
COPY src/CapitalLab.Domain/CapitalLab.Domain.csproj                     src/CapitalLab.Domain/
COPY src/CapitalLab.Contracts/CapitalLab.Contracts.csproj               src/CapitalLab.Contracts/
COPY src/CapitalLab.Application/CapitalLab.Application.csproj           src/CapitalLab.Application/
COPY src/CapitalLab.Infrastructure/CapitalLab.Infrastructure.csproj     src/CapitalLab.Infrastructure/
COPY src/CapitalLab.Api/CapitalLab.Api.csproj                           src/CapitalLab.Api/

# Restore (cached layer — only invalidated when .csproj files change)
RUN dotnet restore src/CapitalLab.Api/CapitalLab.Api.csproj

# Copy full source
COPY . .

# Publish
RUN dotnet publish src/CapitalLab.Api/CapitalLab.Api.csproj \
    --configuration $BUILD_CONFIGURATION \
    --no-restore \
    --output /app/publish \
    -p:UseAppHost=false

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install curl for health check probe
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1001 capitallab \
    && adduser --system --uid 1001 --gid 1001 capitallab

# Create directories for uploads and logs
RUN mkdir -p /app/uploads /app/logs \
    && chown -R capitallab:capitallab /app

USER capitallab

COPY --from=build --chown=capitallab:capitallab /app/publish .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health/live || exit 1

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

EXPOSE 8080

ENTRYPOINT ["dotnet", "CapitalLab.Api.dll"]
