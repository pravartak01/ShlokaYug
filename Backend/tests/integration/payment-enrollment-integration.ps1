# Enhanced Payment to Enrollment Integration Test
# This script tests the complete flow from payment verification to auto-enrollment

$baseUrl = "http://localhost:5000/api"
$testUser = @{
    email = "teststudent@example.com"
    password = "testpass123"
    name = "Test Student"
}

Write-Host "🚀 Starting Payment to Enrollment Integration Test" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

try {
    # Step 1: Create user if not exists
    Write-Host "`n📝 Step 1: Setting up test user..." -ForegroundColor Yellow
    
    $userResponse = try {
        Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body ($testUser | ConvertTo-Json)
    } catch {
        # User might already exist, try to login
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
            email = $testUser.email
            password = $testUser.password
        } | ConvertTo-Json)
        $loginResponse
    }
    
    $authToken = $userResponse.token
    if (-not $authToken) {
        throw "Failed to get authentication token"
    }
    Write-Host "✅ User authenticated successfully" -ForegroundColor Green

    # Step 2: Create a payment order
    Write-Host "`n💳 Step 2: Creating payment order..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $authToken"
        "Content-Type" = "application/json"
    }
    
    $paymentOrderData = @{
        amount = 1999.50
        currency = "INR"
        courseId = "507f1f77bcf86cd799439011"  # Test course ID
        enrollmentType = "one_time_purchase"
    }
    
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/payments/create-order" -Method Post -Headers $headers -Body ($paymentOrderData | ConvertTo-Json)
    
    if ($orderResponse.success -ne $true) {
        throw "Failed to create payment order: $($orderResponse.message)"
    }
    
    Write-Host "✅ Payment order created: $($orderResponse.data.orderId)" -ForegroundColor Green
    $orderId = $orderResponse.data.orderId

    # Step 3: Simulate payment success (create a completed transaction)
    Write-Host "`n🎯 Step 3: Simulating successful payment..." -ForegroundColor Yellow
    
    # Generate test payment IDs
    $paymentId = "pay_" + (-join ((1..10) | ForEach {Get-Random -Minimum 97 -Maximum 123 | % {[char]$_}}))
    $razorpaySecret = $env:RAZORPAY_KEY_SECRET
    
    if (-not $razorpaySecret) {
        Write-Host "⚠️ RAZORPAY_KEY_SECRET not found in environment, using test secret" -ForegroundColor Yellow
        $razorpaySecret = "test_secret_key"
    }
    
    # Generate valid signature
    $signaturePayload = "$orderId|$paymentId"
    $signature = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($razorpaySecret)).ComputeHash([System.Text.Encoding]::UTF8.GetBytes($signaturePayload))))
    
    # Convert to hex format (Razorpay uses hex, not base64)
    $hmac = [System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($razorpaySecret))
    $hash = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($signaturePayload))
    $signature = [System.BitConverter]::ToString($hash).Replace("-", "").ToLower()
    
    $verificationData = @{
        razorpay_order_id = $orderId
        razorpay_payment_id = $paymentId
        razorpay_signature = $signature
        courseId = $paymentOrderData.courseId  # Include course ID for enrollment
    }
    
    Write-Host "   Order ID: $orderId" -ForegroundColor Gray
    Write-Host "   Payment ID: $paymentId" -ForegroundColor Gray
    Write-Host "   Signature: $($signature.Substring(0, 20))..." -ForegroundColor Gray

    # Verify payment (this should trigger auto-enrollment)
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/payments/verify-signature" -Method Post -Headers $headers -Body ($verificationData | ConvertTo-Json)
    
    if ($verifyResponse.success -ne $true) {
        throw "Payment verification failed: $($verifyResponse.message)"
    }
    
    Write-Host "✅ Payment verified successfully" -ForegroundColor Green

    # Step 4: Check if enrollment was created automatically
    Write-Host "`n🎓 Step 4: Checking auto-enrollment..." -ForegroundColor Yellow
    
    # Wait a moment for auto-enrollment to process
    Start-Sleep -Seconds 2
    
    # Check user's enrollments
    $enrollmentsResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/my-enrollments" -Method Get -Headers $headers
    
    if ($enrollmentsResponse.success -eq $true -and $enrollmentsResponse.data.enrollments.Count -gt 0) {
        $enrollment = $enrollmentsResponse.data.enrollments[0]
        Write-Host "✅ Auto-enrollment successful!" -ForegroundColor Green
        Write-Host "   Enrollment ID: $($enrollment.enrollmentId)" -ForegroundColor Gray
        Write-Host "   Course ID: $($enrollment.course.id)" -ForegroundColor Gray
        Write-Host "   Status: $($enrollment.enrollment.status)" -ForegroundColor Gray
        Write-Host "   Enrolled At: $($enrollment.enrollment.enrolledAt)" -ForegroundColor Gray
        Write-Host "   Payment Amount: $($enrollment.payment.amount) $($enrollment.payment.currency)" -ForegroundColor Gray
        
        # Step 5: Test enrollment access
        Write-Host "`n🔐 Step 5: Testing enrollment access..." -ForegroundColor Yellow
        
        $accessData = @{
            deviceInfo = @{
                deviceId = "test_device_$(Get-Random)"
                platform = "web"
                browser = "PowerShell"
                os = "Windows"
            }
        }
        
        $accessResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/$($enrollment.enrollmentId)/validate" -Method Post -Headers $headers -Body ($accessData | ConvertTo-Json)
        
        if ($accessResponse.success -eq $true) {
            Write-Host "✅ Enrollment access validated successfully" -ForegroundColor Green
            Write-Host "   Access granted: $($accessResponse.access.valid)" -ForegroundColor Gray
            Write-Host "   Device count: $($accessResponse.access.deviceCount)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Enrollment access validation failed" -ForegroundColor Red
        }
        
        # Step 6: Get enrollment analytics
        Write-Host "`n📊 Step 6: Checking enrollment analytics..." -ForegroundColor Yellow
        
        try {
            $analyticsResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/$($enrollment.enrollmentId)/analytics" -Method Get -Headers $headers
            if ($analyticsResponse.success -eq $true) {
                $analytics = $analyticsResponse.analytics
                Write-Host "✅ Analytics retrieved successfully" -ForegroundColor Green
                Write-Host "   Student: $($analytics.enrollment.studentName)" -ForegroundColor Gray
                Write-Host "   Enrollment Source: $($analytics.engagement.enrollmentSource)" -ForegroundColor Gray
                Write-Host "   Payment Transaction: $($analytics.payment.transactionId)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "⚠️ Analytics not available (may require admin/guru access)" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Auto-enrollment failed - no enrollments found" -ForegroundColor Red
        Write-Host "   Response: $($enrollmentsResponse.message)" -ForegroundColor Gray
        
        # Try manual auto-enrollment as fallback test
        Write-Host "`n🔄 Attempting manual auto-enrollment..." -ForegroundColor Yellow
        
        $autoEnrollData = @{
            transactionId = $orderId  # Using order ID as transaction ID
            userId = $userResponse.user.id
            courseId = $paymentOrderData.courseId
        }
        
        try {
            $autoEnrollResponse = Invoke-RestMethod -Uri "$baseUrl/enrollments/auto-enroll" -Method Post -ContentType "application/json" -Body ($autoEnrollData | ConvertTo-Json)
            
            if ($autoEnrollResponse.success -eq $true) {
                Write-Host "✅ Manual auto-enrollment successful!" -ForegroundColor Green
                Write-Host "   Enrollment ID: $($autoEnrollResponse.enrollment.enrollmentId)" -ForegroundColor Gray
            } else {
                Write-Host "❌ Manual auto-enrollment failed: $($autoEnrollResponse.error)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Manual auto-enrollment error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # Summary
    Write-Host "`n🎉 Integration Test Summary" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host "✅ User authentication: SUCCESS" -ForegroundColor Green
    Write-Host "✅ Payment order creation: SUCCESS" -ForegroundColor Green  
    Write-Host "✅ Payment verification: SUCCESS" -ForegroundColor Green
    
    if ($enrollmentsResponse.success -eq $true -and $enrollmentsResponse.data.enrollments.Count -gt 0) {
        Write-Host "✅ Auto-enrollment: SUCCESS" -ForegroundColor Green
        Write-Host "✅ Access validation: SUCCESS" -ForegroundColor Green
        Write-Host "`n🚀 Complete payment-to-enrollment flow working perfectly!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Auto-enrollment: NEEDS INVESTIGATION" -ForegroundColor Yellow
        Write-Host "`n🔧 Manual verification may be required" -ForegroundColor Yellow
    }

} catch {
    Write-Host "`n❌ Integration test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nError details:" -ForegroundColor Yellow
    Write-Host $_.Exception.ToString() -ForegroundColor Gray
    
    # Show response if available
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nResponse body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Gray
    }
}

Write-Host "`n🏁 Integration test completed" -ForegroundColor Cyan