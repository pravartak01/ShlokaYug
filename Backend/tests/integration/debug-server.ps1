# Simple Server Health Check
Write-Host "Testing server health..." -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"

Write-Host "`nStep 1: Health Check..." -ForegroundColor Magenta
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "Health Check: $($healthResponse.message)" -ForegroundColor Green
    Write-Host "Environment: $($healthResponse.environment)" -ForegroundColor Cyan
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the server is running on port 5000" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nStep 2: Test Auth Endpoint..." -ForegroundColor Magenta
$registerBody = @{
    username = "testuser$(Get-Random)"
    firstName = "Test"
    lastName = "User"  
    email = "test$(Get-Random)@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method POST -Headers $headers -Body $registerBody
    Write-Host "Registration: SUCCESS" -ForegroundColor Green
    $token = $registerResponse.data.tokens.access
    $userId = $registerResponse.data.user.id
    Write-Host "Got token and user ID" -ForegroundColor Cyan
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try with existing user
    try {
        $loginBody = @{
            identifier = "test@example.com"
            password = "Test123!@#"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method POST -Headers $headers -Body $loginBody
        $token = $loginResponse.token
        $userId = $loginResponse.data.user.id
        Write-Host "Login fallback: SUCCESS" -ForegroundColor Green
    } catch {
        Write-Host "Login also failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Cannot proceed without authentication" -ForegroundColor Yellow
        exit 1
    }
}

if ($token) {
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "`nStep 3: Test Auto-Enrollment Endpoint..." -ForegroundColor Magenta
    Write-Host "Endpoint: $baseUrl/api/v1/enrollments/auto-enroll" -ForegroundColor Cyan
    
    $enrollBody = @{
        transactionId = "TXN_TEST_$(Get-Random)"
        userId = $userId
        courseId = "507f1f77bcf86cd799439022"
    } | ConvertTo-Json
    
    Write-Host "Payload:" -ForegroundColor Yellow
    Write-Host $enrollBody -ForegroundColor White
    
    try {
        $enrollResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/enrollments/auto-enroll" -Method POST -Headers $authHeaders -Body $enrollBody
        Write-Host "Auto-Enrollment: SUCCESS" -ForegroundColor Green
        Write-Host "Enrollment ID: $($enrollResponse.enrollment.enrollmentId)" -ForegroundColor Cyan
    } catch {
        Write-Host "Auto-Enrollment: FAILED" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
        
        # Try to get more details
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Body: $errorBody" -ForegroundColor Magenta
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Gray
        }
    }
    
    Write-Host "`nStep 4: Test My Enrollments..." -ForegroundColor Magenta
    try {
        $listResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/enrollments/my-enrollments" -Method GET -Headers $authHeaders
        Write-Host "My Enrollments: SUCCESS" -ForegroundColor Green
        Write-Host "Found $($listResponse.data.enrollments.Count) enrollments" -ForegroundColor Cyan
    } catch {
        Write-Host "My Enrollments: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Cyan