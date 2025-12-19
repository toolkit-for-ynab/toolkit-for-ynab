# Safari Extension Test Rehberi

Bu rehber, Toolkit for YNAB Safari uzantısını test etmek için adım adım talimatlar içerir.

## Ön Hazırlık

### 1. Build Durumu Kontrolü

Aşağıdaki komutlarla build durumunu kontrol edin:

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari
ls -la "Toolkit for YNAB.xcodeproj"
ls -la Extension/Resources/manifest.json
```

### 2. Xcode Projesini Açma

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari
open "Toolkit for YNAB.xcodeproj"
```

## Safari'de Extension'ı Yükleme ve Test Etme

### Adım 1: Safari'de Developer Modunu Etkinleştir

1. Safari'yi açın
2. **Safari > Settings (Ayarlar)** menüsüne gidin
3. **Advanced (Gelişmiş)** sekmesine tıklayın
4. **"Show features for web developers"** (Web geliştiricileri için özellikleri göster) seçeneğini işaretleyin
5. Bu işlem **Developer** menüsünü Safari menü çubuğuna ekler

### Adım 2: Unsigned Extension'ları İzin Ver

1. **Developer** menüsüne gidin
2. **"Allow Unsigned Extensions"** (İmzasız uzantılara izin ver) seçeneğini etkinleştirin
3. Bu, development build'lerini test etmek için gereklidir

### Adım 3: Safari'yi Kapat ve Xcode'dan Uygulamayı Çalıştır

**ÖNEMLİ:** Safari zaten çalışıyorsa, Xcode'un debugger'ı Safari'ye attach edemez. Bu adımı mutlaka uygulayın:

1. **Safari'yi tamamen kapatın:**

   - Safari menüsünden **Safari > Quit Safari** (Cmd+Q)
   - Veya Activity Monitor'dan Safari process'lerini kontrol edin:
     ```bash
     killall Safari
     ```

2. Xcode'da projeyi açın

3. **Scheme** olarak **"Toolkit for YNAB"** seçildiğinden emin olun

4. **Destination** olarak **"My Mac"** seçin

5. **Cmd+R** tuşlarına basarak uygulamayı çalıştırın

6. Xcode otomatik olarak Safari'yi başlatacak ve extension'ı yükleyecektir

**Alternatif Yöntem (Safari açıkken):**
Eğer Safari'yi kapatmak istemiyorsanız:

1. Xcode'dan uygulamayı **build** edin (Cmd+B) ama çalıştırmayın
2. Build edilen `.app` dosyasını Finder'dan bulun ve çalıştırın
3. Safari otomatik olarak extension'ı yükleyecektir

### Adım 4: Extension'ı Safari'de Etkinleştir

1. Safari açıldığında, extension'ı etkinleştirmek için bir dialog göreceksiniz
2. **"Turn On..."** (Aç...) butonuna tıklayın
3. Alternatif olarak:
   - **Safari > Settings > Extensions** menüsüne gidin
   - **"Toolkit for YNAB"** extension'ını bulun
   - Yanındaki checkbox'ı işaretleyerek etkinleştirin

### Adım 5: YNAB Sitesinde Test Et

1. Safari'de **https://app.ynab.com** adresine gidin
2. YNAB hesabınızla giriş yapın (test için YNAB hesabı gereklidir)
3. Extension'ın çalışıp çalışmadığını kontrol edin:

#### Kontrol Edilecekler:

- ✅ **Toolbar Icon**: Safari toolbar'ında Toolkit for YNAB ikonu görünmeli
- ✅ **Popup**: Toolbar ikonuna tıkladığınızda popup açılmalı
- ✅ **Content Scripts**: YNAB sayfasında Toolkit özellikleri aktif olmalı
- ✅ **Options Page**: Popup'tan veya extension ayarlarından options sayfasına erişilebilmeli

### Adım 6: Extension Console'u Kontrol Et

1. **Developer > Web Extension Background Content** menüsüne gidin
2. **"Toolkit for YNAB"** seçin
3. Console'da hata mesajlarını kontrol edin
4. Background script'in çalışıp çalışmadığını doğrulayın

### Adım 7: Content Script'leri Test Et

1. YNAB sayfasında **Cmd+Option+I** ile Developer Tools'u açın
2. **Console** sekmesine gidin
3. Toolkit'in yüklendiğine dair log mesajlarını kontrol edin
4. Herhangi bir hata mesajı olup olmadığını kontrol edin

## Beklenen Sonuçlar

### Başarılı Test İşaretleri:

- ✅ Extension Safari'de görünüyor ve etkin
- ✅ Toolbar ikonu görünüyor
- ✅ Popup açılıyor
- ✅ YNAB sayfasında Toolkit özellikleri çalışıyor
- ✅ Console'da kritik hata yok
- ✅ Options sayfası açılıyor

