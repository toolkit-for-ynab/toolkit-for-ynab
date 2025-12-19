# Code Signing Hatası Çözümü

## Hata Mesajı

```
Embedded binary is not signed with the same certificate as the parent app.
Verify the embedded binary target's code sign settings match the parent app's.
```

## Sorun

Safari Web Extension'lar için hem **Host App** hem de **Extension** target'ı aynı sertifika/team ile imzalanmalıdır.

## Çözüm: Xcode'da Signing Ayarlarını Düzelt

### Adım 1: Xcode'da Projeyi Aç

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari
open "Toolkit for YNAB.xcodeproj"
```

### Adım 2: Host App Signing Ayarları

1. Xcode'da sol taraftan projeyi seçin (mavi ikon)
2. **TARGETS** altından **"Toolkit for YNAB"** (Host App) seçin
3. **Signing & Capabilities** sekmesine gidin
4. **"Automatically manage signing"** checkbox'ını işaretleyin
5. **Team** dropdown'ından bir team seçin:
   - Eğer Apple Developer hesabınız varsa: Team'inizi seçin
   - Yoksa: **"Add an Account..."** ile Apple ID'nizi ekleyin
   - Veya **"None"** seçin (development için)

### Adım 3: Extension Signing Ayarları

1. **TARGETS** altından **"Toolkit for YNAB Extension"** seçin
2. **Signing & Capabilities** sekmesine gidin
3. **"Automatically manage signing"** checkbox'ını işaretleyin
4. **Aynı Team'i** seçin (Host App ile aynı olmalı!)

### Adım 4: Doğrulama

Her iki target için de:

- ✅ **Automatically manage signing** işaretli olmalı
- ✅ **Team** aynı olmalı (veya ikisi de "None")
- ✅ **Bundle Identifier** benzersiz olmalı:
  - Host App: `com.toolkitforynab.macos`
  - Extension: `com.toolkitforynab.macos.Extension`

### Adım 5: Clean ve Rebuild

1. **Product > Clean Build Folder** (Cmd+Shift+K)
2. **Product > Build** (Cmd+B)
3. **Product > Run** (Cmd+R)

## Development İçin (Apple Developer Hesabı Yoksa)

Eğer Apple Developer hesabınız yoksa:

1. Her iki target için de:

   - **Team** olarak **"None"** seçin
   - **"Automatically manage signing"** işaretli olsun

2. **Product > Build** (Cmd+B) yapın

3. Build başarılı olduktan sonra:
   ```bash
   # Build edilen uygulamayı çalıştır
   open ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"
   ```

**Not:** "None" team ile imzalanmış uygulamalar App Store'a yüklenemez ama development/test için çalışır.

## Apple Developer Hesabı Varsa

1. **System Settings > Apple ID** bölümünden Apple ID'nizi kontrol edin
2. Xcode'da **Xcode > Settings > Accounts** sekmesine gidin
3. Apple ID'nizi ekleyin/güncelleyin
4. Her iki target için de bu team'i seçin

## Terminal'den Kontrol

Signing ayarlarını kontrol etmek için:

```bash
cd /Volumes/Mini/XCode/toolkit-for-ynab/toolkit-for-ynab/safari

# Host App signing ayarları
xcodebuild -project "Toolkit for YNAB.xcodeproj" \
  -target "Toolkit for YNAB" \
  -showBuildSettings | grep -E "CODE_SIGN|DEVELOPMENT_TEAM"

# Extension signing ayarları
xcodebuild -project "Toolkit for YNAB.xcodeproj" \
  -target "Toolkit for YNAB Extension" \
  -showBuildSettings | grep -E "CODE_SIGN|DEVELOPMENT_TEAM"
```

Her ikisinde de `DEVELOPMENT_TEAM` aynı olmalı (veya ikisi de boş).

## Sorun Devam Ederse

### 1. DerivedData'yı Temizle

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*
```

### 2. Xcode'u Yeniden Başlat

```bash
killall Xcode
# Sonra Xcode'u tekrar açın
```

### 3. project.yml'i Kontrol Et

Eğer `project.yml` dosyasında `DEVELOPMENT_TEAM` hardcoded ise, bunu kaldırın veya her iki target için de aynı yapın.

## Özet: En Hızlı Çözüm

1. Xcode'da projeyi aç
2. Her iki target için (Host App ve Extension):
   - **Signing & Capabilities** sekmesine git
   - **"Automatically manage signing"** işaretle
   - **Aynı Team'i** seç (veya ikisi de "None")
3. **Clean Build Folder** (Cmd+Shift+K)
4. **Build** (Cmd+B)
5. **Run** (Cmd+R)

Bu adımlar %99 durumda sorunu çözer!
