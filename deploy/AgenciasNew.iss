[Setup]
AppName=AgenciasNew NextJS
AppVersion=1.0
AppPublisher=Agencias Corporation
DefaultDirName=F:\AgenciasNew_Sistema
DefaultGroupName=AgenciasNew
OutputDir=F:\Proyectos\AgenciasNew\Instalador
OutputBaseFilename=setup
Compression=zip
SolidCompression=no
PrivilegesRequired=admin
AllowNoIcons=yes
DisableProgramGroupPage=yes
DisableDirPage=no
UsePreviousAppDir=no
ArchitecturesInstallIn64BitMode=x64
ArchitecturesAllowed=x64

[Files]
Source: "F:\Proyectos\AgenciasNew\RELEASE_AGENCIAS\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "F:\Proyectos\AgenciasNew\deploy\Setup_Agencias_Silent.ps1"; DestDir: "{app}"; Flags: ignoreversion

[Code]
var
  DbPage: TInputQueryWizardPage;

procedure InitializeWizard;
begin
  // Página Personalizada de Postgres (Añadida durante el proceso visual)
  DbPage := CreateInputQueryPage(wpSelectDir,
    'Configurar Base de Datos', 'Ingrese las credenciales de su PostgresSQL Local.',
    'Importante: El motor instalará todas las tablas (TABLEINI), funciones, parámetros iniciales y levantará el sistema sobre la BD indicada.' + #13#10#13#10 +
    'Si la BD no existe, intentará crearla. Use sus datos reales.');

  DbPage.Add('Servidor Host:', False);
  DbPage.Add('Puerto:', False);
  DbPage.Add('Base de Datos:', False);
  DbPage.Add('Usuario:', False);
  DbPage.Add('Contraseña:', True);

  DbPage.Values[0] := 'localhost';
  DbPage.Values[1] := '5432';
  DbPage.Values[2] := 'agencias_new';
  DbPage.Values[3] := 'postgres';
  DbPage.Values[4] := '111985';
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  DbUrl: String;
  Host, Port, DbName, User, Pass: String;
begin
  if CurStep = ssPostInstall then
  begin
    Host := DbPage.Values[0];
    Port := DbPage.Values[1];
    DbName := DbPage.Values[2];
    User := DbPage.Values[3];
    Pass := DbPage.Values[4];
    
    // Crear el archivo maestro .env productivo inyectando los datos de este instalador.
    DbUrl := 'DATABASE_URL="postgresql://' + User + ':' + Pass + '@' + Host + ':' + Port + '/' + DbName + '?schema=public"';
    SaveStringToFile(ExpandConstant('{app}\.env'), DbUrl + #13#10, False);
    SaveStringToFile(ExpandConstant('{app}\.env'), 'NEXTAUTH_SECRET="AgenciasProductionSecretKey2024_Security"' + #13#10, True);
    SaveStringToFile(ExpandConstant('{app}\.env'), 'NEXTAUTH_URL="http://localhost:3000"' + #13#10, True);
  end;
end;

[Run]
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -WindowStyle Hidden -File ""{app}\Setup_Agencias_Silent.ps1"""; Flags: waituntilterminated runhidden; StatusMsg: "Configurando Node.js, Windows Services y Enrutamiento IIS... (Por favor espere)"
Filename: "http://localhost:3000/"; Flags: shellexec runasoriginaluser postinstall; Description: "Abrir la plataforma AgenciasNew en mi Navegador"
