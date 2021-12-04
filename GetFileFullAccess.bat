@echo off

rem set DEVELOPMENT_ENVIRONMENT=
BreakPoint 0
set "File=%1"
set "CUser=%2"
BreakPoint 1
set FileDefined=0
if defined File set FileDefined=1
set UserDefined=0
if defined CUser set UserDefined=1
BreakPoint 2
if %FileDefined%==0 goto err_arg
if %UserDefined%==0 set "CUser=%UserName%"
if "%File%"=="--help" goto help
if "%CUser%"=="--RunAs" ( pwsh -Command start "%0" -argumentlist '"%File%"','%USERNAME%' -Verb RunAs & exit /b)
BreakPoint 3

goto folder

:err_arg
echo Error arguments!
echo Try to use %0 --help to see usage.
exit /b 1

:help
echo Usage:
echo         %0 <FileName^|FolderName>
exit /b 0

:file
exit /b 0

:folder
BreakPoint takeown
rem ����������
takeown /F "%File%" /A /R /D Y
if NOT "%ERRORLEVEL%"=="0" (
color 04
echo �޷������ļ���������!��ȷ��ʹ�ù���ԱȨ�����д˽ű�!!
color
pause
exit /b 1
)
BreakPoint %CUser%
icacls "%File%" /grant %CUser%:F
icacls "%File%\*" /grant %CUser%:F
if NOT "%ERRORLEVEL%"=="0" (
color 04
echo �޷�����Ȩ��!��ȷ��ʹ�ù���ԱȨ�����д˽ű�!!
color
pause
exit /b 1
)
BreakPoint icacls
exit /b 0
