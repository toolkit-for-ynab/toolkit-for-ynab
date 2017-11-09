@ECHO OFF

echo [   INFO] Build starting at %TIME% %DATE%

rem Populate feature files like feed changes by reading through the code and hooking up
rem all the calls we need, as well as processing settings files
python generateFeedChanges.py

rem Generate legacy and new settings
call yarn gen-settings || goto :errexit

rem Generate features/index.js for the new features
call yarn gen-featureIndex || goto :errexit

echo [   INFO] Checking code style with ESLint...
call yarn legacy-eslint || goto :errexit

rem Run webpack to grab all new framework features
echo [   INFO] Webpacking new framework...
call yarn webpack || goto :errexit

rem Transpile the source/ directory, putting the files in src/ which is where Kango expects to see them.
echo [   INFO] Transpiling code with Babel on ES2015 preset...
rem rd /s /q src
call yarn legacy-babel || goto :errexit

rem Copy any non JS files across that babel didn't bring with it. Ignore existing files we just transpiled.
echo [   INFO] Copying non JS files...
robocopy source src /E /XC /XN /XO /NFL /NDL /NJH /NJS

rem Run the Kango build.
python lib\kango-framework-latest\kango.py build .

rem Clean up.
rd /s /q src

goto :exit

:errexit
echo Build errors encountered

:exit
echo [   INFO] Build finished at %TIME% %DATE%
