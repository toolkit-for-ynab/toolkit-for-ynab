@ECHO OFF

python populateFeaturesFiles.py
python lib/kango-framework-latest/kango.py build .
