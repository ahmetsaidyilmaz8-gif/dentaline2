Add-Type -AssemblyName System.Drawing

$outDir = "c:\Users\User\Desktop\dentaline2\public\teeth"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }

$userDir = "C:\Users\User\.gemini\antigravity-ide\brain\453d0080-7181-4496-9015-96201ae40a18\.user_uploaded"

$atlasFiles = @{
    "saglikli" = Join-Path $userDir "media_1791577995475.jpg"
    "kanal"    = Join-Path $userDir "media_1791577995492.jpg"
    "dolgu"    = Join-Path $userDir "media_1791577995501.jpg"
    "kaplama"  = Join-Path $userDir "media_1791577995436.jpg"
}

$implantFile = Join-Path $userDir "media_1791577986684.png"

# Valleys determined from morphological gradient analysis for 1024x558 atlas
# Row 1 (Top: 18..11, 21..28):
$r1_teeth = @(18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28)
$r1_bounds = @(
    @{ X1 = 37;  X2 = 100 },  # 18
    @{ X1 = 100; X2 = 155 },  # 17
    @{ X1 = 155; X2 = 215 },  # 16
    @{ X1 = 215; X2 = 253 },  # 15
    @{ X1 = 253; X2 = 289 },  # 14
    @{ X1 = 289; X2 = 327 },  # 13
    @{ X1 = 327; X2 = 359 },  # 12
    @{ X1 = 359; X2 = 399 },  # 11
    @{ X1 = 399; X2 = 446 },  # 21
    @{ X1 = 446; X2 = 478 },  # 22
    @{ X1 = 478; X2 = 515 },  # 23
    @{ X1 = 515; X2 = 552 },  # 24
    @{ X1 = 552; X2 = 593 },  # 25
    @{ X1 = 593; X2 = 654 },  # 26
    @{ X1 = 654; X2 = 710 },  # 27
    @{ X1 = 710; X2 = 774 }   # 28
)
$r1_Y1 = 138; $r1_Y2 = 296

# Row 2 (Bottom: 48..41, 31..38):
$r2_teeth = @(48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38)
$r2_bounds = @(
    @{ X1 = 37;  X2 = 95 },   # 48
    @{ X1 = 95;  X2 = 155 },  # 47
    @{ X1 = 155; X2 = 225 },  # 46
    @{ X1 = 225; X2 = 264 },  # 45
    @{ X1 = 264; X2 = 295 },  # 44
    @{ X1 = 295; X2 = 335 },  # 43
    @{ X1 = 335; X2 = 368 },  # 42
    @{ X1 = 368; X2 = 399 },  # 41
    @{ X1 = 399; X2 = 436 },  # 31
    @{ X1 = 436; X2 = 470 },  # 32
    @{ X1 = 470; X2 = 515 },  # 33
    @{ X1 = 515; X2 = 551 },  # 34
    @{ X1 = 551; X2 = 593 },  # 35
    @{ X1 = 593; X2 = 660 },  # 36
    @{ X1 = 660; X2 = 720 },  # 37
    @{ X1 = 720; X2 = 776 }   # 38
)
$r2_Y1 = 330; $r2_Y2 = 492

function MakeTransparentAndSave([System.Drawing.Bitmap]$sourceBmp, [int]$x1, [int]$y1, [int]$x2, [int]$y2, [string]$destPath) {
    $w = [Math]::Max(1, $x2 - $x1)
    $h = [Math]::Max(1, $y2 - $y1)
    
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($y = 0; $y -lt $h; $y++) {
        $sy = $y1 + $y
        if ($sy -lt 0 -or $sy -ge $sourceBmp.Height) { continue }
        for ($x = 0; $x -lt $w; $x++) {
            $sx = $x1 + $x
            if ($sx -lt 0 -or $sx -ge $sourceBmp.Width) { continue }
            
            $p = $sourceBmp.GetPixel($sx, $sy)
            # Background detection: Cyan/Mint background has (B - R >= 8) and (G - R >= 6)
            $diffB = $p.B - $p.R
            $diffG = $p.G - $p.R
            
            if ($diffB -ge 9 -and $diffG -ge 7) {
                # Completely transparent background
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($diffB -ge 4 -and $diffG -ge 3) {
                # Feathered edge transition
                $alpha = [int]((8.0 - $diffB) / 5.0 * 255.0)
                $alpha = [Math]::Max(0, [Math]::Min(255, $alpha))
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
            } else {
                # Tooth structure
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
            }
        }
    }
    
    $outBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
}

Write-Host "Extracting 4 Atlas sets (saglikli, kanal, dolgu, kaplama)..."
foreach ($key in $atlasFiles.Keys) {
    $path = $atlasFiles[$key]
    Write-Host "Processing Atlas: $key ($path)..."
    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    
    # Process Row 1
    for ($i = 0; $i -lt $r1_teeth.Length; $i++) {
        $toothNum = $r1_teeth[$i]
        $b = $r1_bounds[$i]
        $dest = Join-Path $outDir "${toothNum}_${key}.png"
        MakeTransparentAndSave $bmp $b.X1 $r1_Y1 $b.X2 $r1_Y2 $dest
    }
    
    # Process Row 2
    for ($i = 0; $i -lt $r2_teeth.Length; $i++) {
        $toothNum = $r2_teeth[$i]
        $b = $r2_bounds[$i]
        $dest = Join-Path $outDir "${toothNum}_${key}.png"
        MakeTransparentAndSave $bmp $b.X1 $r2_Y1 $b.X2 $r2_Y2 $dest
    }
    
    $bmp.Dispose()
}

# Now process Implants from media_1791577986684.png (560x229)
Write-Host "Processing Implants..."
$impBmp = [System.Drawing.Bitmap]::FromFile($implantFile)

# Implant Top Row: 18..28 (16 teeth) - Y from 2 to 95
$imp_w1 = (535 - 35) / 16.0
for ($i = 0; $i -lt $r1_teeth.Length; $i++) {
    $toothNum = $r1_teeth[$i]
    $x1 = [int](35 + ($i * $imp_w1))
    $x2 = [int](35 + (($i + 1) * $imp_w1))
    $dest = Join-Path $outDir "${toothNum}_implant.png"
    MakeTransparentAndSave $impBmp $x1 2 $x2 95 $dest
}

# Implant Bottom Row: 48..38 (16 teeth) - Y from 135 to 226
$imp_w2 = (535 - 35) / 16.0
for ($i = 0; $i -lt $r2_teeth.Length; $i++) {
    $toothNum = $r2_teeth[$i]
    $x1 = [int](35 + ($i * $imp_w2))
    $x2 = [int](35 + (($i + 1) * $imp_w2))
    $dest = Join-Path $outDir "${toothNum}_implant.png"
    MakeTransparentAndSave $impBmp $x1 135 $x2 226 $dest
}
$impBmp.Dispose()

Write-Host "ALL TEETH PROCESSED AND SAVED SUCCESSFULLY!"
