@echo off
chcp 65001 >nul
set "LLVM_MINGW=%LOCALAPPDATA%\Microsoft\WinGet\Packages\MartinStorsjo.LLVM-MinGW.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\llvm-mingw-20261020-ucrt-x86_64\bin"
set "PATH=%USERPROFILE%\.cargo\bin;%LLVM_MINGW%;%PATH%"
cd /d "%~dp0"
echo [Rust] Dang khoi dong PRM393 Quiz Server tai http://127.0.0.1:3000 ...
start "" "http://127.0.0.1:3000"
cargo run
pause
