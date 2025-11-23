# Simple Test for Enrollment Integration
# Test the enrollment endpoints

$baseUrl = "http://localhost:5000"

Write-Host "🧪 Testing Enrollment Integration" -ForegroundColor Cyan

# Test 1: Auto-enrollment endpoint (should handle missing transaction gracefully)
Write-Host "`n1. Testing auto-enrollment endpoint..." -ForegroundColor Green

$payload = @{
    transactionId = "TXN_12345678_TEST01"
    userId = "507f1f77bcf86cd799439012"
    courseId = "507f1f77bcf86cd799439011"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/enrollments/auto-enroll" -Method Post -ContentType "application/json" -Body $payload
    Write-Host "✅ Auto-enrollment response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected error (transaction not found): $($errorResponse.error)" -ForegroundColor Yellow
}

Write-Host "`n🏁 Enrollment endpoint test completed!" -ForegroundColor Cyan