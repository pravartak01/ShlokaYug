# Test if Course Exists
Write-Host "Checking if test course exists..." -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api/v1"
$courseId = "507f1f77bcf86cd799439022"

# Test if course exists
try {
    $courseResponse = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId" -Method GET
    Write-Host "Course found: $($courseResponse.data.course.title)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "Course not found - creating test course..." -ForegroundColor Yellow
        
        # First, need to login to get guru token
        $loginBody = @{
            identifier = "test@example.com"
            password = "Test123!@#"
        } | ConvertTo-Json
        
        $headers = @{ "Content-Type" = "application/json" }
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginBody
            $token = $loginResponse.token
            Write-Host "Logged in successfully" -ForegroundColor Green
            
            # Check user role
            Write-Host "User role: $($loginResponse.data.user.role)" -ForegroundColor Cyan
            
        } catch {
            Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Course check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Cyan