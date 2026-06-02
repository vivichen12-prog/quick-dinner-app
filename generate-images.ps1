# ============================================================
# 極速食光 — 料理示意圖批次生成腳本
# 使用 Google Imagen 3 API (imagen-3.0-generate-002)
# ============================================================

param(
    [string]$ApiKey      = "AIzaSyD69VZa93sZuiPWEBqCgUe4YVepq8AAVk4",
    [string]$ProjectDir  = "C:\Users\ChPh403\.gemini\antigravity\scratch\quick-dinner-app",
    [int]   $DelayMs     = 3500,   # 每張之間的等待毫秒（避免 rate limit）
    [switch]$SkipExisting = $true  # 已存在的圖片不重新生成
)

$ErrorActionPreference = "Continue"

# ---------- 1. 準備 images/ 資料夾 ----------
$ImagesDir = Join-Path $ProjectDir "images"
if (-not (Test-Path $ImagesDir)) {
    New-Item -ItemType Directory -Path $ImagesDir -Force | Out-Null
    Write-Host "Created: $ImagesDir" -ForegroundColor Cyan
}

# ---------- 2. 解析 app.js 取得食譜清單 ----------
$AppJs = Get-Content (Join-Path $ProjectDir "app.js") -Raw -Encoding UTF8

# 將文件依 id: "rec-" 切分成食譜區塊
$blocks = [regex]::Split($AppJs, '(?=\bid:\s*"rec-)')
$blocks = $blocks | Where-Object { $_ -match '\bid:\s*"rec-' }

$recipes = @()
foreach ($blk in $blocks) {
    $id      = ([regex]::Match($blk, 'id:\s*"(rec-[^"]+)"')).Groups[1].Value
    $title   = ([regex]::Match($blk, 'title:\s*"([^"]+)"')).Groups[1].Value
    $cuisine = ([regex]::Match($blk, 'cuisine:\s*"([^"]+)"')).Groups[1].Value
    $desc    = ([regex]::Match($blk, 'description:\s*"([^"]{0,120})')).Groups[1].Value

    # 取前 4 個食材名
    $ingNames = ([regex]::Matches($blk, '(?:^|,)\s*\{[^}]*?name:\s*"([^"]+)"') |
                 Select-Object -First 4) | ForEach-Object { $_.Groups[1].Value }

    if ($id -and $title) {
        $recipes += [PSCustomObject]@{
            Id          = $id
            Title       = $title
            Cuisine     = $cuisine
            Ingredients = ($ingNames -join "、")
            Desc        = $desc
        }
    }
}

$total = $recipes.Count
Write-Host "Found $total recipes`n" -ForegroundColor Cyan

# ---------- 3. Imagen API 設定 ----------
$ApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=$ApiKey"

# ---------- 4. 逐一生成圖片 ----------
$done = 0; $skip = 0; $fail = 0

foreach ($r in $recipes) {
    $done++
    $outPath = Join-Path $ImagesDir "$($r.Id).jpg"

    # 已存在則跳過
    if ($SkipExisting -and (Test-Path $outPath)) {
        $skip++
        Write-Host "  [$done/$total] SKIP  $($r.Title)" -ForegroundColor DarkGray
        continue
    }

    # 組合英文 prompt（Imagen 對英文效果較好）
    $prompt = "Professional food photography of '$($r.Title)', a $($r.Cuisine) dish."
    if ($r.Ingredients) { $prompt += " Main ingredients: $($r.Ingredients)." }
    $prompt += " The dish is beautifully plated on a clean white marble or wooden surface. Soft natural studio lighting, shallow depth of field, elegant restaurant presentation. 16:9 widescreen, photorealistic, highly detailed, appetizing."

    $body = @{
        instances  = @(@{ prompt = $prompt })
        parameters = @{ aspectRatio = "16:9"; sampleCount = 1 }
    } | ConvertTo-Json -Depth 5 -Compress

    $pct = [math]::Round($done / $total * 100)
    Write-Host "  [$done/$total] ($pct%)  $($r.Title) ..." -NoNewline

    try {
        $resp = Invoke-RestMethod -Uri $ApiUrl -Method Post `
                   -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
                   -ContentType "application/json; charset=utf-8" `
                   -TimeoutSec 60 -ErrorAction Stop

        $b64   = $resp.predictions[0].bytesBase64Encoded
        $bytes = [Convert]::FromBase64String($b64)
        [System.IO.File]::WriteAllBytes($outPath, $bytes)
        Write-Host " OK" -ForegroundColor Green
    }
    catch {
        $fail++
        $msg = $_.Exception.Message -replace "`n"," "
        Write-Host " FAIL: $msg" -ForegroundColor Red
    }

    Start-Sleep -Milliseconds $DelayMs
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Done  : $($done - $skip - $fail) generated" -ForegroundColor Green
Write-Host "Skipped: $skip (already existed)" -ForegroundColor DarkGray
Write-Host "Failed : $fail" -ForegroundColor $(if($fail -gt 0){"Red"}else{"DarkGray"})
Write-Host "Images : $ImagesDir" -ForegroundColor Cyan
