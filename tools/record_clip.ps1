# ==============================================================================
# Quantum P1NG - Automated Mobile App Screen Recorder & Web Video Optimizer
# ==============================================================================
# Uses: Android SDK ADB + Local FFmpeg
# Target: Records directly from connected Android device (Pixel 10a / Samsung)
# ==============================================================================

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Name = "clip",

    [Parameter()]
    [string]$DeviceId = "",

    [Parameter()]
    [int]$MaxSeconds = 120,

    [Parameter()]
    [int]$BitrateMbps = 16,

    [Parameter()]
    [int]$TargetHeight = 1080, # 1080p mobile height for web showcases

    [Parameter()]
    [string]$OutputDir = "$PSScriptRoot\..\recordings"
)

# Locate ADB
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    $adbCmd = Get-Command adb -ErrorAction SilentlyContinue
    if ($adbCmd) { $adb = $adbCmd.Source }
    else {
        Write-Error "ADB non trovato! Assicurati che Android Studio sia installato in %LOCALAPPDATA%\Android\Sdk\platform-tools"
        exit 1
    }
}

# Locate FFmpeg
$ffmpeg = "C:\Program Files\ffmpeg\bin\ffmpeg.exe"
if (-not (Test-Path $ffmpeg)) {
    $ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($ffmpegCmd) { $ffmpeg = $ffmpegCmd.Source }
    else {
        Write-Warning "FFmpeg non trovato. I video grezzi verranno estratti ma non ottimizzati automaticamente."
        $ffmpeg = $null
    }
}

# Detect Devices
$rawDevices = & $adb devices -l | Select-String "device "
if (-not $rawDevices) {
    Write-Error "Nessun dispositivo Android rilevato! Collega il telefono via USB con Debug USB attivo."
    exit 1
}

$deviceList = @()
foreach ($line in $rawDevices) {
    $parts = ($line -split "\s+")
    if ($parts.Length -gt 0 -and $parts[0] -ne "List") {
        $deviceList += $parts[0]
    }
}

if ([string]::IsNullOrWhiteSpace($DeviceId)) {
    if ($deviceList.Contains("67081JEA313550")) {
        $DeviceId = "67081JEA313550" # Pixel 10a as default
    } else {
        $DeviceId = $deviceList[0]
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   QUANTUM P1NG // SCREEN RECORDER & OPTIMIZER" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Dispositivo selezionato: $DeviceId" -ForegroundColor Green
Write-Host "Nome clip:               $Name" -ForegroundColor White
Write-Host "Bitrate registrazione:   ${BitrateMbps} Mbps" -ForegroundColor White
Write-Host "Output cartella:         $OutputDir" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

# Ensure output directories exist
$rawDir = Join-Path $OutputDir "raw"
$optDir = Join-Path $OutputDir "optimized"
New-Item -ItemType Directory -Force -Path $rawDir | Out-Null
New-Item -ItemType Directory -Force -Path $optDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$remotePath = "/sdcard/qp1ng_rec_temp.mp4"
$localRawPath = Join-Path $rawDir "${Name}_${timestamp}_raw.mp4"

# 1. Attiva i tocchi a schermo visibili (feedback visivo)
Write-Host "`n[1/5] Attivazione feedback visivo tocchi sullo schermo..." -ForegroundColor Cyan
& $adb -s $DeviceId shell settings put system show_touches 1

# 2. Rimuovi vecchio file temporaneo se presente
& $adb -s $DeviceId shell rm -f $remotePath

# 3. Avvia registrazione in background
Write-Host "[2/5] Avvio registrazione video su Android..." -ForegroundColor Cyan
Write-Host ">>> PREMI [INVIO] IN QUALSIASI MOMENTO PER FERMARE LA REGISTRAZIONE <<<" -ForegroundColor Yellow

$bps = $BitrateMbps * 1000000
$recProcess = Start-Process -FilePath $adb -ArgumentList "-s $DeviceId shell screenrecord --bit-rate $bps --time-limit $MaxSeconds $remotePath" -PassThru

# Attendi input utente
[void][System.Console]::ReadLine()

# 4. Ferma registrazione
Write-Host "`n[3/5] Arresto registrazione..." -ForegroundColor Cyan
& $adb -s $DeviceId shell pkill -2 -f screenrecord
Start-Sleep -Seconds 2

# Ripristina tocchi a schermo
& $adb -s $DeviceId shell settings put system show_touches 0

# 5. Scarica video sul PC
Write-Host "[4/5] Download video dal telefono ($localRawPath)..." -ForegroundColor Cyan
& $adb -s $DeviceId pull $remotePath $localRawPath
& $adb -s $DeviceId shell rm -f $remotePath

if (-not (Test-Path $localRawPath)) {
    Write-Error "Errore: il file video non e stato estratto correttamente."
    exit 1
}

$rawSize = (Get-Item $localRawPath).Length / 1MB
Write-Host "Video grezzo scaricato con successo! Dimensioni: $('{0:N2}' -f $rawSize) MB" -ForegroundColor Green

# 6. Ottimizzazione automatica con FFmpeg
if ($ffmpeg) {
    Write-Host "`n[5/5] Ottimizzazione con FFmpeg per il Web..." -ForegroundColor Cyan
    
    $outMp4 = Join-Path $optDir "${Name}.mp4"
    $outWebm = Join-Path $optDir "${Name}.webm"
    $outPoster = Join-Path $optDir "${Name}_poster.webp"

    # Scale filter (mantiene aspect ratio con TargetHeight proporzionato e divisibile per 2)
    $scaleFilter = "scale=-2:$TargetHeight"

    # A) MP4 Web-Ready (H.264 High Profile, silent, CRF 22, faststart for streaming)
    Write-Host " -> Esportazione MP4 ottimizzato ($outMp4)..." -ForegroundColor Gray
    & $ffmpeg -y -i $localRawPath -an -vf "$scaleFilter" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart $outMp4 2>&1 | Out-Null

    # B) WebM Web-Ready (VP9, silent, CRF 30)
    Write-Host " -> Esportazione WebM ottimizzato ($outWebm)..." -ForegroundColor Gray
    & $ffmpeg -y -i $localRawPath -an -vf "$scaleFilter" -c:v libvpx-vp9 -b:v 0 -crf 30 -deadline good $outWebm 2>&1 | Out-Null

    # C) Poster WebP (Primo fotogramma nitido)
    Write-Host " -> Esportazione Poster WebP ($outPoster)..." -ForegroundColor Gray
    & $ffmpeg -y -ss 00:00:00.500 -i $localRawPath -vframes 1 -vf "$scaleFilter" -c:v libwebp -quality 85 $outPoster 2>&1 | Out-Null

    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "COMPLETATO CON SUCCESSO!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    
    if (Test-Path $outMp4) {
        $mp4Size = (Get-Item $outMp4).Length / 1KB
        Write-Host "  MP4 Web:    $outMp4 ($('{0:N1}' -f $mp4Size) KB)" -ForegroundColor White
    }
    if (Test-Path $outWebm) {
        $webmSize = (Get-Item $outWebm).Length / 1KB
        Write-Host "  WebM Web:   $outWebm ($('{0:N1}' -f $webmSize) KB)" -ForegroundColor White
    }
    if (Test-Path $outPoster) {
        $pSize = (Get-Item $outPoster).Length / 1KB
        Write-Host "  Poster:     $outPoster ($('{0:N1}' -f $pSize) KB)" -ForegroundColor White
    }
} else {
    Write-Host "`nFile salvato in: $localRawPath" -ForegroundColor Green
}
