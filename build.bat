@ECHO OFF

python src/common/res/features/l10n/init.py
python populateFeaturesFiles.py
python lib/kango-framework-latest/kango.py build .

echo "[   INFO] Moving Safari extension icons into place..."
pushd output\safari\*.safariextension\icons
  del button.png
  move button-safari.png button.png
  move button-safari@2x.png button@2x.png
popd
