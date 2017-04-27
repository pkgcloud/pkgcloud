$username = $args[0]
$password = $args[1]
$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential $username, $securePassword
Enable-PSRemoting -Force
$scriptPath = ((new-object net.webclient).DownloadString('https://raw.githubusercontent.com/DarwinJS/ChocoPackages/master/openssh/InstallChoco_and_win32-openssh_with_server.ps1'))
Invoke-Command -ScriptBlock ([scriptblock]::Create($scriptPath)) -Credential $credential -ComputerName localhost
Disable-PSRemoting -Force