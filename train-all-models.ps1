# Train All Models Script
# This script trains ML models for all services that have training data

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "🤖 TRAINING ML MODELS FOR ALL SERVICES" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Phishing Detection"; Path="phishing-detection-service"},
    @{Name="Password Security"; Path="password-security-service"},
    @{Name="Social Engineering"; Path="social-engineering-service"}
)

$successCount = 0
$failCount = 0
$results = @()

foreach ($service in $services) {
    Write-Host ""
    Write-Host "━" * 80 -ForegroundColor Yellow
    Write-Host "📊 Training: $($service.Name)" -ForegroundColor Yellow
    Write-Host "━" * 80 -ForegroundColor Yellow
    
    $servicePath = Join-Path $PSScriptRoot $service.Path
    $trainScript = Join-Path $servicePath "train_model.py"
    
    if (Test-Path $trainScript) {
        Push-Location $servicePath
        try {
            python train_model.py
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $($service.Name) - Training completed successfully!" -ForegroundColor Green
                $successCount++
                $results += "$($service.Name): ✅ Success"
            } else {
                Write-Host "❌ $($service.Name) - Training failed!" -ForegroundColor Red
                $failCount++
                $results += "$($service.Name): ❌ Failed"
            }
        } catch {
            Write-Host "❌ $($service.Name) - Error: $_" -ForegroundColor Red
            $failCount++
            $results += "$($service.Name): ❌ Error"
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "⚠️  Training script not found: $trainScript" -ForegroundColor Yellow
        $results += "$($service.Name): ⚠️  Script not found"
    }
}

Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "📈 TRAINING SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

foreach ($result in $results) {
    Write-Host $result
}

Write-Host ""
Write-Host "Total: $($services.Count) services" -ForegroundColor White
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "❌ Failed: $failCount" -ForegroundColor Red
}
Write-Host ""

if ($successCount -eq $services.Count) {
    Write-Host "🎉 All models trained successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some models failed to train. Check the output above for details." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
