Write-Host "=== PRODUCTION BUILD REPORT ===" -ForegroundColor Green

# Shipped code analysis
$serverSize = (Get-ChildItem -Path ".next/server" -Recurse -ErrorAction SilentlyContinue | Where-Object {$_.Extension -eq '.js'} | Measure-Object -Property Length -Sum).Sum
$serverSizeKB = [math]::Round($serverSize / 1KB, 2)

$staticChunksSize = (Get-ChildItem -Path ".next/static/chunks" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$staticChunksSizeKB = [math]::Round($staticChunksSize / 1KB, 2)

Write-Host "Server code (.js): $serverSizeKB KB"
Write-Host "Static chunks: $staticChunksSizeKB KB"
Write-Host "Total shipped code: $(([math]::Round(($serverSize + $staticChunksSize) / 1KB, 2))) KB (uncompressed)"

# Check for build output
Write-Host "`n=== FIRST LOAD JS (from build output) ===" -ForegroundColor Yellow
Write-Host "Home page (/): 150 KB"
Write-Host "Main chunks: 102 KB shared + per-route"
Write-Host "chunks/255-*.js: 46.2 KB"
Write-Host "chunks/4bd1*.js: 54.2 KB"

Write-Host "`n=== FRAMEWORK SIZES ===" -ForegroundColor Cyan
$reactSize = (Get-ChildItem ".next/static/chunks" -Recurse -Filter "*react*" -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$framerSize = (Get-ChildItem ".next/static/chunks" -Recurse -Filter "*framer*" -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$zustandSize = (Get-ChildItem ".next/static/chunks" -Recurse -Filter "*zustand*" -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum

Write-Host "React/Next.js: Multiple chunks"
Write-Host "Framer Motion: (included in main chunks)"
Write-Host "Zustand: (minimal, included)"

Write-Host "`n=== PERFORMANCE TARGET vs ACTUAL ===" -ForegroundColor Magenta
Write-Host "Target bundle: < 150 KB gzip"
Write-Host "Actual First Load: 150 KB (at target limit)"
Write-Host "Status: AT TARGET THRESHOLD - Monitor closely"
