@echo off
echo ========================================
echo    DEMARRAGE DU FRONTEND AMD SUPPORT
echo ========================================
echo.

echo Installation des dependances frontend...
call npm install

echo.
echo Demarrage du serveur frontend...
echo Le frontend sera accessible sur: http://localhost:3000
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

call npm run dev

pause 