### Olası Sorunlar ve Çözümleri:

#### "Could not attach to pid" Hatası (Xcode Debug Hatası)

**Hata Mesajı:**

```
Could not attach to pid: "XXXXX"
Ensure "Safari.app" is not already running, and [user] has permission to debug it.
```

**Çözümler:**

1. **Safari'yi Tamamen Kapat:**

   ```bash
   # Terminal'den Safari'yi kapat
   killall Safari

   # Veya Activity Monitor'dan tüm Safari process'lerini kontrol edin
   ```

2. **Xcode'u Yeniden Başlat:**

   - Xcode'u kapatın (Cmd+Q)
   - Xcode'u tekrar açın
   - Projeyi yeniden açın

3. **Build Edip Manuel Çalıştır:**

   - Xcode'da **Product > Build** (Cmd+B) yapın
   - Build başarılı olduktan sonra:
     - Finder'da `~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/` klasörüne gidin
     - `Toolkit for YNAB.app` dosyasını bulun
     - Çift tıklayarak çalıştırın
   - Safari otomatik olarak açılacak ve extension yüklenecektir

4. **Debug İzinlerini Kontrol Et:**

   - **System Settings > Privacy & Security > Developer Tools**
   - Xcode'un listede olduğundan ve işaretli olduğundan emin olun
   - Gerekirse Xcode'u ekleyin ve işaretleyin

5. **Console.app'te Hata Mesajlarını Kontrol Et:**
   - Console.app'i açın
   - Sol taraftan "system.log" veya "crashreporter" seçin
   - "debugserver" veya "Safari" ile ilgili hata mesajlarını arayın
   - Hata mesajları debug izinleri hakkında daha fazla bilgi verebilir

#### Extension Görünmüyor

- **Çözüm**: Safari'yi yeniden başlatın ve extension'ı tekrar etkinleştirin
- Xcode'dan uygulamayı tekrar çalıştırın

#### Popup Açılmıyor

- **Çözüm**: Manifest'te `browser_action.default_popup` doğru ayarlanmış mı kontrol edin
- Console'da hata mesajlarını kontrol edin

#### Content Scripts Çalışmıyor

- **Çözüm**: Manifest'te `content_scripts` matches doğru mu kontrol edin
- YNAB sayfasını yenileyin (Cmd+R)

#### Background Script Hataları

- **Çözüm**: Developer > Web Extension Background Content'te console'u kontrol edin
- Safari-specific API'lerin doğru guard edildiğini kontrol edin

## Debug İpuçları

### 1. Console Logları

Extension'ın çalışıp çalışmadığını görmek için:

```javascript
// Background script console'da
console.log('Toolkit for YNAB background script loaded');

// Content script console'da (YNAB sayfasında)
console.log('Toolkit for YNAB content script loaded');
```

### 2. Manifest Kontrolü

Extension Resources'taki manifest'i kontrol edin:

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari
cat Extension/Resources/manifest.json | jq .
```

### 3. Build Logları

Xcode'da build loglarını kontrol edin:

- **View > Navigators > Show Report Navigator** (Cmd+9)
- Son build'in başarılı olduğunu kontrol edin

## Test Senaryoları

### Senaryo 1: Temel Fonksiyonellik

1. Extension'ı etkinleştir
2. YNAB'a giriş yap
3. Toolbar ikonuna tıkla
4. Popup'ın açıldığını doğrula
5. Options sayfasına git
6. Bir özelliği aç/kapat
7. YNAB sayfasını yenile
8. Değişikliğin uygulandığını doğrula

### Senaryo 2: Storage Test

1. Options sayfasında bir ayar yap
2. Sayfayı yenile
3. Ayarın korunduğunu doğrula
4. Extension'ı devre dışı bırak ve tekrar etkinleştir
5. Ayarın hala korunduğunu doğrula

### Senaryo 3: Content Script Test

1. YNAB budget sayfasına git
2. Toolkit özelliklerinden birini etkinleştir (örn: Progress bars)
3. Sayfada görsel değişikliklerin olduğunu doğrula
4. Console'da hata olmadığını kontrol et

## Sonuç

Test tamamlandıktan sonra:

- ✅ Tüm temel fonksiyonlar çalışıyor mu?
- ✅ Console'da kritik hata var mı?
- ✅ Extension Safari'de stabil çalışıyor mu?

Eğer tüm kontroller başarılıysa, extension production build için hazırdır!

## Production Build İçin

Production build için:

1. Apple Developer Team ID'yi Xcode'da ayarlayın
2. Code signing'i yapılandırın
3. Release configuration ile build alın
4. Archive oluşturun
5. App Store Connect'e yükleyin

Detaylar için `safari/APP_STORE_ASSETS.md` dosyasına bakın.
