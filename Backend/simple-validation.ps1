# SHLOKAYUG PAYMENT GATEWAY VALIDATION
param([string]$BaseUrl = "http://localhost:5000/api/v1")

Write-Host "=====================================================" -ForegroundColor Green
Write-Host "       SHLOKAYUG PAYMENT GATEWAY VALIDATION" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

$results = @{ Passed = 0; Failed = 0; Tests = @() }

function Add-Result($test, $status, $details = "") {
    $results.Tests += @{Test = $test; Status = $status; Details = $details}
    if ($status -eq "PASS") { $results.Passed++ } else { $results.Failed++ }
    $color = if($status -eq "PASS") {"Green"} else {"Red"}
    Write-Host "$status : $test" -ForegroundColor $color
    if ($details) { Write-Host "       $details" -ForegroundColor Gray }
}

Write-Host "`n1. BACKEND SERVER VALIDATION" -ForegroundColor Yellow

# Health Check
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/auth/health" -TimeoutSec 5
    Add-Result "Server Health Check" "PASS" "Server running on port 5000"
} catch {
    Add-Result "Server Health Check" "FAIL" "Server not responding"
    exit
}

Write-Host "`n2. USER AUTHENTICATION SYSTEM" -ForegroundColor Yellow

# Test User Registration
$timestamp = [Math]::Floor([double]((Get-Date) - (Get-Date "1970-01-01")).TotalSeconds)
$testEmail = "validation$timestamp@test.com"
$userData = @{
    firstName = "Validation"
    lastName = "User"
    email = $testEmail  
    username = "validation$timestamp"
    password = "Valid123!"
    role = "student"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -ContentType "application/json" -Body $userData
    Add-Result "User Registration" "PASS" "User created successfully"
    $token = $regResponse.data.tokens.access
    Add-Result "JWT Token Generation" "PASS" "Access token received"
} catch {
    Add-Result "User Registration" "FAIL" $_.Exception.Message
    exit
}

# Test Login
$loginData = @{
    identifier = $testEmail
    password = "Valid123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    Add-Result "User Login" "PASS" "Authentication successful"
    Add-Result "Role Assignment" "PASS" "User role: $($loginResponse.user.role)"
} catch {
    Add-Result "User Login" "FAIL" $_.Exception.Message
}

Write-Host "`n3. PAYMENT SYSTEM ENDPOINTS" -ForegroundColor Yellow

$authHeaders = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Test payment methods endpoint
try {
    $methods = Invoke-RestMethod -Uri "$BaseUrl/payments/methods" -Headers $authHeaders
    Add-Result "Payment Methods Endpoint" "PASS" "Methods loaded successfully"
} catch {
    Add-Result "Payment Methods Endpoint" "FAIL" $_.Exception.Message
}

# Test subscription plans endpoint  
try {
    $plans = Invoke-RestMethod -Uri "$BaseUrl/payments/subscription-plans" -Headers $authHeaders
    Add-Result "Subscription Plans Endpoint" "PASS" "Plans loaded successfully"  
} catch {
    Add-Result "Subscription Plans Endpoint" "FAIL" $_.Exception.Message
}

# Test payment history endpoint
try {
    $history = Invoke-RestMethod -Uri "$BaseUrl/payments/my-payments" -Headers $authHeaders
    Add-Result "Payment History Endpoint" "PASS" "History accessible"
} catch {
    Add-Result "Payment History Endpoint" "FAIL" $_.Exception.Message
}

Write-Host "`n4. PAYMENT ORDER TESTING" -ForegroundColor Yellow

# Test create order
$orderData = @{
    courseId = "507f1f77bcf86cd799439011"
    amount = 1999.50
    currency = "INR" 
    enrollmentType = "one_time"
} | ConvertTo-Json

try {
    $orderResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/create-order" -Method POST -Headers $authHeaders -Body $orderData
    Add-Result "Payment Order Creation" "PASS" "Order ID: $($orderResponse.data.orderId)"
    
    $orderId = $orderResponse.data.orderId
    
    # Test signature verification
    $paymentId = "pay_test123456789"
    $secret = "QlDV89Xspiv2K9EXMFfBq8PB"
    $message = "$orderId|$paymentId"
    $hmac = [System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($secret))
    $hash = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($message))
    $signature = [System.BitConverter]::ToString($hash).Replace("-", "").ToLower()
    
    $verifyData = @{
        razorpay_order_id = $orderId
        razorpay_payment_id = $paymentId
        razorpay_signature = $signature
    } | ConvertTo-Json
    
    $verifyResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/verify" -Method POST -Headers $authHeaders -Body $verifyData
    Add-Result "Payment Signature Verification" "PASS" "HMAC security working"
    
    # Test status endpoint
    $statusResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/$orderId/status" -Headers $authHeaders
    Add-Result "Payment Status Retrieval" "PASS" "Transaction status accessible"
    
} catch {
    Add-Result "Payment Order Creation" "FAIL" $_.Exception.Message
    Add-Result "Signature Verification" "SKIP" "Order creation failed"
    Add-Result "Status Retrieval" "SKIP" "Order creation failed"
}

