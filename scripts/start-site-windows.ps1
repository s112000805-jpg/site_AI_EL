$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$siteUrl = "http://127.0.0.1:5173/"

function Test-SiteReady {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

try {
    Set-Location -LiteralPath $projectRoot

    Write-Host ""
    Write-Host "========================================"
    Write-Host "  AI Course Site - Windows Launcher"
    Write-Host "========================================"
    Write-Host ""

    if (-not (Get-Command node.exe -ErrorAction SilentlyContinue) -or
        -not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        Write-Host "Node.js was not found." -ForegroundColor Yellow
        Write-Host "Install Node.js 22 or newer, then run this launcher again."
        Start-Process "https://nodejs.org/zh-tw/download"
        exit 1
    }

    $nodeVersionText = (& node.exe -p "process.versions.node").Trim()
    $nodeVersion = [version]$nodeVersionText
    if ($nodeVersion.Major -lt 22) {
        Write-Host "Node.js $nodeVersionText is too old." -ForegroundColor Yellow
        Write-Host "This site requires Node.js 22 or newer."
        Start-Process "https://nodejs.org/zh-tw/download"
        exit 1
    }

    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot "node_modules\.bin\vinext.cmd"))) {
        Write-Host "[1/4] First launch: installing required components..."
        Write-Host "      This may take several minutes. Keep this window open."
        & npm.cmd run install:ci
        if ($LASTEXITCODE -ne 0) {
            throw "The required components could not be installed. Check the network connection and try again."
        }
    }
    else {
        Write-Host "[1/4] Required components are ready."
    }

    $wranglerConfig = Join-Path $projectRoot "dist\server\wrangler.json"
    if (-not (Test-Path -LiteralPath $wranglerConfig)) {
        Write-Host "[2/4] Preparing the local database configuration..."
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) {
            throw "The local database configuration could not be prepared."
        }
    }
    else {
        Write-Host "[2/4] Local database configuration is ready."
    }

    Write-Host "[3/4] Creating or updating the local learning database..."
    $wranglerCli = Join-Path $projectRoot "node_modules\wrangler\bin\wrangler.js"
    # Node.js on Windows requires --import to use a relative module specifier.
    $sitesEnvironment = "./scripts/sites-env.mjs"
    $localSchema = Join-Path $projectRoot "scripts\local-db-init.sql"
    $localState = Join-Path $projectRoot ".wrangler\state"
    & node.exe --import $sitesEnvironment $wranglerCli d1 execute DB --local --config $wranglerConfig --persist-to $localState --file $localSchema
    if ($LASTEXITCODE -ne 0) {
        throw "The local learning database could not be initialized."
    }

    if (Test-SiteReady -Url $siteUrl) {
        Write-Host "[4/4] The local site is already running."
    }
    else {
        Write-Host "[4/4] Starting the local site..."
        $serverCommand = "title AI Course Site Server && npm run dev -- --port 5173 --hostname 127.0.0.1"
        Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $serverCommand -WorkingDirectory $projectRoot
    }

    Write-Host "      Waiting for the site to become ready..."
    $isReady = $false
    for ($attempt = 1; $attempt -le 60; $attempt++) {
        if (Test-SiteReady -Url $siteUrl) {
            $isReady = $true
            break
        }
        Start-Sleep -Seconds 2
    }

    if (-not $isReady) {
        throw "The site did not start within two minutes. Review the AI Course Site Server window for details."
    }

    Write-Host ""
    Write-Host "The site is ready. Opening the browser..." -ForegroundColor Green
    Start-Process $siteUrl
    Write-Host "Keep the server window open. Close that window to stop the local site."
    Start-Sleep -Seconds 3
    exit 0
}
catch {
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
