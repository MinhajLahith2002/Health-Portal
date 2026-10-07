#!/bin/bash

# MongoDB Connection Testing Script
# This script tests the MongoDB connection for Health Bridge Backend

echo "========================================="
echo "MongoDB Connection Test Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if Maven is installed
echo "Test 1: Checking Maven installation..."
if command -v mvn &> /dev/null; then
    echo -e "${GREEN}✅ Maven is installed${NC}"
    mvn -v | head -1
else
    echo -e "${RED}❌ Maven is not installed${NC}"
    echo "Please install Maven first"
    exit 1
fi
echo ""

# Test 2: Check if Java is installed
echo "Test 2: Checking Java installation..."
if command -v java &> /dev/null; then
    echo -e "${GREEN}✅ Java is installed${NC}"
    java -version
else
    echo -e "${RED}❌ Java is not installed${NC}"
    exit 1
fi
echo ""

# Test 3: Run MongoDB connection tests
echo "Test 3: Running MongoDB connection tests..."
echo -e "${YELLOW}This may take a few moments...${NC}"
echo ""

cd "$(dirname "$0")" || exit 1

# Run the tests
mvn test -Dtest=MongoDBConnectionTest -q

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MongoDB Connection Tests PASSED${NC}"
    echo ""
    echo "All tests completed successfully!"
else
    echo -e "${RED}❌ MongoDB Connection Tests FAILED${NC}"
    echo ""
    echo "Please check the error messages above."
    echo "Common issues:"
    echo "  1. MongoDB cluster is not running"
    echo "  2. Invalid credentials"
    echo "  3. Network/firewall blocking connection"
    echo "  4. IP address not whitelisted in MongoDB Atlas"
fi

echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo "1. Start the application:"
echo "   mvn spring-boot:run"
echo ""
echo "2. Test health check endpoints:"
echo "   curl http://localhost:8088/api/health"
echo "   curl http://localhost:8088/api/health/mongodb"
echo "   curl http://localhost:8088/api/health/full"
echo ""
echo "========================================="