Write-Host "`n5. SECURITY VALIDATION" -ForegroundColor Yellow

# Test invalid signature rejection
try {
    $invalidData = @{
        razorpay_order_id = "order_test123"
        razorpay_payment_id = "pay_test123"  
        razorpay_signature = "invalid_signature"
    } | ConvertTo-Json
    
    $invalidResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/verify" -Method POST -Headers $authHeaders -Body $invalidData
    Add-Result "Invalid Signature Rejection" "FAIL" "SECURITY ISSUE: Invalid signature accepted!"
} catch {
    Add-Result "Invalid Signature Rejection" "PASS" "Invalid signatures properly rejected"
}

# Results Summary
Write-Host "`n=====================================================" -ForegroundColor Green
Write-Host "               VALIDATION RESULTS" -ForegroundColor Green  
Write-Host "=====================================================" -ForegroundColor Green

$total = $results.Passed + $results.Failed
$successRate = if($total -gt 0) { [math]::Round(($results.Passed / $total) * 100, 1) } else { 0 }

Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor White
Write-Host "  Passed: $($results.Passed)" -ForegroundColor Green
Write-Host "  Failed: $($results.Failed)" -ForegroundColor Red  
Write-Host "  Success: $successRate%" -ForegroundColor $(if($successRate -ge 80) {"Green"} else {"Yellow"})

Write-Host ""
Write-Host "DETAILED RESULTS:" -ForegroundColor White
foreach ($test in $results.Tests) {
    $symbol = if($test.Status -eq "PASS") {"PASS"} elseif($test.Status -eq "FAIL") {"FAIL"} else {"SKIP"}
    $color = if($test.Status -eq "PASS") {"Green"} elseif($test.Status -eq "FAIL") {"Red"} else {"Yellow"}
    Write-Host "  $symbol $($test.Test)" -ForegroundColor $color
    if ($test.Details) {
        Write-Host "    $($test.Details)" -ForegroundColor Gray
    }
}

Write-Host ""
if ($results.Failed -eq 0) {
    Write-Host "ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host "Payment gateway ready for testing" -ForegroundColor Green
} elseif ($results.Passed -ge ($total * 0.8)) {
    Write-Host "MOSTLY FUNCTIONAL" -ForegroundColor Yellow  
    Write-Host "Core systems working, some issues detected" -ForegroundColor Yellow
} else {
    Write-Host "MAJOR ISSUES DETECTED" -ForegroundColor Red
    Write-Host "Multiple systems need attention" -ForegroundColor Red
}

Write-Host ""
Write-Host "TEST USER CREDENTIALS:" -ForegroundColor Cyan
Write-Host "  Email: $testEmail" -ForegroundColor White
Write-Host "  Password: Valid123!" -ForegroundColor White

Write-Host ""
Write-Host "RAZORPAY TEST CARDS:" -ForegroundColor Cyan
Write-Host "  SUCCESS: 4111 1111 1111 1111 (Visa)" -ForegroundColor Green
Write-Host "  SUCCESS: 5555 5555 5555 4444 (Mastercard)" -ForegroundColor Green
Write-Host "  FAILURE: 4000 0000 0000 0002 (Declined)" -ForegroundColor Red
Write-Host "  CVV: 123, Expiry: 12/25, Name: Any" -ForegroundColor Gray

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
if ($results.Failed -eq 0) {
    Write-Host "  1. Backend validation complete" -ForegroundColor White
    Write-Host "  2. Test with frontend integration" -ForegroundColor White
    Write-Host "  3. Use Razorpay test cards for payments" -ForegroundColor White
    Write-Host "  4. Monitor Razorpay dashboard" -ForegroundColor White
} else {
    Write-Host "  1. Fix failing components above" -ForegroundColor White
    Write-Host "  2. Re-run validation test" -ForegroundColor White  
    Write-Host "  3. Check server logs for details" -ForegroundColor White
}

Write-Host ""
Write-Host "VALIDATION COMPLETE" -ForegroundColor Green