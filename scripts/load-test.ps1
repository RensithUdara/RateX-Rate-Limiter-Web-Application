param(
    [string]$Url = "http://localhost:8080/v1/products",
    [int]$Requests = 200,
    [int]$Concurrency = 40,
    [string]$ApiKey = ""
)

$allowed = 0
$rejected = 0
$errors = 0
$headers = @{}
if ($ApiKey) {
    $headers["X-API-Key"] = $ApiKey
}

1..$Requests | ForEach-Object -Parallel {
    try {
        $response = Invoke-WebRequest -Uri $using:Url -Headers $using:headers -SkipHttpErrorCheck
        [pscustomobject]@{ Status = [int]$response.StatusCode }
    } catch {
        [pscustomobject]@{ Status = 0 }
    }
} -ThrottleLimit $Concurrency | ForEach-Object {
    if ($_.Status -eq 200) { $allowed++ }
    elseif ($_.Status -eq 429) { $rejected++ }
    else { $errors++ }
}

[pscustomobject]@{
    Requests = $Requests
    Allowed = $allowed
    Rejected = $rejected
    Errors = $errors
}
