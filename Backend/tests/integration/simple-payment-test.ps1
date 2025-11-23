# Simple Payment-Enrollment Integration Test
Write-Host "🧪 Payment-Enrollment Integration Test" -ForegroundColor Cyan
Write-Host "=" * 50

$baseUrl = "http://localhost:5000/api"
$testUserId = "507f1f77bcf86cd799439011"
$testCourseId = "507f1f77bcf86cd799439022"
$testAmount = 1999.50

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer test-jwt-token"
    "x-user-id" = $testUserId
    "x-user-role" = "student"
}

function Test-API {
    param([string]$Method, [string]$Endpoint, [hashtable]$Body, [string]$Name)
    
    Write-Host "`n🔍 $Name" -ForegroundColor Yellow
    try {
        $url = "$baseUrl$Endpoint"
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 3
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers
        }
        Write-Host "   ✅ Success: $($response.message)" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Create Payment Order
Write-Host "`n1️⃣ Testing Payment Order Creation" -ForegroundColor Magenta
$orderBody = @{
    courseId = $testCourseId
    amount = $testAmount
    currency = "INR"
}

$orderResult = Test-API -Method "POST" -Endpoint "/payments/create-order" -Body $orderBody -Name "Create Payment Order"

if ($orderResult) {
    $orderId = $orderResult.data.orderId
    Write-Host "   📄 Order ID: $orderId" -ForegroundColor Cyan
    
    # Test 2: Manual Auto-Enrollment 
    Write-Host "`n2️⃣ Testing Manual Auto-Enrollment" -ForegroundColor Magenta
    $enrollBody = @{
        transactionId = "TXN_TEST_$(Get-Random)"
        userId = $testUserId
        courseId = $testCourseId
    }
    
    $enrollResult = Test-API -Method "POST" -Endpoint "/enrollments/auto-enroll" -Body $enrollBody -Name "Auto-Enrollment"
    
    if ($enrollResult -and $enrollResult.enrollment) {
        $enrollmentId = $enrollResult.enrollment.enrollmentId
        Write-Host "   📋 Enrollment ID: $enrollmentId" -ForegroundColor Cyan
        
        # Test 3: Verify Enrollment Access
        Write-Host "`n3️⃣ Testing Enrollment Access" -ForegroundColor Magenta
        $accessResult = Test-API -Method "GET" -Endpoint "/enrollments/$enrollmentId/validate" -Name "Access Validation"
        
        if ($accessResult -and $accessResult.data.hasAccess) {
            Write-Host "   🔑 Access granted!" -ForegroundColor Green
        }
        
        # Test 4: List User Enrollments
        Write-Host "`n4️⃣ Testing User Enrollments List" -ForegroundColor Magenta
        $listResult = Test-API -Method "GET" -Endpoint "/enrollments/my-enrollments" -Name "List Enrollments"
        
        if ($listResult) {
            $count = $listResult.data.enrollments.Count
            Write-Host "   📚 Found $count enrollments" -ForegroundColor Cyan
        }
    }
}

# Test 5: Payment Status Check (using order ID)
Write-Host "`n5️⃣ Testing Payment Status" -ForegroundColor Magenta
if ($orderId) {
    $statusResult = Test-API -Method "GET" -Endpoint "/payments/$orderId/status" -Name "Payment Status Check"
    
    if ($statusResult) {
        Write-Host "   💰 Status: $($statusResult.data.transaction.status)" -ForegroundColor Cyan
    }
}

# Test 6: Error Handling
Write-Host "`n6️⃣ Testing Error Handling" -ForegroundColor Magenta
$invalidBody = @{
    transactionId = "INVALID"
    userId = "invalid"
    courseId = "invalid"
}

Test-API -Method "POST" -Endpoint "/enrollments/auto-enroll" -Body $invalidBody -Name "Invalid Data Test"

Write-Host "`n🏆 Test Summary Complete!" -ForegroundColor Cyan
Write-Host "Check results above for detailed status." -ForegroundColor Gray