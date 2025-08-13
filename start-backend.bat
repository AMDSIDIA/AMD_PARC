@echo off
echo ========================================
echo    DEMARRAGE DU BACKEND AMD SUPPORT
echo ========================================
echo.

cd backend

echo Installation des dependances backend...
call npm install

echo.
echo Demarrage du serveur backend...
echo Le backend sera accessible sur: http://localhost:5000
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

call npm start

pause 