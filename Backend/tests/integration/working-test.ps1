# Simple Working Integration Test
Write-Host "🧪 Payment-Enrollment Integration Test" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api/v1"

# Test 1: Try to register a new user
Write-Host "`n1️⃣ Testing User Registration..." -ForegroundColor Magenta

$registerBody = @{
    name = "Test User $(Get-Random)"
    email = "test_$(Get-Random)@example.com"
    password = "Test123!@#"
    role = "student"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Headers $headers -Body $registerBody
    Write-Host "   ✅ User registered successfully" -ForegroundColor Green
    $token = $registerResponse.token
    $userId = $registerResponse.data.user.id
    Write-Host "   🔑 User ID: $userId" -ForegroundColor Cyan
}
catch {
    Write-Host "   ❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   🔄 Trying with existing user..." -ForegroundColor Yellow
    $token = $null
}

# If registration failed, try a test login
if (-not $token) {
    $loginBody = @{
        email = "test@example.com"
        password = "Test123!@#"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginBody
        $token = $loginResponse.token
        $userId = $loginResponse.data.user.id
        Write-Host "   ✅ Login successful: $userId" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($token) {
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    # Test 2: Payment Order
    Write-Host "`n2️⃣ Testing Payment Order..." -ForegroundColor Magenta
    $orderBody = @{
        courseId = "507f1f77bcf86cd799439022"
        amount = 1999.50
        currency = "INR"
    } | ConvertTo-Json
    
    try {
        $orderResponse = Invoke-RestMethod -Uri "$baseUrl/payments/create-order" -Method POST -Headers $authHeaders -Body $orderBody
        Write-Host "   ✅ Payment order created: $($orderResponse.data.orderId)" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Payment order failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 3: Auto-Enrollment
    Write-Host "`n3️⃣ Testing Auto-Enrollment..." -ForegroundColor Magenta
    $enrollBody = @{
        transactionId = "TXN_TEST_$(Get-Random)"
        userId = $userId
        courseId = "507f1f77bcf86cd799439022"
    } | ConvertTo-Json
    
    try {
        $enrollResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/auto-enroll" -Method POST -Headers $authHeaders -Body $enrollBody
        Write-Host "   ✅ Auto-enrollment successful: $($enrollResponse.enrollment.enrollmentId)" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Auto-enrollment failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 4: List Enrollments
    Write-Host "`n4️⃣ Testing Enrollment List..." -ForegroundColor Magenta
    try {
        $listResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/my-enrollments" -Method GET -Headers $authHeaders
        $count = $listResponse.data.enrollments.Count
        Write-Host "   ✅ Found $count enrollments" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Enrollment list failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} else {
    Write-Host "`n⚠️  No authentication token available - skipping API tests" -ForegroundColor Yellow
}

Write-Host "`n🏆 Integration test completed!" -ForegroundColor Cyan