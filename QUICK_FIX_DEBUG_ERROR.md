# Hızlı Çözüm: "Could not attach to pid" Hatası

## Sorun

Safari'yi kapattığınız halde hala aynı hatayı alıyorsunuz. Bu, debug izinleri veya Xcode'un Safari'ye attach etme yetkisi ile ilgili bir sorundur.

## En Hızlı Çözüm: Debug Olmadan Çalıştır

### Yöntem 1: Xcode Scheme Ayarlarını Değiştir (Önerilen)

1. Xcode'da **Product > Scheme > Edit Scheme...** (veya **Cmd+<**)
2. Sol taraftan **Run** seçin
3. **Info** sekmesine gidin
4. **"Debug executable"** checkbox'ını **kaldırın** (işaretsiz bırakın)
5. **Close** butonuna tıklayın
6. **Cmd+R** ile tekrar çalıştırın

Bu yöntem extension'ı debug olmadan çalıştırır. Extension normal şekilde yüklenir ve çalışır, sadece breakpoint'ler çalışmaz.

### Yöntem 2: Build Edip Manuel Çalıştır

1. Xcode'da **Product > Build** (Cmd+B) yapın
2. Build başarılı olduktan sonra Terminal'de:

```bash
# Build edilen uygulamayı bul ve çalıştır
open ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"
```

3. Safari otomatik olarak açılacak ve extension yüklenecektir

### Yöntem 3: Developer Tools İzinlerini Kontrol Et

1. **System Settings** (Sistem Ayarları) açın
2. **Privacy & Security** (Gizlilik ve Güvenlik) sekmesine gidin
3. **Developer Tools** (Geliştirici Araçları) bölümünü bulun
4. Xcode'un listede olduğundan ve **işaretli** olduğundan emin olun
5. Yoksa:
   - **+** butonuna tıklayın
   - Xcode'u seçin (`/Applications/Xcode.app`)
   - Xcode'u işaretleyin
6. Xcode'u kapatıp tekrar açın
7. Tekrar deneyin

## Neden Bu Hata Oluşur?

Bu hata genellikle şu durumlarda oluşur:

1. **macOS güvenlik ayarları**: macOS, Xcode'un Safari'ye attach etmesine izin vermiyor
2. **Developer Tools izinleri**: Xcode'un Developer Tools izinleri eksik veya yanlış yapılandırılmış
3. **SIP (System Integrity Protection)**: Bazı durumlarda SIP debug işlemlerini engelleyebilir
4. **Xcode versiyonu**: Bazı Xcode versiyonlarında bu sorun daha sık görülür

## Debug Olmadan Test Etmek Sorun mu?

Hayır! Debug olmadan çalıştırmak extension'ın çalışmasını engellemez:

- ✅ Extension normal şekilde yüklenir
- ✅ Tüm özellikler çalışır
- ✅ Console log'ları görülebilir
- ❌ Breakpoint'ler çalışmaz (ama bu extension testi için genellikle gerekli değildir)

## Console Log'larını Görme

Debug olmadan çalıştırsanız bile log'ları görebilirsiniz:

1. Safari'de **Developer > Web Extension Background Content** menüsüne gidin
2. **Toolkit for YNAB** seçin
3. Console'da tüm log'ları görebilirsiniz

## Özet: En Kolay Çözüm

**Xcode'da:**

1. **Product > Scheme > Edit Scheme...** (Cmd+<)
2. **Run > Info** sekmesi
3. **"Debug executable"** checkbox'ını kaldırın
4. **Close**
5. **Cmd+R** ile çalıştırın

Bu %99 durumda sorunu çözer!
