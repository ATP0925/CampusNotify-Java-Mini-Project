@echo off
title Campus Notify - Java Mini Project
echo ===================================================
echo       Campus Notify - Compiling and Running
echo ===================================================

:: Check for javac in PATH
where javac >nul 2>nul
if %errorlevel% equ 0 (
    set JAVAC_CMD=javac
    set JAVA_CMD=java
    goto compile
)

:: Check common JDK paths
if exist "C:\Program Files\Android\openjdk\jdk-21.0.8\bin\javac.exe" (
    set "JAVAC_CMD=C:\Program Files\Android\openjdk\jdk-21.0.8\bin\javac.exe"
    set "JAVA_CMD=C:\Program Files\Android\openjdk\jdk-21.0.8\bin\java.exe"
    goto compile
)

if exist "C:\Program Files (x86)\Android\openjdk\jdk-17.0.14\bin\javac.exe" (
    set "JAVAC_CMD=C:\Program Files (x86)\Android\openjdk\jdk-17.0.14\bin\javac.exe"
    set "JAVA_CMD=C:\Program Files (x86)\Android\openjdk\jdk-17.0.14\bin\java.exe"
    goto compile
)

echo [ERROR] Java Development Kit (javac) not found.
echo Please ensure JDK is installed and added to your system PATH.
pause
exit /b 1

:compile
echo [1/2] Compiling Java source files...
"%JAVAC_CMD%" src\*.java
if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed!
    pause
    exit /b %errorlevel%
)

echo [2/2] Launching Campus Notify...
echo ===================================================
"%JAVA_CMD%" -cp src Main

pause
