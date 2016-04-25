@ECHO OFF

echo "[   INFO] Checking code style with JSCS..."
npm run jscs --silent || exit

# Populate feature files like feed changes by reading through the code and hooking up
# all the calls we need, as well as processing settings files
python populateFeaturesFiles.py

# Transpile the source/ directory, putting the files in src/ which is where Kango expects to see them.
echo "[   INFO] Transpiling code with Babel on ES2015 preset..."
rd /s /q src
npm run babel --silent || exit

# Copy any non JS files across that babel didn't bring with it. Ignore existing files we just transpiled.
robocopy source src /E /XC /XN /XO

# Run the Kango build.
python lib\kango-framework-latest\kango.py build .

# Clean up.
rd /s /q src
