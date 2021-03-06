; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "BBZ-Cloud"
#define MyAppVersion "1.0"
#define MyAppPublisher "BBZ-RD-ECK"
#define MyAppURL "https://bbz-rd-eck.de"
#define MyAppExeName "BBZ-Cloud.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{F85DB0A3-5478-416B-B3E3-60E4F0B241AB}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableProgramGroupPage=yes
LicenseFile=D:\code\bbz-cloud\LICENSE
; Remove the following line to run in administrative install mode (install for all users.)
PrivilegesRequired=lowest
OutputDir=D:\OneDrive\Desktop
OutputBaseFilename=bbz-cloud-setup_stable
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "german"; MessagesFile: "compiler:Languages\German.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "D:\code\bbz-cloud\updater\bin\Release\net6.0-windows\publish\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\code\bbz-cloud\updater\bin\Release\net6.0-windows\de\*"; DestDir: "{app}\de"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\code\bbz-cloud\updater\bin\Release\net6.0-windows\publish\BBZ-Cloud.deps.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\code\bbz-cloud\updater\bin\Release\net6.0-windows\publish\BBZ-Cloud.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\code\bbz-cloud\updater\bin\Release\net6.0-windows\publish\BBZ-Cloud.pdb"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\code\bbz-cloud\updater\bin\Release\net6.0-windows\publish\BBZ-Cloud.runtimeconfig.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\code\bbz-cloud\updater\bin\Release\net6.0-windows\publish\channel"; DestDir: "{app}"; Flags: ignoreversion
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

