# Debug User Creation Issue
param([string]$BaseUrl = "http://localhost:5000/api/v1")

Write-Host "Debugging User Creation..." -ForegroundColor Yellow

# Test 1: Check server health
try {
    $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/health" -Method GET
    Write-Host "✓ Server health check: $($healthResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Server health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Create user with detailed error checking
$email = "debugtest$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
$userData = @{
    firstName = "Debug"
    lastName = "Test"
    email = $email
    username = "debugtest$(Get-Random -Minimum 1000 -Maximum 9999)"
    password = "Debug123!"
    role = "student"
}

Write-Host "Attempting to create user with data:" -ForegroundColor Cyan
Write-Host "Email: $($userData.email)"
Write-Host "Username: $($userData.username)"

try {
    $jsonData = $userData | ConvertTo-Json
    Write-Host "JSON Data: $jsonData" -ForegroundColor Gray
    
    $userResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $jsonData
    Write-Host "✓ User created successfully: $($userResponse.data.user.email)" -ForegroundColor Green
} catch {
    Write-Host "✗ User creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorDetails = $reader.ReadToEnd()
            Write-Host "Error Details: $errorDetails" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}