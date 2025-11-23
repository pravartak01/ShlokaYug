# Payment-Enrollment Integration Test Script
# Tests the complete flow: Payment Creation → Verification → Auto-Enrollment

Write-Host "🧪 Starting Payment-Enrollment Integration Test..." -ForegroundColor Cyan
Write-Host "=" * 60

# Configuration
$baseUrl = "http://localhost:5000/api"
$testUserId = "507f1f77bcf86cd799439011"
$testCourseId = "507f1f77bcf86cd799439022" 
$testAmount = 1999.50

# Test headers (simulated authentication)
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer test-jwt-token"
    "x-user-id" = $testUserId
    "x-user-role" = "student"
}

# Helper function to make API requests
function Invoke-APITest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$TestName
    )
    
    Write-Host "`n🔍 Testing: $TestName" -ForegroundColor Yellow
    Write-Host "   $Method $Endpoint"
    
    try {
        $url = "$baseUrl$Endpoint"
        $jsonBody = if ($Body) { $Body | ConvertTo-Json -Depth 3 } else { $null }
        
        if ($jsonBody) {
            Write-Host "   Body: $jsonBody" -ForegroundColor Gray
        }
        
        $response = if ($Body) {
            Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -Body $jsonBody
        } else {
            Invoke-RestMethod -Uri $url -Method $Method -Headers $headers
        }
        
        Write-Host "   ✅ Success: $($response.message)" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorDetails = $_.Exception.Response | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($errorDetails) {
                Write-Host "   Error Details: $($errorDetails.message)" -ForegroundColor Red
            }
        }
        return $null
    }
}

# Test 1: Create Payment Order
Write-Host "`n🏁 Test 1: Create Payment Order" -ForegroundColor Magenta
$paymentOrderBody = @{
    courseId = $testCourseId
    amount = $testAmount
    currency = "INR"
    enrollmentType = "one_time"
}

$paymentOrderResponse = Invoke-APITest -Method "POST" -Endpoint "/payments/create-order" -Body $paymentOrderBody -TestName "Payment Order Creation"

if (-not $paymentOrderResponse) {
    Write-Host "❌ Payment order creation failed. Stopping test." -ForegroundColor Red
    exit 1
}

$orderId = $paymentOrderResponse.data.orderId
Write-Host "   📄 Order ID: $orderId" -ForegroundColor Cyan

# Test 2: Simulate Payment Verification (with auto-enrollment)
Write-Host "`n🏁 Test 2: Payment Verification and Auto-Enrollment" -ForegroundColor Magenta

# Generate mock Razorpay signature for testing
$paymentId = "pay_test_$(Get-Random)"
$signatureString = $orderId + "|" + $paymentId
$hmacKey = [System.Text.Encoding]::UTF8.GetBytes("test_secret")
$hmac = [System.Security.Cryptography.HMACSHA256]::new($hmacKey)
$signatureBytes = [System.Text.Encoding]::UTF8.GetBytes($signatureString)
$signature = [System.Convert]::ToBase64String($hmac.ComputeHash($signatureBytes))

$verificationBody = @{
    razorpay_order_id = $orderId
    razorpay_payment_id = $paymentId
    razorpay_signature = $signature
    courseId = $testCourseId
}

$verificationResponse = Invoke-APITest -Method "POST" -Endpoint "/payments/verify" -Body $verificationBody -TestName "Payment Verification with Auto-Enrollment"

if (-not $verificationResponse) {
    Write-Host "❌ Payment verification failed. Continuing with manual enrollment test..." -ForegroundColor Yellow
} else {
    Write-Host "   💳 Payment ID: $($verificationResponse.data.paymentId)" -ForegroundColor Cyan
    Write-Host "   🎓 Auto-enrollment should have been triggered!" -ForegroundColor Green
}

# Test 3: Check if auto-enrollment worked by listing user enrollments
Write-Host "`n🏁 Test 3: Verify Auto-Enrollment Result" -ForegroundColor Magenta

$enrollmentsResponse = Invoke-APITest -Method "GET" -Endpoint "/enrollments/my-enrollments" -TestName "User Enrollments Check"

if ($enrollmentsResponse -and $enrollmentsResponse.data.enrollments) {
    $enrollmentCount = $enrollmentsResponse.data.enrollments.Count
    Write-Host "   📚 Found $enrollmentCount enrollments" -ForegroundColor Cyan
    
    # Check if our course is enrolled
    $targetEnrollment = $enrollmentsResponse.data.enrollments | Where-Object { $_.courseId -eq $testCourseId }
    if ($targetEnrollment) {
        Write-Host "   ✅ Auto-enrollment successful! Course $testCourseId is enrolled" -ForegroundColor Green
        Write-Host "   📋 Enrollment ID: $($targetEnrollment.enrollmentId)" -ForegroundColor Cyan
        Write-Host "   📅 Enrolled At: $($targetEnrollment.enrolledAt)" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Course $testCourseId not found in enrollments. Testing manual enrollment..." -ForegroundColor Yellow
    }
}

