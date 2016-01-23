@ECHO OFF
python lib/kango-framework-latest/kango.py build .

echo "[   INFO] Moving Safari extension icon into place..."
pushd output\safari\*.safariextension\icons
  del button.png
  move button-safari.png button.png
popd
