Write-Host "`n========================================="
Write-Host "[1/5] Staging all files for Git..."
Write-Host "========================================="
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: git add failed."
    exit $LASTEXITCODE
}

Write-Host "`n========================================="
Write-Host "[2/5] Committing changes..."
Write-Host "========================================="
git commit -m "feat: refactor main hero UI and sync latest development progress"
if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: git commit failed."
    exit $LASTEXITCODE
}

Write-Host "`n========================================="
Write-Host "[3/5] Pushing to remote Git repository..."
Write-Host "========================================="
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: git push failed."
    exit $LASTEXITCODE
}

Write-Host "`n========================================="
Write-Host "[4/5] Building React project with Vite..."
Write-Host "========================================="
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: build failed."
    exit $LASTEXITCODE
}

Write-Host "`n========================================="
Write-Host "[5/5] Deploying to Firebase Hosting..."
Write-Host "========================================="
firebase deploy
if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: firebase deploy failed."
    exit $LASTEXITCODE
}

Write-Host "`n========================================="
Write-Host "✅ Process completed successfully!"
Write-Host "========================================="