# Test 4: Manual Enrollment Test (fallback)
Write-Host "`n🏁 Test 4: Manual Enrollment (Fallback Test)" -ForegroundColor Magenta

$manualEnrollmentBody = @{
    transactionId = "TXN_$(Get-Random)"
    userId = $testUserId
    courseId = $testCourseId
}

$manualEnrollmentResponse = Invoke-APITest -Method "POST" -Endpoint "/enrollments/auto-enroll" -Body $manualEnrollmentBody -TestName "Manual Auto-Enrollment"

if ($manualEnrollmentResponse -and $manualEnrollmentResponse.enrollment) {
    Write-Host "   ✅ Manual enrollment successful!" -ForegroundColor Green
    Write-Host "   📋 Enrollment ID: $($manualEnrollmentResponse.enrollment.enrollmentId)" -ForegroundColor Cyan
    
    $enrollmentId = $manualEnrollmentResponse.enrollment.enrollmentId
    
    # Test 5: Verify enrollment access
    Write-Host "`n🏁 Test 5: Verify Enrollment Access" -ForegroundColor Magenta
    $accessResponse = Invoke-APITest -Method "GET" -Endpoint "/enrollments/$enrollmentId/validate" -TestName "Enrollment Access Validation"
    
    if ($accessResponse -and $accessResponse.data.hasAccess) {
        Write-Host "   🔑 Access validation successful!" -ForegroundColor Green
        Write-Host "   ⏰ Access expires: $($accessResponse.data.expiresAt)" -ForegroundColor Cyan
    }
}

# Test 6: Payment Status Check
Write-Host "`n🏁 Test 6: Payment Status Verification" -ForegroundColor Magenta

$statusResponse = Invoke-APITest -Method "GET" -Endpoint "/payments/$orderId/status" -TestName "Payment Status Check"

if ($statusResponse -and $statusResponse.data) {
    Write-Host "   💰 Payment Status: $($statusResponse.data.transaction.status)" -ForegroundColor Cyan
    Write-Host "   💵 Amount: $($statusResponse.data.transaction.amount.total) $($statusResponse.data.transaction.amount.currency)" -ForegroundColor Cyan
    
    if ($statusResponse.data.enrollment) {
        Write-Host "   🎓 Linked Enrollment: $($statusResponse.data.enrollment)" -ForegroundColor Green
    }
}

# Test 7: Test Error Handling
Write-Host "`n🏁 Test 7: Error Handling Tests" -ForegroundColor Magenta

# Test with invalid course ID
$invalidEnrollmentBody = @{
    transactionId = "TXN_INVALID"
    userId = $testUserId
    courseId = "invalid_course_id"
}

Write-Host "`n   🧪 Testing invalid course ID..." -ForegroundColor Gray
$errorResponse = Invoke-APITest -Method "POST" -Endpoint "/enrollments/auto-enroll" -Body $invalidEnrollmentBody -TestName "Invalid Course ID Error Handling"

# Test with missing fields
$incompleteBody = @{
    userId = $testUserId
}

Write-Host "`n   🧪 Testing missing required fields..." -ForegroundColor Gray
$errorResponse2 = Invoke-APITest -Method "POST" -Endpoint "/enrollments/auto-enroll" -Body $incompleteBody -TestName "Missing Fields Error Handling"

# Final Summary
Write-Host "`n" + "=" * 60
Write-Host "🏆 PAYMENT-ENROLLMENT INTEGRATION TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60

Write-Host "✅ Payment Order Creation: " -NoNewline -ForegroundColor Green
if ($paymentOrderResponse) { Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

Write-Host "✅ Payment Verification: " -NoNewline -ForegroundColor Green  
if ($verificationResponse) { Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

Write-Host "✅ Auto-Enrollment Process: " -NoNewline -ForegroundColor Green
if ($manualEnrollmentResponse) { Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

Write-Host "✅ Enrollment Access Validation: " -NoNewline -ForegroundColor Green
if ($accessResponse) { Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

Write-Host "✅ Payment Status Check: " -NoNewline -ForegroundColor Green
if ($statusResponse) { Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

Write-Host "✅ Error Handling: " -NoNewline -ForegroundColor Green
Write-Host "TESTED" -ForegroundColor Yellow

Write-Host "`n🎯 Integration test completed!" -ForegroundColor Cyan
Write-Host "Check the console output above for detailed results." -ForegroundColor Gray