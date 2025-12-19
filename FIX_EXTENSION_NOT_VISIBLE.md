# Extension Safari'de Görünmüyor - Çözüm

## Sorun

Safari ayarlarında extension listesinde "Toolkit for YNAB" görünmüyor.

**ÖNEMLİ:** Eğer Safari'de "Allow unsigned extensions" ayarı her kapanışta sıfırlanıyorsa, bu sorunun ana nedeni budur! Detaylı çözüm için `FIX_UNSIGNED_EXTENSIONS.md` dosyasına bakın.

## Olası Nedenler

1. **Extension Resources güncel değil** - Eski build dosyaları kullanılıyor
2. **Xcode projesi güncel değil** - Resources klasörü doğru şekilde embed edilmemiş
3. **Build edilmemiş** - Extension binary oluşturulmamış
4. **Code signing sorunu** - Extension imzalanmamış

## Adım Adım Çözüm

### Adım 1: Yeni Build Al ve Resources'ı Kopyala

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab

# 1. Yeni Safari build'i al
yarn build:safari

# 2. Resources'ı Safari projesine kopyala
yarn safari:copy-resources

# 3. Versiyon senkronizasyonu
yarn safari:sync-version
```

### Adım 2: Xcode Projesini Yeniden Oluştur

```bash
# Ana dizinden safari klasörüne git
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari

# Veya ana dizindeyseniz:
cd toolkit-for-ynab/safari

# Xcode projesini yeniden oluştur
xcodegen generate
```

### Adım 3: Xcode'da Clean ve Build

1. Xcode'da projeyi açın
2. **Product > Clean Build Folder** (Cmd+Shift+K)
3. **Product > Build** (Cmd+B)
4. Build başarılı olduktan sonra:
   - **Product > Run** (Cmd+R)
   - Veya Terminal'den:
     ```bash
     open ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"
     ```

### Adım 4: Safari'yi Yeniden Başlat

1. Safari'yi tamamen kapatın (Cmd+Q)
2. Uygulamayı tekrar çalıştırın
3. Safari otomatik açılacak
4. **Safari > Settings > Extensions** menüsüne gidin
5. **"Toolkit for YNAB"** extension'ını bulun ve etkinleştirin

## Kontrol Listesi

### ✅ Extension Resources Kontrolü

```bash
# Ana dizinden
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari

# Veya ana dizindeyseniz:
cd toolkit-for-ynab/safari

# Manifest var mı?
ls -la Extension/Resources/manifest.json

# JavaScript dosyaları var mı?
ls -la Extension/Resources/content-scripts/
ls -la Extension/Resources/background/

# HTML dosyaları var mı?
ls -la Extension/Resources/popup/index.html
ls -la Extension/Resources/options/index.html
```

### ✅ Build Kontrolü

```bash
# Build edilen uygulama var mı?
ls -la ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"

# Extension binary var mı?
ls -la ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"/Contents/PlugIns/
```

### ✅ Manifest Kontrolü

```bash
# Ana dizinden
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari

# Veya ana dizindeyseniz:
cd toolkit-for-ynab/safari

# Manifest geçerli mi?
cat Extension/Resources/manifest.json | python3 -m json.tool > /dev/null && echo "✓ Manifest geçerli" || echo "✗ Manifest geçersiz"

# Manifest Safari formatında mı?
grep -q '"manifest_version": 2' Extension/Resources/manifest.json && echo "✓ Manifest V2" || echo "✗ Manifest V2 değil"
grep -q '"browser_action"' Extension/Resources/manifest.json && echo "✓ browser_action var" || echo "✗ browser_action yok"
```

## Sorun Devam Ederse

### 1. Tüm Process'leri Temizle

```bash
# Safari'yi kapat
killall Safari

# Uygulamayı kapat
killall "Toolkit for YNAB"

# DerivedData'yı temizle
rm -rf ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*
```

### 2. Sıfırdan Build

```bash
# Ana dizine git
cd /Volumes/Mini/XCode/toolkit-for-ynab

# 1. Clean build
rm -rf dist/
rm -rf toolkit-for-ynab/safari/Extension/Resources/*

# 2. Yeni build
yarn build:safari

# 3. Resources kopyala
yarn safari:copy-resources

# 4. Xcode projesi oluştur
cd toolkit-for-ynab/safari
xcodegen generate

# 5. Xcode'da build
open "Toolkit for YNAB.xcodeproj"
# Sonra Xcode'da: Cmd+Shift+K (Clean), Cmd+B (Build), Cmd+R (Run)
```

### 3. Console.app'te Hata Kontrolü

1. **Console.app** açın
2. Sol taraftan **system.log** seçin
3. Sağ üstteki arama kutusuna şunları yazın:
   - `Toolkit for YNAB`
   - `Safari Extension`
   - `com.toolkitforynab`
4. Hata mesajlarını kontrol edin

### 4. Xcode Build Log'larını Kontrol Et

1. Xcode'da **View > Navigators > Show Report Navigator** (Cmd+9)
2. Son build'i seçin
3. Hata mesajlarını kontrol edin
4. Özellikle şunları arayın:
   - `Code signing`
   - `Embedded binary`
   - `Resources`

## En Hızlı Çözüm (Önerilen)

```bash
# Ana dizine git (eğer değilseniz)
cd /Volumes/Mini/XCode/toolkit-for-ynab

# 1. Yeni build
yarn build:safari

# 2. Resources kopyala
yarn safari:copy-resources

# 3. Xcode projesi oluştur
cd toolkit-for-ynab/safari
xcodegen generate

# Not: Eğer "cd: no such file or directory" hatası alırsanız,
# tam path kullanın:
# cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari

# 4. Xcode'da aç ve build
open "Toolkit for YNAB.xcodeproj"
```

Sonra Xcode'da:

1. **Product > Clean Build Folder** (Cmd+Shift+K)
2. **Product > Build** (Cmd+B)
3. **Product > Run** (Cmd+R)

Safari açıldıktan sonra:

1. **Safari > Settings > Extensions**
2. **"Toolkit for YNAB"** extension'ını bulun
3. Etkinleştirin

## Özet

Extension görünmüyorsa genellikle:

1. ✅ Yeni build alın (`yarn build:safari`)
2. ✅ Resources'ı kopyalayın (`yarn safari:copy-resources`)
3. ✅ Xcode projesini yeniden oluşturun (`xcodegen generate`)
4. ✅ Clean build yapın (Cmd+Shift+K, Cmd+B)
5. ✅ Uygulamayı çalıştırın (Cmd+R)
6. ✅ Safari'de extension'ı etkinleştirin

Bu adımlar %95 durumda sorunu çözer!
