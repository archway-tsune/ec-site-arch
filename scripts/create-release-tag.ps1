# EC Site Architecture - Release Tag Creation Script
# Usage: pnpm release

$ErrorActionPreference = "Stop"

# Get project root from script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Read version from package.json
$packageJsonPath = Join-Path $projectRoot "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
$version = $packageJson.version
$tagName = "v$version"

# Validate semver format
if ($version -notmatch '^\d+\.\d+\.\d+$') {
    Write-Host "エラー: バージョン '$version' はセマンティックバージョニング形式（x.y.z）ではありません。" -ForegroundColor Red
    exit 1
}

# Check if on main branch (FR-003)
$currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
if ($currentBranch -ne "main") {
    Write-Host "警告: 現在のブランチは '$currentBranch' です。リリースは main ブランチからのみ実行できます。" -ForegroundColor Yellow
    exit 1
}

# Check for duplicate tag (FR-002)
$existingTag = git tag -l $tagName
if ($existingTag) {
    Write-Host "タグ $tagName は既に存在します。package.json のバージョンを確認してください。" -ForegroundColor Red
    exit 1
}

# Create and push tag (FR-001)
Write-Host "タグ $tagName を作成中..."
git tag $tagName
if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: タグ $tagName の作成に失敗しました。" -ForegroundColor Red
    exit 1
}

Write-Host "タグ $tagName を origin にプッシュ中..."
git push origin $tagName
if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: タグ $tagName のプッシュに失敗しました。" -ForegroundColor Red
    exit 1
}

# Bump patch version for next development cycle
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));const v=p.version.split('.');v[2]=String(Number(v[2])+1);p.version=v.join('.');fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n')"
$nextVersion = node -e "console.log(JSON.parse(require('fs').readFileSync('package.json','utf8')).version)"

Write-Host "次期バージョン $nextVersion にバンプ中..."
git add $packageJsonPath
git commit -m "chore: bump version to $nextVersion [skip ci]"
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "リリースタグの作成が完了しました" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "タグ: $tagName"
Write-Host "次期バージョン: $nextVersion"
Write-Host "GitHub Actions が自動的にリリースを作成します。"
Write-Host ""
