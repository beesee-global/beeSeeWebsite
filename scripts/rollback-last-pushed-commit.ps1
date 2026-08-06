[CmdletBinding()]
param(
    [string]$Commit,
    [switch]$Push
)

$ErrorActionPreference = 'Stop'

$repoRoot = (git rev-parse --show-toplevel).Trim()
if (-not $repoRoot) {
    throw 'Run this script from inside the Git repository.'
}
Set-Location -LiteralPath $repoRoot

$branch = (git branch --show-current).Trim()
if (-not $branch) {
    throw 'The repository is in detached HEAD state; rollback was not performed.'
}

$status = git status --porcelain
if ($status) {
    throw 'Rollback stopped because the working tree is not clean. Commit or save local changes first.'
}

if (-not $Commit) {
    $Commit = (git rev-parse HEAD).Trim()
}

$subject = (git log -1 --format='%s' $Commit).Trim()
if (-not $subject) {
    throw "Commit '$Commit' was not found."
}

Write-Host "Repository: $repoRoot"
Write-Host "Branch:     $branch"
Write-Host "Rollback:   $Commit ($subject)"
$confirmation = Read-Host 'Type ROLLBACK to create a safe revert commit'
if ($confirmation -cne 'ROLLBACK') {
    Write-Host 'Rollback cancelled.'
    exit 0
}

git revert --no-edit $Commit

if ($Push) {
    git push origin $branch
}

Write-Host 'Rollback completed using git revert. The original commit remains in history.'
