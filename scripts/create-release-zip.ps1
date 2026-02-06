# EC Site Architecture - Release ZIP Creation Script
# Usage: .\scripts\create-release-zip.ps1 [-OutputPath <path>]

param(
    [string]$OutputPath = "ec-site-arch.zip"
)

$ErrorActionPreference = "Stop"

# Get project root from script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Directories and files to exclude
$excludeDirs = @(
    'node_modules',
    '.next',
    'coverage',
    'test-results',
    'playwright-report',
    '.git',
    '.claude',
    '.specify',
    'scripts',
    'specs'
)

$excludeFiles = @(
    '*.tsbuildinfo',
    'pnpm-lock.yaml',
    '*.zip'
)

# Convert output path to absolute path
if (-not [System.IO.Path]::IsPathRooted($OutputPath)) {
    $OutputPath = Join-Path $projectRoot $OutputPath
}

# Delete existing ZIP
if (Test-Path $OutputPath) {
    Remove-Item $OutputPath -Force
    Write-Host "Deleted existing ZIP: $OutputPath"
}

# Collect target files
Write-Host "Collecting files..."
$files = Get-ChildItem -Path $projectRoot -Recurse -File | Where-Object {
    $relativePath = $_.FullName.Replace("$projectRoot\", '')
    $exclude = $false

    # Check directory exclusion
    foreach ($dir in $excludeDirs) {
        if ($relativePath -like "$dir\*" -or $relativePath -like "$dir/*" -or $relativePath -eq $dir) {
            $exclude = $true
            break
        }
    }

    # Check file pattern exclusion
    if (-not $exclude) {
        foreach ($pattern in $excludeFiles) {
            if ($_.Name -like $pattern) {
                $exclude = $true
                break
            }
        }
    }

    -not $exclude
}

$fileCount = ($files | Measure-Object).Count
Write-Host "Target files: $fileCount"

# Create temp directory
$tempDir = Join-Path $env:TEMP "ec-site-arch-release-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    # Copy files
    Write-Host "Copying files..."
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace("$projectRoot\", '')
        $destPath = Join-Path $tempDir $relativePath
        $destDir = Split-Path $destPath -Parent

        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        Copy-Item $file.FullName -Destination $destPath
    }

    # Create ZIP
    Write-Host "Creating ZIP..."
    Compress-Archive -Path "$tempDir\*" -DestinationPath $OutputPath -Force

    # Show result
    $zipInfo = Get-Item $OutputPath
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Release ZIP created successfully" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "File: $($zipInfo.Name)"
    Write-Host "Size: $([math]::Round($zipInfo.Length / 1KB, 2)) KB"
    Write-Host "Path: $($zipInfo.FullName)"
    Write-Host "Files: $fileCount"
    Write-Host ""
}
finally {
    # Delete temp directory
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
}
