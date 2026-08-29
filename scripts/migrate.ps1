param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
    $DatabaseUrl = "postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable"
}

Get-ChildItem -Path "$PSScriptRoot\..\migrations" -Filter "*.sql" | Sort-Object Name | ForEach-Object {
    Write-Host "Applying $($_.Name)"
    psql $DatabaseUrl -f $_.FullName
}
