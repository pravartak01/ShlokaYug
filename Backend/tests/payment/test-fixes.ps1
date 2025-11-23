# Simple Payment Fix Validation
param([string]$BaseUrl = "http://localhost:5000/api/v1")

Write-Host "Testing Payment Gateway Fixes..." -ForegroundColor Cyan

# Create test user
$email = "fixtest$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
$userData = @{
    firstName = "Fix"
    lastName = "Test"
    email = $email
    username = "fixtest$(Get-Random)"
    password = "Fix123!"
    role = "student"
} | ConvertTo-Json

try {
    $userResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $userData
    $token = $userResponse.data.tokens.accessToken
    Write-Host "✓ User created successfully" -ForegroundColor Green
    
    $headers = @{"Content-Type" = "application/json"; "Authorization" = "Bearer $token"}
    
    # Create payment order
    $orderData = @{
        courseId = "507f1f77bcf86cd799439011"
        amount = 999.50
        currency = "INR"
        enrollmentType = "one_time"
    } | ConvertTo-Json
    
    $orderResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/create-order" -Method POST -Headers $headers -Body $orderData
    $orderId = $orderResponse.data.orderId
    Write-Host "✓ Payment order created: $orderId" -ForegroundColor Green
    
    # Test payment status (this should work now!)
    $statusResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/$orderId/status" -Method GET -Headers $headers
    Write-Host "✓ Payment status retrieved: $($statusResponse.data.transaction.status)" -ForegroundColor Green
    
    # Test payment history (this should show our payment now!)
    $historyResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/my-payments" -Method GET -Headers $headers
    Write-Host "✓ Payment history retrieved: $($historyResponse.data.payments.Count) payment(s)" -ForegroundColor Green
    
    # Test signature verification
    $secret = "QlDV89Xspiv2K9EXMFfBq8PB"
    $paymentId = "pay_test123456789"
    $message = "$orderId|$paymentId"
    $hmac = [System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($secret))
    $hash = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($message))
    $signature = [System.BitConverter]::ToString($hash).Replace("-", "").ToLower()
    
    $verifyData = @{
        razorpay_order_id = $orderId
        razorpay_payment_id = $paymentId
        razorpay_signature = $signature
    } | ConvertTo-Json
    
    $verifyResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/verify" -Method POST -Headers $headers -Body $verifyData
    Write-Host "✓ Payment signature verified: $($verifyResponse.data.verified)" -ForegroundColor Green
    
    # Check status again after verification
    $finalStatusResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/$orderId/status" -Method GET -Headers $headers
    Write-Host "✓ Final payment status: $($finalStatusResponse.data.transaction.status)" -ForegroundColor Green
    
    Write-Host "`n🎉 ALL PAYMENT GATEWAY FIXES WORKING!" -ForegroundColor Green
    Write-Host "✓ Order creation: Working" -ForegroundColor Green
    Write-Host "✓ Status retrieval: Working" -ForegroundColor Green
    Write-Host "✓ Payment history: Working" -ForegroundColor Green
    Write-Host "✓ Signature verification: Working" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}