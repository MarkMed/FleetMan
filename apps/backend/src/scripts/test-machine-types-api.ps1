# Machine Types API - Quick Test Script (PowerShell)
# Este script prueba los endpoints CRUD de tipos de máquina

$BaseUrl = "http://localhost:3001/api"
$Headers = @{ "Content-Type" = "application/json" }

Write-Host "🧪 Testing Machine Types API..." -ForegroundColor Cyan
Write-Host ""

# 1. Login para obtener token
Write-Host "1. Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "logintest@example.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" `
        -Method POST `
        -Headers $Headers `
        -Body $loginBody

    $token = $loginResponse.data.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Login failed. Make sure the server is running and user exists." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Listar tipos de máquina
Write-Host "2. Listing all machine types..." -ForegroundColor Yellow
try {
    $listResponse = Invoke-RestMethod -Uri "$BaseUrl/v1/machine-types" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    $listResponse | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "❌ Failed to list machine types" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 3. Crear un tipo de máquina
Write-Host "3. Creating a new machine type..." -ForegroundColor Yellow
try {
    $createBody = @{
        name = "Test Type PowerShell"
        language = "en"
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "$BaseUrl/v1/machine-types" `
        -Method POST `
        -Headers $authHeaders `
        -Body $createBody

    $createResponse | ConvertTo-Json -Depth 10
    $machineTypeId = $createResponse.data.id
    Write-Host ""
} catch {
    Write-Host "❌ Failed to create machine type" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 4. Listar tipos filtrados por idioma
Write-Host "4. Listing machine types filtered by language (es)..." -ForegroundColor Yellow
try {
    $filterResponse = Invoke-RestMethod -Uri "$BaseUrl/v1/machine-types?language=es" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    $filterResponse | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "❌ Failed to filter machine types" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 5. Actualizar el tipo creado
if ($machineTypeId) {
    Write-Host "5. Updating machine type..." -ForegroundColor Yellow
    try {
        $updateBody = @{
            name = "Updated Test Type PowerShell"
        } | ConvertTo-Json

        $updateResponse = Invoke-RestMethod -Uri "$BaseUrl/v1/machine-types/$machineTypeId" `
            -Method PUT `
            -Headers $authHeaders `
            -Body $updateBody

        $updateResponse | ConvertTo-Json -Depth 10
        Write-Host ""
    } catch {
        Write-Host "❌ Failed to update machine type" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }

    # 6. Eliminar el tipo creado
    Write-Host "6. Deleting machine type..." -ForegroundColor Yellow
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$BaseUrl/v1/machine-types/$machineTypeId" `
            -Method DELETE `
            -Headers @{ "Authorization" = "Bearer $token" }

        $deleteResponse | ConvertTo-Json -Depth 10
        Write-Host ""
    } catch {
        Write-Host "❌ Failed to delete machine type" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipping update/delete - no ID captured" -ForegroundColor Yellow
}

Write-Host "✅ Test completed!" -ForegroundColor Green
