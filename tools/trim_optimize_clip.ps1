# ==============================================================================
# Quantum P1NG - Video Scene Trimmer & Web Optimizer
# ==============================================================================
# Usage:
#   .\tools\trim_optimize_clip.ps1 -InputVideo "recordings\raw\my_rec.mp4" -Start "00:05" -End "00:18" -Name "qgeo_demo"
# ==============================================================================

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$InputVideo,

    [Parameter(Mandatory = $true)]
    [string]$Start, # es. "00:04" o "4.5"

    [Parameter(Mandatory = $true)]
    [string]$End,   # es. "00:16" o "16"

    [Parameter(Mandatory = $true)]
    [string]$Name,  # es. "qgeo_map"

    [Parameter()]
    [int]$TargetHeight = 1080,

    [Parameter()]
    [string]$OutputDir = "$PSScriptRoot\..\recordings\optimized"
)

$ffmpeg = "C:\Program Files\ffmpeg\bin\ffmpeg.exe"
if (-not (Test-Path $ffmpeg)) {
    $ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($ffmpegCmd) { $ffmpeg = $ffmpegCmd.Source }
    else {
        Write-Error "FFmpeg non trovato in PATH!"
        exit 1
    }
}

if (-not (Test-Path $InputVideo)) {
    Write-Error "File video in input non trovato: $InputVideo"
    exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$outMp4 = Join-Path $OutputDir "${Name}.mp4"
$outWebm = Join-Path $OutputDir "${Name}.webm"
$outPoster = Join-Path $OutputDir "${Name}_poster.webp"

$scaleFilter = "scale=-2:$TargetHeight"

Write-Host "Taglio ed esportazione scena '$Name' da $Start a $End..." -ForegroundColor Cyan

# 1. MP4
& $ffmpeg -y -ss $Start -to $End -i $InputVideo -an -vf "$scaleFilter" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart $outMp4 2>&1 | Out-Null

# 2. WebM
& $ffmpeg -y -ss $Start -to $End -i $InputVideo -an -vf "$scaleFilter" -c:v libvpx-vp9 -b:v 0 -crf 30 -deadline good $outWebm 2>&1 | Out-Null

# 3. Poster WebP
& $ffmpeg -y -ss $Start -i $InputVideo -vframes 1 -vf "$scaleFilter" -c:v libwebp -quality 85 $outPoster 2>&1 | Out-Null

Write-Host "Scena creata con successo in $OutputDir!" -ForegroundColor Green
Get-ChildItem -Path $OutputDir -Filter "${Name}*" | Select-Object Name, Length
