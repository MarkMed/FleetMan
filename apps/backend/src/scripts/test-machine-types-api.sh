#!/bin/bash

# Machine Types API - Quick Test Script
# Este script prueba los endpoints CRUD de tipos de máquina

BASE_URL="http://localhost:3001/api"
CONTENT_TYPE="Content-Type: application/json"

echo "🧪 Testing Machine Types API..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Login para obtener token
echo -e "${YELLOW}1. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{"email": "logintest@example.com", "password": "password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed. Make sure the server is running and user exists.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

# 2. Listar tipos de máquina
echo -e "${YELLOW}2. Listing all machine types...${NC}"
curl -s -X GET "$BASE_URL/v1/machine-types" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 3. Crear un tipo de máquina
echo -e "${YELLOW}3. Creating a new machine type...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/machine-types" \
  -H "Authorization: Bearer $TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{"name": "Test Type", "language": "en"}')

echo $CREATE_RESPONSE | jq '.'

MACHINE_TYPE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo ""

# 4. Listar tipos filtrados por idioma
echo -e "${YELLOW}4. Listing machine types filtered by language (es)...${NC}"
curl -s -X GET "$BASE_URL/v1/machine-types?language=es" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 5. Actualizar el tipo creado
if [ ! -z "$MACHINE_TYPE_ID" ]; then
  echo -e "${YELLOW}5. Updating machine type...${NC}"
  curl -s -X PUT "$BASE_URL/v1/machine-types/$MACHINE_TYPE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "$CONTENT_TYPE" \
    -d '{"name": "Updated Test Type"}' | jq '.'
  echo ""

  # 6. Eliminar el tipo creado
  echo -e "${YELLOW}6. Deleting machine type...${NC}"
  curl -s -X DELETE "$BASE_URL/v1/machine-types/$MACHINE_TYPE_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""
else
  echo -e "${RED}⚠️  Skipping update/delete - no ID captured${NC}"
fi

echo -e "${GREEN}✅ Test completed!${NC}"
