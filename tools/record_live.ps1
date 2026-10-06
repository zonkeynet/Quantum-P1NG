# ==============================================================================
# QUANTUM P1NG // LIVE SCREEN RECORDER & WEB OPTIMIZER STUDIO
# ==============================================================================
# Features:
#   1. Mirrors Pixel 10a screen in a live 60fps window on your PC
#   2. Shows visual touch points on screen (--show-touches)
#   3. Records directly to PC at high bitrate (16 Mbps)
#   4. When you close the live window, automatically runs FFmpeg:
#      -> Generates Web-Ready MP4 (H.264, silent, faststart)
#      -> Generates Ultra-Compressed WebM (VP9, silent)
#      -> Generates HD Poster WebP for video placeholders
# ==============================================================================

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Name = "",

    [Parameter()]
    [string]$DeviceId = "67081JEA313550", # Pixel 10a default

    [Parameter()]
    [int]$TargetHeight = 1080, # 1080p mobile height

    [Parameter()]
    [string]$OutputDir = "$PSScriptRoot\..\recordings"
)

# 1. Trova scrcpy
$scrcpy = "$PSScriptRoot\scrcpy-win64-v5.0\scrcpy.exe"
if (-not (Test-Path $scrcpy)) {
    $scrcpyCmd = Get-Command scrcpy -ErrorAction SilentlyContinue
    if ($scrcpyCmd) { $scrcpy = $scrcpyCmd.Source }
    else {
        Write-Error "scrcpy non trovato in $scrcpy!"
        exit 1
    }
}

# 2. Trova FFmpeg
$ffmpeg = "C:\Program Files\ffmpeg\bin\ffmpeg.exe"
if (-not (Test-Path $ffmpeg)) {
    $ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($ffmpegCmd) { $ffmpeg = $ffmpegCmd.Source }
    else {
        Write-Warning "FFmpeg non trovato in PATH. Verrà salvato solo il file grezzo."
        $ffmpeg = $null
    }
}

# 3. Richiedi nome clip se non fornito
if ([string]::IsNullOrWhiteSpace($Name)) {
    $defaultName = "clip_" + (Get-Date -Format "yyyyMMdd_HHmmss")
    Write-Host "`n>>> Inserisci il nome della feature o scena (es. btc_vault, qgeo, actionforge, chat)" -ForegroundColor Cyan
    $inputName = Read-Host "Nome clip [Default: $defaultName]"
    if ([string]::IsNullOrWhiteSpace($inputName)) {
        $Name = $defaultName
    } else {
        $Name = $inputName.Trim() -replace "[^a-zA-Z0-9_\-]", "_"
    }
}

# Cartelle output
$rawDir = Join-Path $OutputDir "raw"
$optDir = Join-Path $OutputDir "optimized"
New-Item -ItemType Directory -Force -Path $rawDir | Out-Null
New-Item -ItemType Directory -Force -Path $optDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$rawVideo = Join-Path $rawDir "${Name}_${timestamp}_raw.mp4"

Clear-Host
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "        QUANTUM P1NG // LIVE RECORDER STUDIO                    " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " Dispositivo:    Pixel 10a ($DeviceId)" -ForegroundColor Green
Write-Host " Nome Scena:     $Name" -ForegroundColor White
Write-Host " Finestra PC:    Attiva a 60fps con feedback tocchi" -ForegroundColor White
Write-Host " File Grezzo:    $rawVideo" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "`nISTRUZIONI:" -ForegroundColor Yellow
Write-Host " 1. Si aprirà una finestra sul monitor con lo schermo del Pixel 10a." -ForegroundColor White
Write-Host " 2. Puoi toccare lo schermo del telefono o usare il mouse sul PC." -ForegroundColor White
Write-Host " 3. Quando hai completato la scena, CHIUDI LA FINESTRA sul PC." -ForegroundColor Yellow
Write-Host " 4. L'ottimizzazione FFmpeg (MP4, WebM, WebP) partirà in automatico!`n" -ForegroundColor White

Write-Host "Avvio in corso..." -ForegroundColor Cyan

# Avvia scrcpy con mirroring + registrazione + show touches
$scrcpyArgs = @(
    "-s", $DeviceId,
    "--window-title=QP1NG LIVE STUDIO // $Name",
    "--show-touches",
    "--video-bit-rate=16M",
    "--max-fps=60",
    "--record=$rawVideo"
)

$proc = Start-Process -FilePath $scrcpy -ArgumentList $scrcpyArgs -PassThru -Wait

Write-Host "`n[✓] Sessione live terminata. Finalizzazione video..." -ForegroundColor Green

if (-not (Test-Path $rawVideo)) {
    Write-Warning "Nessun video registrato o registrazione annullata."
    exit 0
}

$rawSize = (Get-Item $rawVideo).Length / 1MB
Write-Host "Video grezzo registrato: $('{0:N2}' -f $rawSize) MB" -ForegroundColor Green

# Ottimizzazione automatica con FFmpeg
if ($ffmpeg) {
    Write-Host "`n=================================================================" -ForegroundColor Cyan
    Write-Host "        OTTIMIZZAZIONE FFMPEG IN CORSO...                       " -ForegroundColor Yellow
    Write-Host "=================================================================" -ForegroundColor Cyan

    $outMp4 = Join-Path $optDir "${Name}.mp4"
    $outWebm = Join-Path $optDir "${Name}.webm"
    $outPoster = Join-Path $optDir "${Name}_poster.webp"
    $scaleFilter = "scale=-2:$TargetHeight"

    Write-Host "[1/3] Generazione MP4 Web-Ready..." -ForegroundColor Cyan
    & $ffmpeg -y -i $rawVideo -an -vf "$scaleFilter" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart $outMp4 2>&1 | Out-Null

    Write-Host "[2/3] Generazione WebM ad alta compressione..." -ForegroundColor Cyan
    & $ffmpeg -y -i $rawVideo -an -vf "$scaleFilter" -c:v libvpx-vp9 -b:v 0 -crf 30 -deadline good $outWebm 2>&1 | Out-Null

    Write-Host "[3/3] Generazione Poster WebP ad alta risoluzione..." -ForegroundColor Cyan
    & $ffmpeg -y -ss 00:00:00.600 -i $rawVideo -vframes 1 -vf "$scaleFilter" -c:v libwebp -quality 85 $outPoster 2>&1 | Out-Null

    Write-Host "`n=================================================================" -ForegroundColor Green
    Write-Host "      TUTTI I FORMATI SONO STATI GENERATI CON SUCCESSO!         " -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
    
    if (Test-Path $outMp4) {
        $mp4Size = (Get-Item $outMp4).Length / 1KB
        Write-Host " -> MP4:    $outMp4 ($('{0:N1}' -f $mp4Size) KB)" -ForegroundColor White
    }
    if (Test-Path $outWebm) {
        $webmSize = (Get-Item $outWebm).Length / 1KB
        Write-Host " -> WebM:   $outWebm ($('{0:N1}' -f $webmSize) KB)" -ForegroundColor White
    }
    if (Test-Path $outPoster) {
        $pSize = (Get-Item $outPoster).Length / 1KB
        Write-Host " -> Poster: $outPoster ($('{0:N1}' -f $pSize) KB)" -ForegroundColor White
    }

    # Apri la cartella di output in Explorer per l'utente
    Start-Process "explorer.exe" -ArgumentList $optDir
}
