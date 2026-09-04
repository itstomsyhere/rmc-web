<#
  safe-commit.ps1 - commit HANYA file yang kamu sebut (anti commit-sweep di repo multi-sesi).
  Pakai:
    powershell -File tools\safe-commit.ps1 -m "feat: ..." -Files src\data.jsx,src\primitives.jsx
  Opsi:
    -NoPush   commit saja, jangan push
    -Force    tetap lanjut walau ada file lain ter-stage (default: berhenti, biar aman)
#>
param(
  [Parameter(Mandatory = $true)][string]$m,
  [Parameter(Mandatory = $true)][string[]]$Files,
  [switch]$NoPush,
  [switch]$Force
)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)   # repo root (script ada di tools/)

# Robust: terima '-Files a,b,c' (satu string koma, dari `powershell -File`) maupun array asli.
$Files = @($Files | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
if (-not $Files -or $Files.Count -eq 0) {
  Write-Host "ERROR: -Files wajib diisi. Jangan pernah commit semua di repo multi-sesi." -ForegroundColor Red
  exit 1
}

Write-Host "Staging HANYA file kamu:" -ForegroundColor Cyan
foreach ($f in $Files) {
  if (-not (Test-Path $f)) { Write-Host "  ! lewati (tak ada): $f" -ForegroundColor Yellow; continue }
  git add -- $f
  Write-Host "  + $f"
}

# Guard: pastikan tak ada file lain yang ikut ter-stage (mis. dari 'git add .' sebelumnya = kerja sesi lain).
$staged = @(git diff --cached --name-only)
$norm   = $Files | ForEach-Object { $_ -replace '\\','/' }
$extra  = $staged | Where-Object { $norm -notcontains ($_ -replace '\\','/') }
if ($extra -and -not $Force) {
  Write-Host ""
  Write-Host "BERHENTI: ada file lain ter-stage (BUKAN dari -Files) - mungkin kerja sesi lain:" -ForegroundColor Red
  $extra | ForEach-Object { Write-Host "  ? $_" -ForegroundColor Yellow }
  Write-Host "Unstage dulu:  git restore --staged -- <file>   (atau -Force kalau memang sengaja)" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Yang akan di-commit:" -ForegroundColor Cyan
git diff --cached --stat

git commit -m $m
Write-Host "Sinkron (pull --rebase --autostash)..." -ForegroundColor Cyan
git pull --rebase --autostash   # --autostash: aman walau ada file lain yang masih dirty (kasus multi-sesi)
if (-not $NoPush) { Write-Host "Push..." -ForegroundColor Cyan; git push }
Write-Host "Selesai." -ForegroundColor Green
