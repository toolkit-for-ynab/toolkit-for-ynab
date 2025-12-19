# Signed Extension Hızlı Başlangıç

## Code Signing Yaptıktan Sonra Debug Hatası Alıyorsanız

Code signing yaptınız ama hala "Could not attach to pid" hatası alıyorsunuz. Bu normaldir - debug izinleri ile ilgili bir sorundur, extension'ın çalışmasını engellemez.

## Hızlı Çözüm: Debug Olmadan Çalıştır

### Yöntem 1: Xcode Scheme Ayarlarını Değiştir (Önerilen)

1. Xcode'da **Product > Scheme > Edit Scheme...** (veya **Cmd+<**)
2. Sol taraftan **Run** seçin
3. **Info** sekmesine gidin
4. **"Debug executable"** checkbox'ını **kaldırın** (işaretsiz bırakın)
5. **Close** butonuna tıklayın
6. **Product > Run** (Cmd+R) ile çalıştırın

**Sonuç:**

- ✅ Extension signed olarak yüklenecek
- ✅ "Allow unsigned extensions" ayarına gerek kalmayacak
- ✅ Safari kapanıp açılsa bile extension kalıcı olacak
- ✅ Debug hatası olmayacak
- ⚠️ Breakpoint'ler çalışmayacak (ama extension testi için genellikle gerekli değildir)

### Yöntem 2: Build Edip Terminal'den Çalıştır

1. Xcode'da **Product > Build** (Cmd+B) yapın
2. Build başarılı olduktan sonra Terminal'de:

```bash
open ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"
```

3. Safari otomatik açılacak ve extension yüklenecek

## Extension'ı Etkinleştirme

1. **Safari > Settings > Extensions** menüsüne gidin
2. **"Toolkit for YNAB"** extension'ını bulun
3. Checkbox'ı işaretleyerek etkinleştirin

**Not:** Artık "Allow unsigned extensions" ayarına gerek yok çünkü extension signed!

## Kontrol

### Extension Signed mı?

```bash
codesign -dv --verbose=4 ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"/Contents/PlugIns/"Toolkit for YNAB Extension.appex" 2>&1 | grep -E "Authority|TeamIdentifier"
```

Eğer çıktıda `TeamIdentifier` görünüyorsa, extension signed'dır.

### Extension Çalışıyor mu?

1. Safari'de **https://app.ynab.com** adresine gidin
2. Toolbar'da **Toolkit for YNAB** ikonu görünmeli
3. İkona tıklayınca popup açılmalı
4. YNAB sayfasında Toolkit özellikleri aktif olmalı

## Özet

1. ✅ **Code signing yaptınız** - Extension signed
2. ✅ **Debug olmadan çalıştırın** - Debug hatası olmayacak
3. ✅ **Extension'ı etkinleştirin** - Safari > Settings > Extensions
4. ✅ **"Allow unsigned extensions" ayarına gerek yok** - Extension signed olduğu için

Bu adımlar extension'ı çalışır hale getirir!
