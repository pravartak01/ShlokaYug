# Simple Debug Test
Write-Host "Testing debug logs..." -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"

try {
    Write-Host "Testing health endpoint..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "Health check successful" -ForegroundColor Green
    
    Write-Host "`nTesting non-existent endpoint..." -ForegroundColor Yellow
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/non-existent" -Method GET
} catch {
    Write-Host "Expected error for non-existent endpoint: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}

Write-Host "`nDebug test completed!" -ForegroundColor Cyan