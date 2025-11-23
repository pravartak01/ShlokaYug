# Quick Test for Route Existence
$baseUrl = "http://localhost:5000"

Write-Host "Testing server and route availability..." -ForegroundColor Cyan

# 1. Check if server is running
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "Server is running" -ForegroundColor Green
} catch {
    Write-Host "Server is not running or not accessible" -ForegroundColor Red
    Write-Host "Please start the server: npm run dev" -ForegroundColor Yellow
    exit 1
}

# 2. Try the auto-enroll endpoint without authentication (should give 401, not 404)
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/enrollments/auto-enroll" -Method POST
    Write-Host "Unexpected success - route exists" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "Route exists (401 Unauthorized)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "Route not found (404)" -ForegroundColor Red
    } else {
        Write-Host "Route exists but returned $statusCode" -ForegroundColor Yellow
    }
}

Write-Host "`nQuick test completed!" -ForegroundColor Cyan