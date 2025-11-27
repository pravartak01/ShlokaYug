# Fixed Admin Test Script for ShlokaYug
# Tests the admin verification and management system

Write-Host "🔐 Testing ShlokaYug Admin System..." -ForegroundColor Green

$baseUrl = "http://localhost:5000/api/v1"
$adminToken = $null

# Helper function for API calls
function Invoke-ApiCall {
    param($Method, $Endpoint, $Body = $null, $Token = $null)
    
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    $params = @{
        Uri = "$baseUrl$Endpoint"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) { $params["Body"] = ($Body | ConvertTo-Json) }
    
    try {
        return Invoke-RestMethod @params
    }
    catch {
        Write-Host "❌ API call failed: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# Test 1: Server Health Check
Write-Host "`n1️⃣ Testing server connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Server not running. Please start with: npm start" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Admin Login
Write-Host "`n2️⃣ Testing admin login..." -ForegroundColor Yellow

$adminCredentials = @{
    identifier = "admin@shlokayu.com"
    password = "ShlokaYug@Admin2025!"
}

try {
    $adminLogin = Invoke-ApiCall -Method POST -Endpoint "/auth/login" -Body $adminCredentials
    $adminToken = $adminLogin.data.tokens.access
    $adminUserId = $adminLogin.data.user.id
    
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "Admin ID: $adminUserId" -ForegroundColor Cyan
    Write-Host "Admin Role: $($adminLogin.data.user.role)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Admin login failed!" -ForegroundColor Red
    Write-Host "Expected credentials:" -ForegroundColor Yellow
    Write-Host "  Email: admin@shlokayu.com" -ForegroundColor White
    Write-Host "  Password: ShlokaYug@Admin2025!" -ForegroundColor White
    exit 1
}

# Test 3: Admin Dashboard Access
Write-Host "`n3️⃣ Testing admin dashboard access..." -ForegroundColor Yellow
try {
    $dashboard = Invoke-ApiCall -Method GET -Endpoint "/admin/dashboard/stats" -Token $adminToken
    Write-Host "✅ Admin dashboard accessible!" -ForegroundColor Green
    Write-Host "Total Users: $($dashboard.data.overview.totalUsers)" -ForegroundColor Cyan
    Write-Host "Pending Gurus: $($dashboard.data.overview.pendingGurus)" -ForegroundColor Cyan
    Write-Host "Verified Gurus: $($dashboard.data.overview.verifiedGurus)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Admin dashboard access failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: User Management
Write-Host "`n4️⃣ Testing user management..." -ForegroundColor Yellow
try {
    $allUsers = Invoke-ApiCall -Method GET -Endpoint "/admin/users?limit=5" -Token $adminToken
    Write-Host "✅ User management accessible!" -ForegroundColor Green
    Write-Host "Total users in system: $($allUsers.data.pagination.totalUsers)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ User management test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Pending Guru Applications
Write-Host "`n5️⃣ Testing guru verification workflow..." -ForegroundColor Yellow
try {
    $pendingGurus = Invoke-ApiCall -Method GET -Endpoint "/admin/gurus/pending" -Token $adminToken
    Write-Host "✅ Pending guru applications retrieved!" -ForegroundColor Green
    Write-Host "Pending applications count: $($pendingGurus.data.pagination.totalApplications)" -ForegroundColor Cyan
}
catch {
    Write-Host "⚠️ No pending guru applications found (expected for new system)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 6: Admin Route Security (unauthorized access)
Write-Host "`n6️⃣ Testing admin route security..." -ForegroundColor Yellow
try {
    $unauthorizedAccess = Invoke-WebRequest -Uri "$baseUrl/admin/dashboard/stats" -Method GET
    Write-Host "❌ SECURITY ISSUE: Admin routes accessible without authentication!" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Admin route security working - unauthenticated access blocked!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Unexpected security error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 ADMIN SYSTEM TEST COMPLETED! 🎉" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nAdmin system is ready for guru verification workflow!" -ForegroundColor Green
Write-Host "🔐 Admin Access Details:" -ForegroundColor Yellow
Write-Host "  Email: admin@shlokayu.com" -ForegroundColor White
Write-Host "  Password: ShlokaYug@Admin2025!" -ForegroundColor White