param(
    [Parameter(Mandatory = $true)]
    [string]$GrafanaHome,

    [ValidateRange(1024, 65535)]
    [int]$Port = 3100,

    [string]$DataDirectory
)

$ErrorActionPreference = 'Stop'
if (!$DataDirectory) {
    $DataDirectory = Join-Path $PSScriptRoot '.grafana-local'
}
$grafanaRoot = (Resolve-Path -LiteralPath $GrafanaHome).Path
$server = Join-Path $grafanaRoot 'bin/grafana.exe'
$legacyServer = Join-Path $grafanaRoot 'bin/grafana-server.exe'
$dist = Join-Path $PSScriptRoot 'dist'
$trendDist = Join-Path $PSScriptRoot 'dist-trend'
$scoreDist = Join-Path $PSScriptRoot 'dist-score-data'

if (!(Test-Path -LiteralPath $server) -and !(Test-Path -LiteralPath $legacyServer)) {
    throw 'GrafanaHome, Grafana bin klasorunu iceren ana dizin olmali.'
}
foreach ($file in @('plugin.json', 'module.js')) {
    if (!(Test-Path -LiteralPath (Join-Path $dist $file)) -or
        !(Test-Path -LiteralPath (Join-Path $trendDist $file)) -or
        !(Test-Path -LiteralPath (Join-Path $scoreDist $file))) {
        throw 'Once node build.mjs komutunu calistirin.'
    }
}

$local = (New-Item -ItemType Directory -Force -Path $DataDirectory).FullName
$data = Join-Path $local 'data'
$logs = Join-Path $local 'logs'
$plugins = Join-Path $local 'plugins'
$plugin = Join-Path $plugins 'kultur-studentperformance-panel'
$trendPlugin = Join-Path $plugins 'kultur-studenttrend-panel'
$scorePlugin = Join-Path $plugins 'kultur-studentscore-datasource'
$provisioning = Join-Path $local 'provisioning'
$dashboardFiles = Join-Path $local 'dashboards'
$datasourceConfig = Join-Path $provisioning 'datasources'
$dashboardConfig = Join-Path $provisioning 'dashboards'
New-Item -ItemType Directory -Force -Path $data,$logs,$plugin,$trendPlugin,$scorePlugin,$dashboardFiles,$datasourceConfig,$dashboardConfig | Out-Null
Copy-Item -LiteralPath (Join-Path $dist 'plugin.json'),(Join-Path $dist 'module.js') -Destination $plugin
Copy-Item -LiteralPath (Join-Path $trendDist 'plugin.json'),(Join-Path $trendDist 'module.js') -Destination $trendPlugin
Copy-Item -LiteralPath (Join-Path $scoreDist 'plugin.json'),(Join-Path $scoreDist 'module.js'),(Join-Path $scoreDist 'scores.json') -Destination $scorePlugin
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'demo/student-performance.json') -Destination $dashboardFiles
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'demo/provisioning/datasources/testdata.yaml') -Destination $datasourceConfig

$yamlPath = $dashboardFiles.Replace('\', '/').Replace("'", "''")
@"
apiVersion: 1
providers:
  - name: Student Performance demo
    type: file
    allowUiUpdates: true
    options:
      path: '$yamlPath'
"@ | Set-Content -LiteralPath (Join-Path $dashboardConfig 'demo.yaml') -Encoding UTF8

$config = Join-Path $local 'custom.ini'
@"
[paths]
data = $data
logs = $logs
plugins = $plugins
provisioning = $provisioning

[server]
http_addr = 127.0.0.1
http_port = $Port

[plugins]
allow_loading_unsigned_plugins = kultur-studentperformance-panel,kultur-studenttrend-panel,kultur-studentscore-datasource
preinstall_disabled = true
"@ | Set-Content -LiteralPath $config -Encoding UTF8

Write-Host "http://127.0.0.1:$Port/d/student-performance/student-performance"
if (Test-Path -LiteralPath $server) {
    & $server server --homepath $grafanaRoot --config $config
} else {
    & $legacyServer --homepath $grafanaRoot --config $config
}
exit $LASTEXITCODE
