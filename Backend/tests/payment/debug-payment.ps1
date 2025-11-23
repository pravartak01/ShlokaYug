# Quick Payment Debug Test
param([string]$BaseUrl = "http://localhost:5000/api/v1")

Write-Host "======================================================" -ForegroundColor Yellow
Write-Host "   PAYMENT GATEWAY DEBUG TEST" -ForegroundColor Yellow  
Write-Host "======================================================" -ForegroundColor Yellow

$headers = @{"Content-Type" = "application/json"}

# Test 1: Create a user
Write-Host "`n[USER CREATION]" -ForegroundColor Cyan
$email = "debuguser$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
$userData = @{
    firstName = "Debug"
    lastName = "User"
    email = $email
    username = "debuguser$(Get-Random)"
    password = "Debug123!"
    role = "student"
} | ConvertTo-Json

try {
    $userResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Headers $headers -Body $userData
    $token = $userResponse.data.tokens.accessToken
    $userId = $userResponse.data.user.id
    Write-Host "✓ User created: $email" -ForegroundColor Green
    Write-Host "✓ Token: $($token.Substring(0,20))..." -ForegroundColor Green
    Write-Host "✓ User ID: $userId" -ForegroundColor Green
} catch {
    Write-Host "✗ User creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Update headers with auth token
$headers["Authorization"] = "Bearer $token"

# Test 2: Create payment order
Write-Host "`n[PAYMENT ORDER CREATION]" -ForegroundColor Cyan
$orderData = @{
    courseId = "507f1f77bcf86cd799439011"
    amount = 1999.50
    currency = "INR"
    enrollmentType = "one_time"
} | ConvertTo-Json

try {
    $orderResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/create-order" -Method POST -Headers $headers -Body $orderData
    $orderId = $orderResponse.data.orderId
    Write-Host "✓ Payment order created: $orderId" -ForegroundColor Green
    Write-Host "✓ Amount: $($orderResponse.data.amount) paisa" -ForegroundColor Green
} catch {
    Write-Host "✗ Payment order creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
    exit 1
}

# Test 3: Check payment status - This is where the 404 error occurs
Write-Host "`n[PAYMENT STATUS CHECK]" -ForegroundColor Cyan
try {
    $statusResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/$orderId/status" -Method GET -Headers $headers
    Write-Host "✓ Payment status retrieved successfully" -ForegroundColor Green
    Write-Host "Status: $($statusResponse.data.transaction.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Payment status check failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 404) {
            Write-Host "🔍 This is the 404 error we need to fix!" -ForegroundColor Yellow
        }
        
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error details: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}
}

# Test 4: Check payment history  
Write-Host "`n[PAYMENT HISTORY CHECK]" -ForegroundColor Cyan
try {
    $historyResponse = Invoke-RestMethod -Uri "$BaseUrl/payments/my-payments" -Method GET -Headers $headers
    Write-Host "✓ Payment history retrieved successfully" -ForegroundColor Green
    Write-Host "Total payments in history: $($historyResponse.data.payments.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Payment history check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n======================================================" -ForegroundColor Yellow
Write-Host "   DEBUG TEST COMPLETE" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Yellow
Write-Host "`nTest Data for Manual Debugging:"
Write-Host "User Email: $email"  
Write-Host "Order ID: $orderId"
Write-Host "User ID: $userId"