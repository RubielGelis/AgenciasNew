[Setup]
AppName=AgenciasNew NextJS (Actualización)
AppVersion=1.0
AppPublisher=Agencias Corporation
DefaultDirName=F:\AgenciasNew_Sistema
DefaultGroupName=AgenciasNew
OutputDir=F:\Proyectos\AgenciasNew\Instalador
OutputBaseFilename=update_setup
Compression=zip
SolidCompression=no
PrivilegesRequired=admin
AllowNoIcons=yes
DisableProgramGroupPage=yes
DisableDirPage=no
UsePreviousAppDir=yes
ArchitecturesInstallIn64BitMode=x64
ArchitecturesAllowed=x64

[Files]
Source: "F:\Proyectos\AgenciasNew\RELEASE_AGENCIAS\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "F:\Proyectos\AgenciasNew\deploy\Update_Agencias.ps1"; DestDir: "{app}"; Flags: ignoreversion

[Code]
function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: Integer;
begin
  // Detener el servicio de Windows antes del copiado de archivos para liberar bloqueos
  Exec('powershell.exe', '-ExecutionPolicy Bypass -Command "Stop-Service -Name AgenciasNew_NextJS -Force -ErrorAction SilentlyContinue"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Result := '';
end;

[Run]
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -WindowStyle Hidden -File ""{app}\Update_Agencias.ps1"""; Flags: waituntilterminated runhidden; StatusMsg: "Aplicando actualización de archivos y base de datos... (Por favor espere)"
Filename: "http://localhost:3000/"; Flags: shellexec runasoriginaluser postinstall; Description: "Abrir la plataforma AgenciasNew actualizada en mi Navegador"
