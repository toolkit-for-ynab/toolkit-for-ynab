# Extension Safari'de Görünmüyor - Final Troubleshooting

## Durum

- ✅ Code signing yapıldı
- ✅ Debug executable kaldırıldı
- ✅ Host app çalışıyor
- ✅ Extension binary oluşturuldu
- ❌ Extension Safari'de görünmüyor

## Adım Adım Kontrol ve Çözüm

### 1. Extension Binary İçindeki Resources Kontrolü

Extension binary'sinin içindeki Resources klasörü güncel olmalı:

```bash
# Extension binary içindeki manifest'i kontrol et
cat ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"/Contents/PlugIns/"Toolkit for YNAB Extension.appex"/Contents/Resources/manifest.json
```

Eğer bu dosya yoksa veya eskiyse, Xcode build'i Resources'ı kopyalamamış demektir.

### 2. Xcode'da Clean Build ve Yeniden Build

1. **Xcode'da:**

   - **Product > Clean Build Folder** (Cmd+Shift+K)
   - **Product > Build** (Cmd+B)
   - Build log'larını kontrol edin (View > Navigators > Show Report Navigator - Cmd+9)
   - "Copy Bundle Resources" adımında hata var mı kontrol edin

2. **Build başarılı olduktan sonra:**
   ```bash
   # Extension binary içindeki Resources'ı kontrol et
   ls -la ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"/Contents/PlugIns/"Toolkit for YNAB Extension.appex"/Contents/Resources/
   ```

### 3. project.yml'de Resources Ayarlarını Kontrol Et

`project.yml` dosyasında Extension target'ının Resources klasörünü doğru şekilde eklediğinden emin olun:

```yaml
Toolkit for YNAB Extension:
  sources:
    - path: Extension
      excludes:
        - '**/.DS_Store'
        - Resources
    - path: Extension/Resources
      buildPhase: resources
      type: folder
```

### 4. Xcode Projesini Sıfırdan Oluştur

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab

# 1. Yeni build
yarn build:safari

# 2. Resources kopyala
yarn safari:copy-resources

# 3. Xcode projesini sil ve yeniden oluştur
cd toolkit-for-ynab/safari
rm -rf "Toolkit for YNAB.xcodeproj"
xcodegen generate

# 4. Xcode'da aç
open "Toolkit for YNAB.xcodeproj"
```

### 5. Xcode'da Build Phases Kontrolü

1. Xcode'da projeyi açın
2. **TARGETS** altından **"Toolkit for YNAB Extension"** seçin
3. **Build Phases** sekmesine gidin
4. **Copy Bundle Resources** bölümünü kontrol edin
5. **Extension/Resources** klasörünün listede olduğundan emin olun
6. Yoksa **+** butonuna tıklayıp ekleyin

### 6. Safari'yi Tamamen Temizle ve Yeniden Başlat

```bash
# Safari'yi kapat
killall Safari

# Safari extension cache'ini temizle
rm -rf ~/Library/Safari/LocalStorage/*
rm -rf ~/Library/Safari/Extensions/*

# Uygulamayı çalıştır
open ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"
```

### 7. Console.app'te Detaylı Hata Kontrolü

1. **Console.app** açın
2. Sol taraftan **system.log** seçin
3. Sağ üstteki arama kutusuna şunları yazın:
   - `Toolkit for YNAB`
   - `Safari Extension`
   - `com.toolkitforynab`
   - `Extension.appex`
4. Hata mesajlarını kontrol edin

### 8. Extension Info.plist Kontrolü

Extension'ın Info.plist dosyasını kontrol edin:

```bash
cat ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"/Contents/PlugIns/"Toolkit for YNAB Extension.appex"/Contents/Info.plist
```

Şu alanlar olmalı:

- `CFBundleIdentifier`: `com.toolkitforynab.macos.Extension`
- `NSExtension` dictionary
- `NSExtensionPointIdentifier`: `com.apple.Safari.web-extension`

### 9. Manuel Extension Yükleme (Son Çare)

Eğer hiçbir şey işe yaramazsa:

1. **Safari'yi açın**
2. **Developer > Allow Unsigned Extensions** işaretleyin
3. **Developer > Add Temporary Extension...** menüsüne gidin
4. Extension binary'sini seçin:
   ```
   ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/Toolkit for YNAB Extension.appex
   ```

Bu geçici bir çözümdür ama extension'ın çalışıp çalışmadığını test etmenizi sağlar.

### 10. Xcode Build Log'larını Detaylı İncele

1. Xcode'da **View > Navigators > Show Report Navigator** (Cmd+9)
2. Son build'i seçin
3. **"Toolkit for YNAB Extension"** target'ını genişletin
4. **"Copy Bundle Resources"** adımını kontrol edin
5. Hata veya uyarı var mı bakın

## En Olası Sorun: Resources Kopyalanmıyor

Eğer extension binary'sinin içinde Resources klasörü yoksa veya boşsa:

### Çözüm A: Build Phases'e Manuel Ekle

1. Xcode'da **"Toolkit for YNAB Extension"** target'ını seçin
2. **Build Phases** sekmesine gidin
3. **Copy Bundle Resources** bölümünü genişletin
4. **+** butonuna tıklayın
5. **Add Other...** seçin
6. **Extension/Resources** klasörünü seçin
7. **Create folder references** seçin (Create groups değil!)
8. **Finish** butonuna tıklayın
9. Clean build yapın (Cmd+Shift+K, Cmd+B)

### Çözüm B: project.yml'i Güncelle

`project.yml` dosyasında Resources klasörünün doğru şekilde eklendiğinden emin olun. Eğer sorun devam ediyorsa, Resources'ı sources yerine resources olarak ekleyin.

## Kontrol Listesi

- [ ] Extension binary oluşturuldu mu?
- [ ] Extension binary içinde Resources klasörü var mı?
- [ ] Resources klasöründe manifest.json var mı?
- [ ] manifest.json güncel mi?
- [ ] Xcode Build Phases'de Resources eklendi mi?
- [ ] Build log'larında hata var mı?
- [ ] Console.app'te hata mesajı var mı?
- [ ] Safari extension cache temizlendi mi?

## Son Çare: Tamamen Sıfırdan

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab

# 1. Tüm build dosyalarını temizle
rm -rf dist/
rm -rf toolkit-for-ynab/safari/Extension/Resources/*
rm -rf toolkit-for-ynab/safari/"Toolkit for YNAB.xcodeproj"
rm -rf ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*

# 2. Yeni build
yarn build:safari

# 3. Resources kopyala
yarn safari:copy-resources

# 4. Versiyon senkronizasyonu
yarn safari:sync-version

# 5. Xcode projesi oluştur
cd toolkit-for-ynab/safari
xcodegen generate

# 6. Xcode'da aç
open "Toolkit for YNAB.xcodeproj"

# 7. Xcode'da:
#    - Her iki target için signing ayarlarını yapın
#    - Clean Build Folder (Cmd+Shift+K)
#    - Build (Cmd+B)
#    - Run (Cmd+R) - Debug executable kapalı olmalı
```

Bu adımlar extension'ı çalışır hale getirmelidir.
