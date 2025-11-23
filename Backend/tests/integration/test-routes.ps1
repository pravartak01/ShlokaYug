# Minimal Route Test
Write-Host "Testing enrollment route registration..." -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api/v1"

# Login first
$loginBody = @{
    identifier = "test@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginBody
    
    # Debug the login response structure
    Write-Host "Login response keys:" -ForegroundColor Cyan
    $loginResponse.PSObject.Properties.Name | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
    if ($loginResponse.data) {
        Write-Host "Data keys:" -ForegroundColor Cyan
        $loginResponse.data.PSObject.Properties.Name | ForEach-Object { Write-Host "  data.$_" -ForegroundColor Gray }
    }
    
    if ($loginResponse.data.tokens) {
        Write-Host "Token keys:" -ForegroundColor Cyan
        $loginResponse.data.tokens.PSObject.Properties.Name | ForEach-Object { Write-Host "  tokens.$_" -ForegroundColor Gray }
        $token = $loginResponse.data.tokens.access
    } elseif ($loginResponse.token) {
        $token = $loginResponse.token
    } else {
        $token = $null
    }
    
    Write-Host "Using token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host "Login: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "Login: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

# Test different enrollment endpoints
Write-Host "`nTesting enrollment endpoints:" -ForegroundColor Magenta

# 1. My Enrollments (known working)
try {
    $listResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/my-enrollments" -Method GET -Headers $authHeaders
    Write-Host "✅ /my-enrollments: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "❌ /my-enrollments: FAILED - $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# 2. Auto-enroll (the problem endpoint)
$enrollBody = @{
    transactionId = "TXN_TEST_123"
    userId = $loginResponse.data.user.id
    courseId = "507f1f77bcf86cd799439022"
} | ConvertTo-Json

try {
    $enrollResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/auto-enroll" -Method POST -Headers $authHeaders -Body $enrollBody
    Write-Host "✅ /auto-enroll: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "❌ /auto-enroll: FAILED - Status $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Try to get error details if available
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        if ($errorBody) {
            Write-Host "Error details: $errorBody" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "No additional error details available" -ForegroundColor Gray
    }
}

# 3. Try a simple GET to non-existent enrollment (should give 404 but different from route 404)
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/non-existent-id" -Method GET -Headers $authHeaders
    Write-Host "✅ /non-existent-id: Unexpected success" -ForegroundColor Yellow
} catch {
    Write-Host "✅ /non-existent-id: Expected 404 - Status $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Green
}

Write-Host "`nRoute test completed!" -ForegroundColor Cyan