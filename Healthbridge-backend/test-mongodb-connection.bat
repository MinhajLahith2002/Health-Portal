@echo off
REM MongoDB Connection Testing Script for Windows
REM This script tests the MongoDB connection for Health Bridge Backend

echo =========================================
echo MongoDB Connection Test Script (Windows)
echo =========================================
echo.

REM Test 1: Check if Maven is installed
echo Test 1: Checking Maven installation...
where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Maven is installed
    mvn -v | findstr /R ".*"
) else (
    echo [ERROR] Maven is not installed
    echo Please install Maven first
    pause
    exit /b 1
)
echo.

REM Test 2: Check if Java is installed
echo Test 2: Checking Java installation...
where java >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Java is installed
    java -version
) else (
    echo [ERROR] Java is not installed
    pause
    exit /b 1
)
echo.

REM Test 3: Run MongoDB connection tests
echo Test 3: Running MongoDB connection tests...
echo This may take a few moments...
echo.

cd /d "%~dp0"

REM Run the tests
mvn test -Dtest=MongoDBConnectionTest -q

if %ERRORLEVEL% EQU 0 (
    echo [OK] MongoDB Connection Tests PASSED
    echo.
    echo All tests completed successfully!
) else (
    echo [ERROR] MongoDB Connection Tests FAILED
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo   1. MongoDB cluster is not running
    echo   2. Invalid credentials
    echo   3. Network/firewall blocking connection
    echo   4. IP address not whitelisted in MongoDB Atlas
)

echo.
echo =========================================
echo Next Steps:
echo =========================================
echo 1. Start the application:
echo    mvn spring-boot:run
echo.
echo 2. Test health check endpoints:
echo    curl http://localhost:8088/api/health
echo    curl http://localhost:8088/api/health/mongodb
echo    curl http://localhost:8088/api/health/full
echo.
echo =========================================
pause
