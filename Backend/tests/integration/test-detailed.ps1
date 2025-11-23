# Detailed Auto-Enrollment Test
Write-Host "Testing auto-enrollment with detailed error reporting..." -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api/v1"

# Login first
$loginBody = @{
    identifier = "test@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginBody
    $token = $loginResponse.data.tokens.access
    $userId = $loginResponse.data.user.id
    Write-Host "Login successful - User ID: $userId" -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

# Test auto-enrollment with detailed error capture
$enrollBody = @{
    transactionId = "TXN_TEST_12345"
    userId = $userId
    courseId = "507f1f77bcf86cd799439022"
} | ConvertTo-Json

Write-Host "`nTesting auto-enrollment..." -ForegroundColor Magenta
Write-Host "Request payload:" -ForegroundColor Yellow
Write-Host $enrollBody

try {
    $enrollResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/auto-enroll" -Method POST -Headers $authHeaders -Body $enrollBody
    Write-Host "`nSUCCESS!" -ForegroundColor Green
    Write-Host "Enrollment ID: $($enrollResponse.enrollment.enrollmentId)" -ForegroundColor Cyan
    Write-Host "Status: $($enrollResponse.enrollment.status)" -ForegroundColor Cyan
} catch {
    Write-Host "`nFAILED!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Yellow
    
    # Get detailed error response
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Response:" -ForegroundColor Magenta
        Write-Host $errorBody -ForegroundColor White
        
        # Try to parse as JSON for better formatting
        try {
            $errorJson = $errorBody | ConvertFrom-Json
            Write-Host "`nParsed Error:" -ForegroundColor Magenta
            Write-Host "Message: $($errorJson.message)" -ForegroundColor Red
            if ($errorJson.errors) {
                Write-Host "Validation Errors:" -ForegroundColor Yellow
                $errorJson.errors | ForEach-Object { Write-Host "  - $($_.field): $($_.message)" -ForegroundColor Yellow }
            }
        } catch {
            Write-Host "Could not parse error as JSON" -ForegroundColor Gray
        }
    } catch {
        Write-Host "Could not read detailed error response" -ForegroundColor Gray
    }
}

Write-Host "`nDetailed test completed!" -ForegroundColor Cyan