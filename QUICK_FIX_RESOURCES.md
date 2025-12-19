# Resources Klasörü Boş - Hızlı Çözüm

## Sorun

Extension binary'sinde Resources klasörü var ama içi boş. Bu yüzden Safari extension'ı tanımıyor.

## Çözüm: project.yml'i Düzelt

`project.yml` dosyasında Resources klasörünü `sources` yerine `resources` olarak ekleyin:

```yaml
Toolkit for YNAB Extension:
  resources:
    - path: Extension/Resources
      type: folder
```

## Adımlar

1. **project.yml'i güncelle** (zaten yapıldı)

2. **Xcode projesini yeniden oluştur:**

   ```bash
   cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari
   xcodegen generate
   ```

3. **Xcode'da Clean Build:**

   - **Product > Clean Build Folder** (Cmd+Shift+K)
   - **Product > Build** (Cmd+B)

4. **Build başarılı olduktan sonra kontrol et:**

   ```bash
   ls -la ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"/Contents/PlugIns/"Toolkit for YNAB Extension.appex"/Contents/Resources/
   ```

   Artık `manifest.json` ve diğer dosyalar görünmeli.

5. **Uygulamayı çalıştır:**

   - Xcode'da **Product > Run** (Cmd+R) - Debug executable kapalı olmalı
   - Veya Terminal'den:
     ```bash
     open ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"
     ```

6. **Safari'de extension'ı etkinleştir:**
   - **Safari > Settings > Extensions**
   - **"Toolkit for YNAB"** extension'ını bulun
   - Checkbox'ı işaretleyerek etkinleştirin

## Kontrol

Extension binary'sinin içinde dosyalar var mı kontrol edin:

```bash
# Manifest var mı?
ls ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"/Contents/PlugIns/"Toolkit for YNAB Extension.appex"/Contents/Resources/manifest.json

# JavaScript dosyaları var mı?
ls ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"/Contents/PlugIns/"Toolkit for YNAB Extension.appex"/Contents/Resources/content-scripts/
```

Eğer dosyalar görünüyorsa, extension Safari'de görünmelidir!
