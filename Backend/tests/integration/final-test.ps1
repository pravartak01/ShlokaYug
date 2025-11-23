# Payment-Enrollment Integration Test
Write-Host "Testing Payment-Enrollment Integration..." -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api/v1"

Write-Host "`nStep 1: User Registration..." -ForegroundColor Magenta

$registerBody = @{
    username = "testuser$(Get-Random)"
    firstName = "Test"
    lastName = "User"
    email = "test$(Get-Random)@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Headers $headers -Body $registerBody
    Write-Host "User registered successfully" -ForegroundColor Green
    if ($registerResponse.data -and $registerResponse.data.user -and $registerResponse.data.user.id) {
        $userId = $registerResponse.data.user.id
        Write-Host "User ID: $userId" -ForegroundColor Cyan
    } else {
        $userId = $null
        Write-Host "Could not extract user ID" -ForegroundColor Yellow
    }
    
    if ($registerResponse.data -and $registerResponse.data.tokens -and $registerResponse.data.tokens.access) {
        $token = $registerResponse.data.tokens.access
        Write-Host "Token obtained successfully" -ForegroundColor Green
    } else {
        $token = $null
        Write-Host "No token found in response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    # Try login with existing user
    $loginBody = @{
        identifier = "test@example.com"
        password = "Test123!@#"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginBody
        $token = $loginResponse.token
        $userId = $loginResponse.data.user.id
        Write-Host "Login successful: $userId" -ForegroundColor Green
    } catch {
        Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
        $token = $null
    }
}

if ($token) {
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "`nStep 2: Testing Payment Order Creation..." -ForegroundColor Magenta
    $orderBody = @{
        courseId = "507f1f77bcf86cd799439022"
        amount = 1999.50
        currency = "INR"
    } | ConvertTo-Json
    
    try {
        $orderResponse = Invoke-RestMethod -Uri "$baseUrl/payments/create-order" -Method POST -Headers $authHeaders -Body $orderBody
        Write-Host "Payment order created: $($orderResponse.data.orderId)" -ForegroundColor Green
        $orderId = $orderResponse.data.orderId
    } catch {
        Write-Host "Payment order failed: $($_.Exception.Message)" -ForegroundColor Red
        $orderId = $null
    }
    
    Write-Host "`nStep 3: Testing Auto-Enrollment..." -ForegroundColor Magenta
    $enrollBody = @{
        transactionId = "TXN_TEST_123"
        userId = $userId
        courseId = "507f1f77bcf86cd799439022"
    } | ConvertTo-Json
    
    try {
        $enrollResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/auto-enroll" -Method POST -Headers $authHeaders -Body $enrollBody
        Write-Host "Auto-enrollment successful: $($enrollResponse.enrollment.enrollmentId)" -ForegroundColor Green
        $enrollmentId = $enrollResponse.enrollment.enrollmentId
    } catch {
        Write-Host "Auto-enrollment failed: $($_.Exception.Message)" -ForegroundColor Red
        $enrollmentId = $null
    }
    
    Write-Host "`nStep 4: Testing My Enrollments..." -ForegroundColor Magenta
    try {
        $listResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/my-enrollments" -Method GET -Headers $authHeaders
        $count = $listResponse.data.enrollments.Count
        Write-Host "Found $count enrollments" -ForegroundColor Green
    } catch {
        Write-Host "Enrollment list failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($enrollmentId) {
        Write-Host "`nStep 5: Testing Enrollment Validation..." -ForegroundColor Magenta
        try {
            $validateResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/$enrollmentId/validate" -Method GET -Headers $authHeaders
            Write-Host "Access validation: $($validateResponse.data.hasAccess)" -ForegroundColor Green
        } catch {
            Write-Host "Validation failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if ($orderId) {
        Write-Host "`nStep 6: Testing Payment Status..." -ForegroundColor Magenta
        try {
            $statusResponse = Invoke-RestMethod -Uri "$baseUrl/payments/$orderId/status" -Method GET -Headers $authHeaders
            Write-Host "Payment status: $($statusResponse.data.transaction.status)" -ForegroundColor Green
        } catch {
            Write-Host "Payment status failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`nSUMMARY:" -ForegroundColor Cyan
    Write-Host "Authentication: PASSED" -ForegroundColor Green
    if ($orderId) { Write-Host "Payment Order: PASSED" -ForegroundColor Green } else { Write-Host "Payment Order: FAILED" -ForegroundColor Red }
    if ($enrollmentId) { Write-Host "Auto-Enrollment: PASSED" -ForegroundColor Green } else { Write-Host "Auto-Enrollment: FAILED" -ForegroundColor Red }
    
} else {
    Write-Host "`nNo authentication token - cannot test API endpoints" -ForegroundColor Yellow
}

Write-Host "`nIntegration test completed!" -ForegroundColor Cyan