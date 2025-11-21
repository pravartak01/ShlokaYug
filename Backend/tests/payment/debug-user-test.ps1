# DEBUG VERSION - PAYMENT GATEWAY TEST
param([string]$BaseUrl = "http://localhost:5000/api/v1")

$timestamp = [Math]::Floor((Get-Date -UFormat %s))
$email = "paytest$timestamp@test.com"

$userJson = @{
    firstName = "Payment"
    lastName = "Tester" 
    username = "paytest$timestamp"
    email = $email
    password = "PayTest123!"
    role = "student"
} | ConvertTo-Json

Write-Host "Testing with JSON body:" -ForegroundColor Cyan
Write-Host $userJson -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -ContentType "application/json" -Body $userJson
    Write-Host "Success! User created" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
} catch {
    Write-Host "Error details:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}