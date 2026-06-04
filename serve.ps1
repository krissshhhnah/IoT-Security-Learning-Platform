# Standalone PowerShell Web Server for Cyber-Twin Dashboard
# Hosts index.html and assets on http://localhost:8000 to enable Web Serial and ES modules.

$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

Write-Host "Starting server..."
try {
    $listener.Start()
    Write-Host "=========================================================="
    Write-Host "  Cyber-Twin Dashboard is running at http://localhost:$port/"
    Write-Host "  Open this URL in Chrome or Edge to use Web Serial API."
    Write-Host "  Press Ctrl+C in this terminal to stop the server."
    Write-Host "=========================================================="
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }
        
        # Guard against path traversal
        $normalizedPath = $path.Replace("/", "\").TrimStart('\')
        $filePath = Join-Path (Get-Location) $normalizedPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # MIME mapping
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            switch ($ext) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css" }
                ".js"   { $contentType = "application/javascript" }
                ".svg"  { $contentType = "image/svg+xml" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found: $path")
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
}
catch {
    Write-Error $_
}
finally {
    $listener.Stop()
}
