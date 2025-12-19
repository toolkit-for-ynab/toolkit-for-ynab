# "Allow Unsigned Extensions" Ayarı Sıfırlanıyor - Çözüm

## Sorun

Safari'de **"Allow unsigned extensions"** checkbox'ı her Safari kapandığında işaretini kaybediyor. Bu, extension'ın görünmemesinin ana nedeni olabilir.

## Neden Bu Oluyor?

Safari, güvenlik nedeniyle "Allow unsigned extensions" ayarını her kapanışta sıfırlar. Bu normal bir davranıştır ve güvenlik için tasarlanmıştır.

## Çözümler

### Çözüm 1: Extension'ı Signed Yap (Önerilen - Production İçin)

Extension'ı Apple Developer hesabıyla imzalarsanız, "Allow unsigned extensions" ayarına gerek kalmaz.

#### Adımlar:

1. **Apple Developer Hesabı Gerekli:**

   - Apple Developer Program üyeliği ($99/yıl)
   - Veya ücretsiz Apple ID ile development signing

2. **Xcode'da Signing Ayarları:**

   - Xcode'da projeyi açın
   - Her iki target için (Host App ve Extension):
     - **Signing & Capabilities** sekmesine gidin
     - **Team** dropdown'ından Apple Developer Team'inizi seçin
     - **Automatically manage signing** işaretli olsun

3. **Build ve Run:**
   - **Product > Clean Build Folder** (Cmd+Shift+K)
   - **Product > Build** (Cmd+B)
4. **Debug Hatası Alırsanız:**

   - Xcode'da **Product > Scheme > Edit Scheme...** (Cmd+<)
   - Sol taraftan **Run** seçin
   - **Info** sekmesine gidin
   - **"Debug executable"** checkbox'ını **kaldırın** (işaretsiz bırakın)
   - **Close** butonuna tıklayın
   - **Product > Run** (Cmd+R)

   **Alternatif:** Build edip Terminal'den çalıştırın:

   ```bash
   open ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"
   ```

5. **Sonuç:**
   - Extension signed olarak yüklenecek
   - "Allow unsigned extensions" ayarına gerek kalmayacak
   - Safari kapanıp açılsa bile extension kalıcı olacak
   - Debug hatası alırsanız, debug olmadan çalıştırın (yukarıdaki adım 4)

### Çözüm 2: Development İçin Geçici Çözüm

Eğer Apple Developer hesabınız yoksa veya sadece test ediyorsanız:

#### Adımlar:

1. **Safari'yi Açın**

2. **Developer Menüsünü Etkinleştirin:**

   - **Safari > Settings > Advanced**
   - **"Show features for web developers"** işaretleyin

3. **Unsigned Extensions'ı Etkinleştirin:**

   - **Developer > Allow Unsigned Extensions** menüsüne gidin
   - Checkbox'ı işaretleyin

4. **Extension'ı Hemen Etkinleştirin:**

   - **Safari > Settings > Extensions**
   - **"Toolkit for YNAB"** extension'ını bulun
   - Checkbox'ı işaretleyerek etkinleştirin

5. **Safari'yi Kapatmayın:**
   - Development sırasında Safari'yi açık tutun
   - Veya her açışta bu adımları tekrarlayın

### Çözüm 3: Otomatik Script (Development İçin)

Safari her açıldığında "Allow unsigned extensions" ayarını otomatik etkinleştirmek için bir script oluşturabilirsiniz:

```bash
#!/bin/bash
# Safari'yi aç ve unsigned extensions'ı etkinleştir

# Safari'yi aç
open -a Safari

# Biraz bekle (Safari'nin açılması için)
sleep 2

# AppleScript ile ayarı etkinleştir (bu çalışmayabilir, Safari güvenlik nedeniyle kısıtlıyor)
# Alternatif: Manuel olarak Developer menüsünden etkinleştirin
```

**Not:** Safari güvenlik nedeniyle bu ayarı programatik olarak değiştirmeye izin vermez, bu yüzden manuel olarak etkinleştirmeniz gerekir.

### Çözüm 4: Uygulamayı Her Çalıştırdığınızda Hatırlatıcı

Xcode'dan uygulamayı çalıştırdığınızda, Safari açıldıktan sonra:

1. **Developer > Allow Unsigned Extensions** menüsüne gidin
2. Checkbox'ı işaretleyin
3. **Safari > Settings > Extensions** menüsüne gidin
4. Extension'ı etkinleştirin

## En İyi Çözüm: Code Signing

### Ücretsiz Apple ID ile Development Signing

Apple Developer Program üyeliği olmadan da development için signing yapabilirsiniz:

1. **Xcode'da:**

   - **Xcode > Settings > Accounts**
   - Apple ID'nizi ekleyin
   - **Download Manual Profiles** butonuna tıklayın

2. **Projede:**

   - Her iki target için:
     - **Signing & Capabilities** sekmesine gidin
     - **Team** olarak Apple ID'nizi seçin
     - **Automatically manage signing** işaretleyin

3. **Sonuç:**
   - Extension signed olarak yüklenecek
   - "Allow unsigned extensions" ayarına gerek kalmayacak
   - 7 gün geçerli olacak (sonra yeniden build etmeniz gerekir)

### Apple Developer Program ile Production Signing

App Store'a yüklemek için:

1. **Apple Developer Program** üyeliği gerekli ($99/yıl)
2. **Xcode'da Team** olarak Developer Program team'inizi seçin
3. Extension kalıcı olarak signed olacak
4. App Store'a yüklenebilir

## Kontrol Listesi

### Extension Signed mı?

```bash
# Extension binary'sini kontrol et
codesign -dv --verbose=4 ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"/Contents/PlugIns/"Toolkit for YNAB Extension.appex" 2>&1 | grep -E "Authority|TeamIdentifier"
```

Eğer çıktıda `TeamIdentifier` görünüyorsa, extension signed'dır.

### Extension Unsigned mı?

Eğer extension unsigned ise:

- Her Safari açılışında "Allow unsigned extensions" ayarını etkinleştirmeniz gerekir
- Extension listede görünmeyebilir
- Safari kapanınca ayar sıfırlanır

## Özet ve Öneriler

### Development İçin:

1. ✅ **Code signing yapın** (ücretsiz Apple ID ile bile çalışır)
2. ✅ Xcode'da **Team** seçin
3. ✅ **Automatically manage signing** işaretleyin
4. ✅ Build edin ve çalıştırın
5. ✅ "Allow unsigned extensions" ayarına gerek kalmaz

### Test İçin (Geçici):

1. Safari'yi açın
2. **Developer > Allow Unsigned Extensions** işaretleyin
3. **Safari > Settings > Extensions** menüsünden extension'ı etkinleştirin
4. Safari'yi kapatmayın veya her açışta tekrarlayın

### Production İçin:

1. ✅ **Apple Developer Program** üyeliği alın
2. ✅ Extension'ı production signing ile imzalayın
3. ✅ App Store'a yükleyin
4. ✅ Kullanıcılar "Allow unsigned extensions" ayarına gerek duymaz

## Sonuç

**"Allow unsigned extensions" ayarının sıfırlanması kesinlikle extension'ın görünmemesinin nedeni olabilir.**

En iyi çözüm: **Code signing yapın**. Bu hem development hem de production için en iyi yaklaşımdır ve bu sorunu tamamen çözer.
