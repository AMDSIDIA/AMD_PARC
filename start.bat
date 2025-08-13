@echo off
echo ========================================
echo Demarrage AMD Parc Informatique
echo ========================================

echo.
echo Installation des dependances backend...
cd backend
npm install
cd ..

echo.
echo Installation des dependances frontend...
npm install

echo.
echo Demarrage du backend...
start "Backend AMD" cmd /k "cd backend && npm run dev && echo. && echo Backend arrete. Appuyez sur une touche... && pause"

echo.
echo Attente de 3 secondes...
timeout /t 3 /nobreak > nul

echo.
echo Demarrage du frontend...
start "Frontend AMD" cmd /k "npm run dev && echo. && echo Frontend arrete. Appuyez sur une touche... && pause"

echo.
echo ========================================
echo Projet demarre !
echo ========================================
echo.
echo Frontend : http://localhost:3000
echo Backend  : http://localhost:5000
echo.
echo Les dependances ont ete installees automatiquement.
echo.
echo PAUSE : Appuyez sur une touche pour fermer cette fenetre...
echo Les serveurs continuent de fonctionner en arriere-plan.
pause 