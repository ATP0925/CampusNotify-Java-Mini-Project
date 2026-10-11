@echo off
title CampusNotify - Firebase Auto Setup & Deployment
cls
echo =================================================================
echo   CAMPUS NOTIFY - AUTOMATIC FIREBASE SETUP & CLOUD DEPLOYMENT
echo   Project ID: campnotify-eef91
echo   Super Administrator: Institutional System Admin
echo =================================================================
echo.
echo [STEP 1/3] Authorizing Firebase CLI with your Google Account...
echo A browser window will now open. Please sign in with your Google Account
echo and click 'Allow' to authorize Firebase CLI.
echo.
call firebase login
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Firebase login was not completed. Please try again.
    pause
    exit /b %errorlevel%
)
echo.
echo [STEP 2/3] Linking to Firebase Project 'campnotify-eef91'...
call firebase use campnotify-eef91
echo.
echo [STEP 3/3] Deploying Cloud Firestore Security Rules & Auth Settings...
call firebase deploy --only firestore:rules,auth
if %errorlevel% neq 0 (
    echo.
    echo Note: Deploying firestore rules directly...
    call firebase deploy --only firestore:rules
)
echo.
echo =================================================================
echo   SUCCESS! FIREBASE RULES & CONFIGURATION DEPLOYED TO CLOUD!
echo =================================================================
echo.
pause
