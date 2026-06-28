# Bundle Size Analysis
Write-Host "=== BUNDLE SIZE ANALYSIS ===" -ForegroundColor Green

# Total .next size
$nextSize = (Get-ChildItem -Path ".next" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$nextSizeMB = [math]::Round($nextSize / 1MB, 2)
Write-Host "Total .next directory: $nextSizeMB MB"

# Static chunks
$staticSize = (Get-ChildItem -Path ".next/static" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$staticSizeMB = [math]::Round($staticSize / 1MB, 2)
Write-Host "Static chunks: $staticSizeMB MB"

# Chunks breakdown
Write-Host "`n=== CHUNK BREAKDOWN ===" -ForegroundColor Yellow
Get-ChildItem -Path ".next/static/chunks" -Name -ErrorAction SilentlyContinue | ForEach-Object {
    $filePath = ".next/static/chunks/$_"
    $size = (Get-Item $filePath).Length
    $sizeKB = [math]::Round($size / 1KB, 2)
    Write-Host "$_ : $sizeKB KB"
}

# Check for large files
Write-Host "`n=== LARGEST FILES ===" -ForegroundColor Cyan
Get-ChildItem -Path ".next" -Recurse -ErrorAction SilentlyContinue | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 2)
    Write-Host "$($_.FullName.Replace((Get-Location), '')) : $sizeKB KB"
}
