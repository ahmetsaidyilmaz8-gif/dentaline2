$csharpSource = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public class MasterToothExtractor
{
    // Row 1 valley splits for 1024x558 atlas (16 teeth: 18..11, 21..28)
    public static readonly int[] R1_SPLITS = new int[] {
        48,  // 18 start
        103, // 18/17 split
        156, // 17/16 split
        215, // 16/15 split
        253, // 15/14 split
        289, // 14/13 split
        327, // 13/12 split
        359, // 12/11 split
        400, // 11/21 split
        446, // 21/22 split
        479, // 22/23 split
        515, // 23/24 split
        553, // 24/25 split
        594, // 25/26 split
        655, // 26/27 split
        710, // 27/28 split
        766  // 28 end
    };
    public static readonly int[] R1_TEETH = new int[] { 18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28 };

    // Row 2 valley splits for 1024x558 atlas (16 teeth: 48..41, 31..38)
    public static readonly int[] R2_SPLITS = new int[] {
        44,  // 48 start
        101, // 48/47 split
        162, // 47/46 split
        225, // 46/45 split
        265, // 45/44 split
        301, // 44/43 split
        337, // 43/42 split
        369, // 42/41 split
        401, // 41/31 split
        437, // 31/32 split
        471, // 32/33 split
        512, // 33/34 split
        551, // 34/35 split
        593, // 35/36 split
        655, // 36/37 split
        714, // 37/38 split
        770  // 38 end
    };
    public static readonly int[] R2_TEETH = new int[] { 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38 };

    // Implant Top Row (560x229) splits for 16 teeth (18..11, 21..28)
    // Note: standalone abutment between X=311 and X=332 is excluded
    public static readonly int[] IMP_TOP_X1 = new int[] {
        37, 75, 113, 151, 177, 203, 229, 252, // 18..11
        283, 333, 358, 384, 412, 453, 489, 37  // 21..28 (28 can reuse 18 flipped or 27)
    };
    public static readonly int[] IMP_TOP_X2 = new int[] {
        74, 112, 150, 176, 202, 228, 251, 280, // 18..11
        310, 356, 383, 411, 452, 488, 526, 74  // 21..28
    };

    // Implant Bottom Row (560x229) splits
    public static readonly int[] IMP_BOT_SPLITS = new int[] {
        38,  // 48 start
        74,  // 48/47
        115, // 47/46
        157, // 46/45
        184, // 45/44
        210, // 44/43
        234, // 43/42
        256, // 42/41
        280, // 41/31
        303, // 31/32
        327, // 32/33
        355, // 33/34
        383, // 34/35
        411, // 35/36
        452, // 36/37
        492, // 37/38
        530  // 38 end
    };

    public static void ProcessAtlas(string atlasPath, string statusKey, string outDir)
    {
        using (Bitmap src = new Bitmap(atlasPath))
        {
            int w = src.Width;
            int h = src.Height;
            BitmapData data = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            byte[] pixels = new byte[data.Stride * h];
            Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);
            src.UnlockBits(data);

            // Row 1 (Upper: Y 140..280)
            for (int i = 0; i < R1_TEETH.Length; i++)
            {
                int toothNum = R1_TEETH[i];
                int x1 = R1_SPLITS[i];
                int x2 = R1_SPLITS[i + 1];
                string outPath = Path.Combine(outDir, toothNum + "_" + statusKey + ".png");
                ExtractOneTooth(pixels, data.Stride, w, h, x1, x2, 140, 275, outPath, false);
            }

            // Row 2 (Lower: Y 330..475)
            for (int i = 0; i < R2_TEETH.Length; i++)
            {
                int toothNum = R2_TEETH[i];
                int x1 = R2_SPLITS[i];
                int x2 = R2_SPLITS[i + 1];
                string outPath = Path.Combine(outDir, toothNum + "_" + statusKey + ".png");
                ExtractOneTooth(pixels, data.Stride, w, h, x1, x2, 330, 475, outPath, false);
            }
        }
        Console.WriteLine("Completed Atlas: " + statusKey);
    }

    public static void ProcessImplants(string impPath, string outDir)
    {
        using (Bitmap src = new Bitmap(impPath))
        {
            int w = src.Width;
            int h = src.Height;
            BitmapData data = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            byte[] pixels = new byte[data.Stride * h];
            Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);
            src.UnlockBits(data);

            // Upper implants: 18..28 (16 teeth)
            for (int i = 0; i < R1_TEETH.Length; i++)
            {
                int toothNum = R1_TEETH[i];
                int x1 = IMP_TOP_X1[i];
                int x2 = IMP_TOP_X2[i];
                string outPath = Path.Combine(outDir, toothNum + "_implant.png");
                ExtractOneTooth(pixels, data.Stride, w, h, x1, x2, 12, 110, outPath, true);
            }

            // Lower implants: 48..38 (16 teeth)
            for (int i = 0; i < R2_TEETH.Length; i++)
            {
                int toothNum = R2_TEETH[i];
                int x1 = IMP_BOT_SPLITS[i];
                int x2 = IMP_BOT_SPLITS[i + 1];
                string outPath = Path.Combine(outDir, toothNum + "_implant.png");
                ExtractOneTooth(pixels, data.Stride, w, h, x1, x2, 130, 226, outPath, true);
            }
        }
        Console.WriteLine("Completed Implants!");
    }

    private static void ExtractOneTooth(byte[] pixels, int stride, int srcW, int srcH, int boxX1, int boxX2, int boxY1, int boxY2, string outPath, bool isImplant)
    {
        // 1. Find bounding box of valid tooth pixels
        int minX = srcW, maxX = 0, minY = srcH, maxY = 0;
        int toothPixels = 0;

        for (int y = boxY1; y <= boxY2; y++)
        {
            if (y < 0 || y >= srcH) continue;
            for (int x = boxX1; x <= boxX2; x++)
            {
                if (x < 0 || x >= srcW) continue;
                int idx = y * stride + x * 4;
                byte b = pixels[idx];
                byte g = pixels[idx + 1];
                byte r = pixels[idx + 2];

                if (IsToothPixel(r, g, b, isImplant))
                {
                    toothPixels++;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        if (toothPixels == 0)
        {
            Console.WriteLine("Warning: 0 pixels for " + outPath);
            return;
        }

        // Add 1px padding
        minX = Math.Max(0, minX - 1);
        maxX = Math.Min(srcW - 1, maxX + 1);
        minY = Math.Max(0, minY - 1);
        maxY = Math.Min(srcH - 1, maxY + 1);

        int outW = maxX - minX + 1;
        int outH = maxY - minY + 1;

        using (Bitmap outBmp = new Bitmap(outW, outH, PixelFormat.Format32bppArgb))
        {
            BitmapData outData = outBmp.LockBits(new Rectangle(0, 0, outW, outH), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
            byte[] outPixels = new byte[outData.Stride * outH];

            for (int y = 0; y < outH; y++)
            {
                int sy = minY + y;
                for (int x = 0; x < outW; x++)
                {
                    int sx = minX + x;
                    int sIdx = sy * stride + sx * 4;
                    int oIdx = y * outData.Stride + x * 4;

                    byte b = pixels[sIdx];
                    byte g = pixels[sIdx + 1];
                    byte r = pixels[sIdx + 2];

                    if (!IsToothPixel(r, g, b, isImplant))
                    {
                        outPixels[oIdx] = 0;
                        outPixels[oIdx + 1] = 0;
                        outPixels[oIdx + 2] = 0;
                        outPixels[oIdx + 3] = 0;
                    }
                    else
                    {
                        int diffB = b - r;
                        int diffG = g - r;
                        byte alpha = 255;

                        // Edge feathering and cyan decontamination
                        if (diffB >= 3 && diffG >= 2 && r < 218)
                        {
                            float t = (6.0f - diffB) / 4.0f;
                            alpha = (byte)Math.Max(60, Math.Min(255, (int)(t * 255)));
                            // Remove cyan tint from semi-transparent edge
                            b = (byte)Math.Min(b, r);
                            g = (byte)Math.Min(g, r);
                        }

                        outPixels[oIdx] = b;
                        outPixels[oIdx + 1] = g;
                        outPixels[oIdx + 2] = r;
                        outPixels[oIdx + 3] = alpha;
                    }
                }
            }

            Marshal.Copy(outPixels, 0, outData.Scan0, outPixels.Length);
            outBmp.UnlockBits(outData);
            outBmp.Save(outPath, ImageFormat.Png);
        }
    }

    public static bool IsToothPixel(byte r, byte g, byte b, bool isImplant)
    {
        // 1. Specular enamel highlight: R>218, G>218, B>218
        if (r > 218 && g > 218 && b > 218) return true;

        // 2. Cyan background and shadow check
        int diffB = b - r;
        int diffG = g - r;
        if (diffB >= 6 && diffG >= 5) return false;

        // 3. Drop shadow removal
        int max = Math.Max(r, Math.Max(g, b));
        int min = Math.Min(r, Math.Min(g, b));
        int spread = max - min;

        if (isImplant)
        {
            // Implant background is cyan (B-R >= 8 && G-R >= 6).
            // Titanium screw has B-R <= 4.
            if (diffB >= 7 && diffG >= 5) return false;
            return true;
        }
        else
        {
            // In tooth atlases, roots have warm spread >= 20. Low spread (< 14) and max < 185 is table shadow
            if (spread < 14 && max < 185) return false;
        }

        return true;
    }
}
"@

Add-Type -TypeDefinition $csharpSource -ReferencedAssemblies System.Drawing

$userDir = "C:\Users\User\.gemini\antigravity-ide\brain\453d0080-7181-4496-9015-96201ae40a18\.user_uploaded"
$outDir = "c:\Users\User\Desktop\dentaline2\public\teeth"

Write-Host "Starting master high-precision extraction..."
[MasterToothExtractor]::ProcessAtlas((Join-Path $userDir "media_1791577995475.jpg"), "saglikli", $outDir)
[MasterToothExtractor]::ProcessAtlas((Join-Path $userDir "media_1791577995492.jpg"), "kanal", $outDir)
[MasterToothExtractor]::ProcessAtlas((Join-Path $userDir "media_1791577995501.jpg"), "dolgu", $outDir)
[MasterToothExtractor]::ProcessAtlas((Join-Path $userDir "media_1791577995436.jpg"), "kaplama", $outDir)
[MasterToothExtractor]::ProcessImplants((Join-Path $userDir "media_1791577986684.png"), $outDir)
Write-Host "ALL 160 TEETH CUTOUTS RE-EXTRACTED WITH MASTER QUALITY!"
