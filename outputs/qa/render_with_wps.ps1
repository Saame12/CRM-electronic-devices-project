param([string]$InputDocument,[string]$OutputPdf)
$ErrorActionPreference = 'Stop'
$taskInputFile = [System.IO.Path]::GetFullPath($InputDocument)
$taskPdfFile = [System.IO.Path]::GetFullPath($OutputPdf)
$taskDocument = $null
$taskWordEngine = New-Object -ComObject KWPS.Application
try {
    $taskDocument = $taskWordEngine.Documents.Open($taskInputFile, $false, $true)
    $taskDocument.Repaginate()
    $taskDocument.ExportAsFixedFormat($taskPdfFile, 17)
    Write-Output ('PDF ready: ' + $taskPdfFile)
} finally {
    if ($null -ne $taskDocument) { $taskDocument.Close(0) }
}
