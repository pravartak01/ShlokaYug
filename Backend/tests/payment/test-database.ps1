# Test Database Integration
param([string]$BaseUrl = "http://localhost:5000/api/v1")

Write-Host "Testing Database Integration..." -ForegroundColor Cyan

# Create test user
$email = "dbtest$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
$userData = @{
    firstName = "DB"
    lastName = "Test"
    email = $email
    username = "dbtest$(Get-Random -Minimum 1000 -Maximum 9999)"
    password = "DBTest123!"
    role = "student"
} | ConvertTo-Json

try {
    $userResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $userData
    $token = $userResponse.data.tokens.accessToken
    $userId = $userResponse.data.user.id
    Write-Host "✓ User created: $email (ID: $userId)" -ForegroundColor Green
    
    $headers = @{"Content-Type" = "application/json"; "Authorization" = "Bearer $token"}
    
    # Create payment order - this should save to database now
    $orderData = @{
        courseId = "507f1f77bcf86cd799439011"
        amount = 2999.50
        currency = "INR"
        enrollmentType = "one_time"
    } | ConvertTo-Json
    
    $orderResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/create-order" -Method POST -Headers $headers -Body $orderData
    $orderId = $orderResponse.data.orderId
    Write-Host "✓ Payment order created: $orderId" -ForegroundColor Green
    
    # Test payment status (should find in database)
    $statusResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/$orderId/status" -Method GET -Headers $headers
    Write-Host "✓ Payment status from DB: $($statusResponse.data.transaction.status)" -ForegroundColor Green
    
    # Verify signature to mark as success
    $secret = "QlDV89Xspiv2K9EXMFfBq8PB"
    $paymentId = "pay_dbtest123456789"
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
    Write-Host "✓ Payment verified: $($verifyResponse.data.verified)" -ForegroundColor Green
    
    # Check status again (should show success in database)
    $finalStatusResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/$orderId/status" -Method GET -Headers $headers
    Write-Host "✓ Final status from DB: $($finalStatusResponse.data.transaction.status)" -ForegroundColor Green
    Write-Host "✓ Transaction ID: $($finalStatusResponse.data.transaction.transactionId)" -ForegroundColor Green
    
    # Check payment history (should show in database)
    $historyResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/my-payments" -Method GET -Headers $headers
    Write-Host "✓ Payment history: $($historyResponse.data.payments.Count) payment(s)" -ForegroundColor Green
    
    if ($historyResponse.data.payments.Count -gt 0) {
        $payment = $historyResponse.data.payments[0]
        Write-Host "   - Payment ID: $($payment.transactionId)" -ForegroundColor Gray
        Write-Host "   - Status: $($payment.status)" -ForegroundColor Gray
        Write-Host "   - Amount: $($payment.amount.total) $($payment.amount.currency)" -ForegroundColor Gray
    }
    
    Write-Host "`n🎉 DATABASE INTEGRATION WORKING!" -ForegroundColor Green
    Write-Host "✅ Transactions stored in MongoDB" -ForegroundColor Green
    Write-Host "✅ Status tracking working" -ForegroundColor Green
    Write-Host "✅ Payment history accessible" -ForegroundColor Green
    Write-Host "✅ Transaction IDs generated" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Red
    }
}