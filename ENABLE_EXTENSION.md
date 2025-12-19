# Safari Extension'ı Etkinleştirme Rehberi

## Safari Açıldı Ama Extension Yüklenmedi

Safari açıldıysa ama extension görünmüyorsa, extension'ı manuel olarak etkinleştirmeniz gerekebilir.

## Adım 1: Safari Extension Ayarlarını Aç

1. Safari'yi açın
2. **Safari > Settings** (Ayarlar) menüsüne gidin
   - Veya **Cmd+,** (virgül) tuşlarına basın
3. **Extensions** (Uzantılar) sekmesine tıklayın

## Adım 2: Extension'ı Bul ve Etkinleştir

1. Sol tarafta **"Toolkit for YNAB"** extension'ını bulun
2. Extension'ın yanındaki **checkbox'ı işaretleyin** (✓)
3. İlk kez etkinleştiriyorsanız, bir onay dialog'u görebilirsiniz
4. **"Turn On"** (Aç) veya **"Enable"** (Etkinleştir) butonuna tıklayın

## Adım 3: Extension'ın Yüklendiğini Doğrula

### Kontrol 1: Toolbar Icon

1. Safari toolbar'ına bakın
2. **Toolkit for YNAB** ikonu görünmeli
3. Eğer görünmüyorsa:
   - **View > Customize Toolbar...** menüsüne gidin
   - **Toolkit for YNAB** ikonunu toolbar'a sürükleyin

### Kontrol 2: Extension Ayarları

1. **Safari > Settings > Extensions** menüsüne gidin
2. **"Toolkit for YNAB"** seçili olmalı
3. Sağ tarafta extension bilgileri görünmeli:
   - Version: 3.19.0
   - Description görünmeli

### Kontrol 3: Popup Test

1. Toolbar'daki **Toolkit for YNAB** ikonuna tıklayın
2. Popup açılmalı
3. Eğer açılmıyorsa, console'da hata olabilir

## Extension Görünmüyorsa

### Sorun 1: Extension Listede Yok

Eğer **Safari > Settings > Extensions** menüsünde extension görünmüyorsa:

1. **Uygulamayı yeniden çalıştırın:**

   ```bash
   # Xcode'dan build edin (Cmd+B)
   # Sonra çalıştırın:
   open ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"
   ```

2. **Safari'yi yeniden başlatın:**

   - Safari'yi kapatın (Cmd+Q)
   - Uygulamayı tekrar çalıştırın
   - Safari otomatik açılacak

3. **Extension Resources'ı kontrol edin:**
   ```bash
   cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari
   ls -la Extension/Resources/manifest.json
   # manifest.json dosyası olmalı
   ```

### Sorun 2: Extension Etkinleştirilemiyor

Eğer extension listede görünüyor ama etkinleştirilemiyorsa:

1. **Developer modunu etkinleştirin:**

   - **Safari > Settings > Advanced**
   - **"Show features for web developers"** işaretleyin
   - **Developer** menüsü görünecek

2. **Unsigned extensions'a izin verin:**

   - **Developer > Allow Unsigned Extensions** menüsüne gidin
   - İşaretleyin

3. **Console'da hata kontrolü:**
   - **Developer > Web Extension Background Content**
   - **"Toolkit for YNAB"** seçin
   - Console'da hata mesajlarını kontrol edin

### Sorun 3: Manifest Hatası

Eğer extension yüklenmiyorsa manifest'te sorun olabilir:

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari
cat Extension/Resources/manifest.json | python3 -m json.tool
```

Manifest geçerli JSON olmalı ve şu alanları içermeli:

- `manifest_version: 2`
- `browser_action`
- `content_scripts`
- `permissions`

## Adım Adım Test

### 1. Extension'ı Etkinleştir

1. **Safari > Settings > Extensions**
2. **"Toolkit for YNAB"** checkbox'ını işaretle
3. **"Turn On"** butonuna tıkla

### 2. Toolbar Icon'u Kontrol Et

1. Safari toolbar'ına bak
2. Toolkit for YNAB ikonu görünmeli
3. Yoksa: **View > Customize Toolbar...** ile ekle

### 3. Popup'ı Test Et

1. Toolbar ikonuna tıkla
2. Popup açılmalı
3. Options butonuna tıklayıp settings sayfasını aç

### 4. YNAB Sitesinde Test Et

1. **https://app.ynab.com** adresine git
2. YNAB'a giriş yap
3. Extension'ın çalışıp çalışmadığını kontrol et:
   - Toolbar ikonu görünmeli
   - Popup açılmalı
   - YNAB sayfasında Toolkit özellikleri aktif olmalı

## Debug İpuçları

### Console Log'larını Kontrol Et

1. **Developer > Web Extension Background Content**
2. **"Toolkit for YNAB"** seçin
3. Console'da şu mesajları arayın:
   - `Toolkit for YNAB background script loaded`
   - Herhangi bir hata mesajı

### Content Script Log'larını Kontrol Et

1. YNAB sayfasında **Cmd+Option+I** ile Developer Tools aç
2. **Console** sekmesine git
3. Şu mesajları arayın:
   - `Toolkit for YNAB content script loaded`
   - Herhangi bir hata mesajı

### Extension Resources Kontrolü

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari

# Manifest var mı?
ls -la Extension/Resources/manifest.json

# JavaScript dosyaları var mı?
ls -la Extension/Resources/content-scripts/
ls -la Extension/Resources/background/

# HTML dosyaları var mı?
ls -la Extension/Resources/popup/
ls -la Extension/Resources/options/
```

## Özet: Extension'ı Etkinleştirme

1. ✅ **Safari > Settings > Extensions** menüsüne git
2. ✅ **"Toolkit for YNAB"** extension'ını bul
3. ✅ **Checkbox'ı işaretle** (etkinleştir)
4. ✅ **Toolbar icon'unu kontrol et**
5. ✅ **Popup'ı test et**
6. ✅ **YNAB sitesinde test et**

Eğer extension listede görünmüyorsa, uygulamayı yeniden build edip çalıştırın ve Safari'yi yeniden başlatın.
