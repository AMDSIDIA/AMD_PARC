@echo off
echo ========================================
echo Verification du backend AMD
echo ========================================

echo.
echo Verification du port 5000...
netstat -an | findstr :5000
if %errorlevel% equ 0 (
    echo ✅ Backend detecte sur le port 5000
) else (
    echo ❌ Backend non detecte sur le port 5000
)

echo.
echo Test de connexion au backend...
curl -s http://localhost:5000/api/technicians > nul
if %errorlevel% equ 0 (
    echo ✅ Backend repond correctement
) else (
    echo ❌ Backend ne repond pas
)

echo.
echo ========================================
echo Actions possibles :
echo ========================================
echo 1. Si le backend ne fonctionne pas :
echo    - Executez start.bat pour tout demarrer
echo    - Ou cd backend && npm install && npm run dev
echo.
echo 2. Si le backend fonctionne :
echo    - Rechargez la page de gestion technique
echo    - Ou redemarrez le frontend
echo.
pause 