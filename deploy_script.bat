@echo off
echo.
echo =========================================
echo [1/5] Staging all files for Git...
echo =========================================
git add .
if %errorlevel% neq 0 (
    echo ERROR: git add failed.
    exit /b %errorlevel%
)

echo.
echo =========================================
echo [2/5] Committing changes...
echo =========================================
git commit -m "feat: refactor main hero UI and sync latest development progress"
if %errorlevel% neq 0 (
    echo ERROR: git commit failed.
    exit /b %errorlevel%
)

echo.
echo =========================================
echo [3/5] Pushing to remote Git repository...
echo =========================================
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: git push failed.
    exit /b %errorlevel%
)

echo.
echo =========================================
echo [4/5] Building React project with Vite...
echo =========================================
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: build failed.
    exit /b %errorlevel%
)

echo.
echo =========================================
echo [5/5] Deploying to Firebase Hosting...
echo =========================================
call firebase deploy
if %errorlevel% neq 0 (
    echo ERROR: firebase deploy failed.
    exit /b %errorlevel%
)

echo.
echo =========================================
echo ✅ Process completed successfully!
echo =========================================
