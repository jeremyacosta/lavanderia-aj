Add-Type -AssemblyName System.Drawing

function Build-Glossy-AJ-Icon {
    param (
        [int]$Size,
        [string]$OutputPath
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $scale = [float]($Size / 512.0)

    # 1. Background Gradient (Deep Royal Blue into Midnight Polished Sapphire)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.ColorTranslator]::FromHtml("#0284C7"),
        [System.Drawing.ColorTranslator]::FromHtml("#020B18"),
        [float]55.0
    )
    $g.FillRectangle($bgBrush, $rect)
    $bgBrush.Dispose()

    # Center coordinates
    $cx = [float](256.0 * $scale)
    $cy = [float](225.0 * $scale)

    # 2. Ambient Backlight Glow behind drum
    $glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $glowRadius = [float](215.0 * $scale)
    $glowPath.AddEllipse([float]($cx - $glowRadius), [float]($cy - $glowRadius), [float]($glowRadius * 2.0), [float]($glowRadius * 2.0))
    $glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
    $glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(130, 56, 189, 248) # bright cyan glow
    $glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 2, 132, 199))
    $g.FillPath($glowBrush, $glowPath)
    $glowBrush.Dispose()
    $glowPath.Dispose()

    # 3. Outer Polished Chrome Bevel Ring (Washing Machine Door)
    $drumRadius = [float](196.0 * $scale)
    $drumRect = New-Object System.Drawing.RectangleF([float]($cx - $drumRadius), [float]($cy - $drumRadius), [float]($drumRadius * 2.0), [float]($drumRadius * 2.0))
    $chromeBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $drumRect,
        [System.Drawing.ColorTranslator]::FromHtml("#F0F9FF"),
        [System.Drawing.ColorTranslator]::FromHtml("#0369A1"),
        [float]45.0
    )
    $rimBlend = New-Object System.Drawing.Drawing2D.ColorBlend(5)
    $rimBlend.Colors = @(
        [System.Drawing.ColorTranslator]::FromHtml("#E0F2FE"),
        [System.Drawing.ColorTranslator]::FromHtml("#38BDF8"),
        [System.Drawing.ColorTranslator]::FromHtml("#0284C7"),
        [System.Drawing.ColorTranslator]::FromHtml("#BAE6FD"),
        [System.Drawing.ColorTranslator]::FromHtml("#034E7B")
    )
    $rimBlend.Positions = @([float]0.0, [float]0.28, [float]0.58, [float]0.85, [float]1.0)
    $chromeBrush.InterpolationColors = $rimBlend

    $chromePen = New-Object System.Drawing.Pen($chromeBrush, [float](16.0 * $scale))
    $g.DrawEllipse($chromePen, $drumRect)
    $chromePen.Dispose()
    $chromeBrush.Dispose()

    # 4. Translucent Frosted Glass Center Disc
    $innerRadius = [float](180.0 * $scale)
    $innerRect = New-Object System.Drawing.RectangleF([float]($cx - $innerRadius), [float]($cy - $innerRadius), [float]($innerRadius * 2.0), [float]($innerRadius * 2.0))
    $glassBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $innerRect,
        [System.Drawing.Color]::FromArgb(90, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(190, 2, 70, 120),
        [float]90.0
    )
    $g.FillEllipse($glassBrush, $innerRect)
    $glassBrush.Dispose()

    # Electric cyan accent ring
    $neonPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#7DD3FC"), [float](2.5 * $scale))
    $g.DrawEllipse($neonPen, $innerRect)
    $neonPen.Dispose()

    # 5. Glossy Specular Glass Reflection (Upper Curved Glare)
    $sheenBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $innerRect,
        [System.Drawing.Color]::FromArgb(170, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
        [float]90.0
    )
    $sheenPoints = @(
        [System.Drawing.PointF]::new([float](100.0 * $scale), [float](185.0 * $scale)),
        [System.Drawing.PointF]::new([float](175.0 * $scale), [float](80.0 * $scale)),
        [System.Drawing.PointF]::new([float](337.0 * $scale), [float](80.0 * $scale)),
        [System.Drawing.PointF]::new([float](412.0 * $scale), [float](185.0 * $scale)),
        [System.Drawing.PointF]::new([float](338.0 * $scale), [float](150.0 * $scale)),
        [System.Drawing.PointF]::new([float](256.0 * $scale), [float](140.0 * $scale)),
        [System.Drawing.PointF]::new([float](174.0 * $scale), [float](150.0 * $scale))
    )
    $g.FillClosedCurve($sheenBrush, $sheenPoints)
    $sheenBrush.Dispose()

    # 6. Crystal Clean Water Swirl (Bottom of Drum)
    $waveBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(110, 56, 189, 248))
    $wavePoints = @(
        [System.Drawing.PointF]::new([float](95.0 * $scale), [float](275.0 * $scale)),
        [System.Drawing.PointF]::new([float](170.0 * $scale), [float](345.0 * $scale)),
        [System.Drawing.PointF]::new([float](342.0 * $scale), [float](350.0 * $scale)),
        [System.Drawing.PointF]::new([float](417.0 * $scale), [float](275.0 * $scale)),
        [System.Drawing.PointF]::new([float](350.0 * $scale), [float](320.0 * $scale)),
        [System.Drawing.PointF]::new([float](256.0 * $scale), [float](335.0 * $scale)),
        [System.Drawing.PointF]::new([float](162.0 * $scale), [float](310.0 * $scale))
    )
    $g.FillClosedCurve($waveBrush, $wavePoints)
    $waveBrush.Dispose()

    # 7. Translucent Floating Soap Bubbles with 3D Gloss
    function Draw-Bubble {
        param([float]$bx, [float]$by, [float]$br)
        $bRect = New-Object System.Drawing.RectangleF([float]($bx - $br), [float]($by - $br), [float]($br * 2.0), [float]($br * 2.0))
        $bBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            $bRect,
            [System.Drawing.Color]::FromArgb(210, 255, 255, 255),
            [System.Drawing.Color]::FromArgb(75, 56, 189, 248),
            [float]45.0
        )
        $g.FillEllipse($bBrush, $bRect)
        $bBrush.Dispose()

        $bBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 255, 255, 255), [float](1.5 * $scale))
        $g.DrawEllipse($bBorder, $bRect)
        $bBorder.Dispose()

        # Specular dot reflection
        $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 255, 255, 255))
        $g.FillEllipse($dotBrush, [float]($bx - ($br * 0.45)), [float]($by - ($br * 0.45)), [float]($br * 0.42), [float]($br * 0.38))
        $dotBrush.Dispose()
    }

    Draw-Bubble -bx (105.0 * $scale) -by (155.0 * $scale) -br (22.0 * $scale)
    Draw-Bubble -bx (405.0 * $scale) -by (165.0 * $scale) -br (28.0 * $scale)
    Draw-Bubble -bx (370.0 * $scale) -by (110.0 * $scale) -br (16.0 * $scale)
    Draw-Bubble -bx (125.0 * $scale) -by (335.0 * $scale) -br (18.0 * $scale)
    Draw-Bubble -bx (390.0 * $scale) -by (325.0 * $scale) -br (20.0 * $scale)

    # 8. GRANDES LETRAS "AJ" BRiLLANTES Y REFLECTIVAS
    # Try ultra-bold font "Arial Black" or fallback to bold GenericSansSerif
    $fontFamily = $null
    try {
        $fontFamily = New-Object System.Drawing.FontFamily("Arial Black")
    } catch {
        $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    }
    
    $fontSize = [float](192.0 * $scale)
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

    $textY = [float](205.0 * $scale)

    # Layer A: 3D Deep Drop Shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 1, 8, 20))
    $g.DrawString("AJ", $font, $shadowBrush, [float]($cx + (6.0 * $scale)), [float]($textY + (10.0 * $scale)), $stringFormat)
    $shadowBrush.Dispose()

    # Layer B: Extrusion Bevel (Rich Royal Cyan edge)
    $bevelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#0284C7"))
    $g.DrawString("AJ", $font, $bevelBrush, [float]($cx + (3.0 * $scale)), [float]($textY + (5.0 * $scale)), $stringFormat)
    $bevelBrush.Dispose()

    # Layer C: Polished Crystal Gradient (Pure Diamond White -> Ice Blue -> Cyan -> Deep Blue)
    $textRect = New-Object System.Drawing.RectangleF([float]($cx - (165.0 * $scale)), [float]($textY - (115.0 * $scale)), [float](330.0 * $scale), [float](230.0 * $scale))
    $textGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $textRect,
        [System.Drawing.Color]::White,
        [System.Drawing.ColorTranslator]::FromHtml("#0284C7"),
        [float]90.0
    )
    $cb = New-Object System.Drawing.Drawing2D.ColorBlend(5)
    $cb.Colors = @(
        [System.Drawing.Color]::White,
        [System.Drawing.ColorTranslator]::FromHtml("#F0F9FF"),
        [System.Drawing.ColorTranslator]::FromHtml("#BAE6FD"),
        [System.Drawing.ColorTranslator]::FromHtml("#38BDF8"),
        [System.Drawing.ColorTranslator]::FromHtml("#0369A1")
    )
    $cb.Positions = @([float]0.0, [float]0.22, [float]0.52, [float]0.8, [float]1.0)
    $textGrad.InterpolationColors = $cb

    $g.DrawString("AJ", $font, $textGrad, $cx, $textY, $stringFormat)
    $textGrad.Dispose()

    # Layer D: Specular Gloss Stroke Around Letters (Glass Bevel Cut)
    $outlinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 255, 255), [float](3.2 * $scale))
    $letterPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $letterPath.AddString("AJ", $fontFamily, [int][System.Drawing.FontStyle]::Bold, $fontSize, [System.Drawing.PointF]::new($cx, $textY), $stringFormat)
    $g.DrawPath($outlinePen, $letterPath)
    $outlinePen.Dispose()

    # Layer E: Curved Specular Glass Highlight across top of "AJ"
    $highlightRegion = New-Object System.Drawing.Region($letterPath)
    $glarePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $glareRect = New-Object System.Drawing.RectangleF([float]($cx - (165.0 * $scale)), [float]($textY - (115.0 * $scale)), [float](330.0 * $scale), [float](95.0 * $scale))
    $glarePath.AddEllipse($glareRect)
    $highlightRegion.Intersect($glarePath)
    $glareBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 255, 255, 255))
    $g.FillRegion($glareBrush, $highlightRegion)
    $glareBrush.Dispose()
    $glarePath.Dispose()
    $highlightRegion.Dispose()
    $letterPath.Dispose()
    $font.Dispose()

    # 9. CÁPSULA PULIDA TRANSLÚCIDA CON "LAVANDERIA" GRANDE
    function Get-RoundedRectanglePath {
        param([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = [float]($radius * 2.0)
        $path.AddArc($x, $y, $d, $d, 180, 90)
        $path.AddArc([float]($x + $width - $d), $y, $d, $d, 270, 90)
        $path.AddArc([float]($x + $width - $d), [float]($y + $height - $d), $d, $d, 0, 90)
        $path.AddArc($x, [float]($y + $height - $d), $d, $d, 90, 90)
        $path.CloseFigure()
        return $path
    }

    $pillWidth = [float](420.0 * $scale)
    $pillHeight = [float](72.0 * $scale)
    $pillRadius = [float]($pillHeight / 2.0)
    $pillX = [float]($cx - ($pillWidth / 2.0))
    $pillY = [float](322.0 * $scale)

    $pillPath = Get-RoundedRectanglePath -x $pillX -y $pillY -width $pillWidth -height $pillHeight -radius $pillRadius

    # Pill 3D Drop Shadow
    $pillShadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 1, 10, 25))
    $shadowX = [float]($pillX + (3.0 * $scale))
    $shadowY = [float]($pillY + (6.0 * $scale))
    $shadowPath = Get-RoundedRectanglePath -x $shadowX -y $shadowY -width $pillWidth -height $pillHeight -radius $pillRadius
    $g.FillPath($pillShadow, $shadowPath)
    $shadowPath.Dispose()
    $pillShadow.Dispose()

    # Pill Translucent Glass Body (Royal Navy to Deep Sapphire)
    $pillRect = New-Object System.Drawing.RectangleF($pillX, $pillY, $pillWidth, $pillHeight)
    $pillBgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $pillRect,
        [System.Drawing.Color]::FromArgb(240, 2, 132, 199),
        [System.Drawing.Color]::FromArgb(255, 3, 26, 56),
        [float]90.0
    )
    $g.FillPath($pillBgBrush, $pillPath)
    $pillBgBrush.Dispose()

    # Specular upper glass sheen on capsule (top half)
    $capsuleGlarePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = [float]($pillRadius * 2.0)
    $capsuleGlarePath.AddArc($pillX, $pillY, $d, $d, 180, 90)
    $capsuleGlarePath.AddArc([float]($pillX + $pillWidth - $d), $pillY, $d, $d, 270, 90)
    $capsuleGlarePath.AddLine([float]($pillX + $pillWidth), [float]($pillY + ($pillHeight * 0.48)), $pillX, [float]($pillY + ($pillHeight * 0.48)))
    $capsuleGlarePath.CloseFigure()
    $pillGlareBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $pillRect,
        [System.Drawing.Color]::FromArgb(130, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(20, 255, 255, 255),
        [float]90.0
    )
    $g.FillPath($pillGlareBrush, $capsuleGlarePath)
    $pillGlareBrush.Dispose()
    $capsuleGlarePath.Dispose()

    # Polished Chrome & Neon Border for Pill
    $pillBorderBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $pillRect,
        [System.Drawing.ColorTranslator]::FromHtml("#E0F2FE"),
        [System.Drawing.ColorTranslator]::FromHtml("#38BDF8"),
        [float]45.0
    )
    $pillBorderPen = New-Object System.Drawing.Pen($pillBorderBrush, [float](3.2 * $scale))
    $g.DrawPath($pillBorderPen, $pillPath)
    $pillBorderPen.Dispose()
    $pillBorderBrush.Dispose()
    $pillPath.Dispose()

    # LARGE BOLD "L A V A N D E R I A" TEXT (HIGH-CONTRAST, CRISP, POLISHED)
    $pillFontSize = [float](27.0 * $scale)
    $pillFont = New-Object System.Drawing.Font($fontFamily, $pillFontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    
    $pillText = "L A V A N D E R I A"
    $pillTextShadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 1, 8, 20))
    $g.DrawString($pillText, $pillFont, $pillTextShadow, [float]($cx + (1.5 * $scale)), [float]($pillY + ($pillHeight / 2.0) + (2.5 * $scale)), $stringFormat)
    $pillTextShadow.Dispose()

    $pillTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString($pillText, $pillFont, $pillTextBrush, $cx, [float]($pillY + ($pillHeight / 2.0)), $stringFormat)
    $pillTextBrush.Dispose()
    $pillFont.Dispose()

    # 10. SPARKLING DIAMOND STARS (Destellos reflectivos pulidos)
    function Draw-DiamondStar {
        param([float]$sx, [float]$sy, [float]$sr, [System.Drawing.Color]$color)
        $sBrush = New-Object System.Drawing.SolidBrush($color)
        $starPts = @(
            [System.Drawing.PointF]::new($sx, [float]($sy - $sr)),
            [System.Drawing.PointF]::new([float]($sx + ($sr * 0.22)), [float]($sy - ($sr * 0.22))),
            [System.Drawing.PointF]::new([float]($sx + $sr), $sy),
            [System.Drawing.PointF]::new([float]($sx + ($sr * 0.22)), [float]($sy + ($sr * 0.22))),
            [System.Drawing.PointF]::new($sx, [float]($sy + $sr)),
            [System.Drawing.PointF]::new([float]($sx - ($sr * 0.22)), [float]($sy + ($sr * 0.22))),
            [System.Drawing.PointF]::new([float]($sx - $sr), $sy),
            [System.Drawing.PointF]::new([float]($sx - ($sr * 0.22)), [float]($sy - ($sr * 0.22)))
        )
        $g.FillPolygon($sBrush, $starPts)
        $sBrush.Dispose()

        # Core center highlight
        $coreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $g.FillEllipse($coreBrush, [float]($sx - ($sr * 0.2)), [float]($sy - ($sr * 0.2)), [float]($sr * 0.4), [float]($sr * 0.4))
        $coreBrush.Dispose()
    }

    # Top-right intense golden/white star
    Draw-DiamondStar -sx (395.0 * $scale) -sy (105.0 * $scale) -sr (24.0 * $scale) -color ([System.Drawing.ColorTranslator]::FromHtml("#FDE047"))
    
    # "A" top peak diamond sparkle
    Draw-DiamondStar -sx (172.0 * $scale) -sy (118.0 * $scale) -sr (16.0 * $scale) -color ([System.Drawing.Color]::FromArgb(250, 255, 255, 255))

    # "J" right curve sparkle
    Draw-DiamondStar -sx (348.0 * $scale) -sy (248.0 * $scale) -sr (14.0 * $scale) -color ([System.Drawing.ColorTranslator]::FromHtml("#7DD3FC"))

    # Bottom left accent star
    Draw-DiamondStar -sx (95.0 * $scale) -sy (375.0 * $scale) -sr (13.0 * $scale) -color ([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"))

    $g.Dispose()
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Successfully generated: $OutputPath ($Size x $Size)"
}

Build-Glossy-AJ-Icon -Size 512 -OutputPath "public\pwa-icon-512.png"
Build-Glossy-AJ-Icon -Size 192 -OutputPath "public\pwa-icon-192.png"
Build-Glossy-AJ-Icon -Size 512 -OutputPath "public\pwa-icon-maskable-512.png"
Build-Glossy-AJ-Icon -Size 192 -OutputPath "public\pwa-icon-maskable-192.png"
Build-Glossy-AJ-Icon -Size 180 -OutputPath "public\apple-touch-icon.png"
