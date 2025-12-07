@echo off
call "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\VsDevCmd.bat" -startdir=none -arch=x64 -host_arch=x64
cl /EHsc /std:c++20 sas.cpp /D_UNICODE /DUNICODE /link /SUBSYSTEM:WINDOWS /entry:wmainCRTStartup
