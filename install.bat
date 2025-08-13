@echo off
echo ========================================
echo Installation AMD Parc Informatique
echo ========================================

echo.
echo 1. Installation des dependances frontend...
npm install

echo.
echo 2. Installation des dependances backend...
cd backend
npm install
cd ..

echo.
echo 3. Creation du fichier .env.local...
echo NEXT_PUBLIC_API_URL=http://localhost:5000 > .env.local

echo.
echo ========================================
echo Installation terminee !
echo ========================================
echo.
echo Pour demarrer le projet :
echo 1. Ouvrir un terminal et lancer : npm run dev
echo 2. Ouvrir un autre terminal et lancer : cd backend && npm run dev
echo.
echo Frontend : http://localhost:3000
echo Backend  : http://localhost:5000
echo.
pause 