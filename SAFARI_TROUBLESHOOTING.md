# Safari Extension Troubleshooting Guide

## "Could not attach to pid" Hatası

### Hata Mesajı

```
Could not attach to pid: "XXXXX"
Domain: IDEDebugSessionErrorDomain
Code: 6
Failure Reason: Ensure "Safari.app" is not already running, and [user] has permission to debug it.
```

### Hızlı Çözüm

#### Yöntem 1: Safari'yi Kapat ve Tekrar Dene (Önerilen)

```bash
# Terminal'den Safari'yi kapat
killall Safari

# Xcode'da tekrar çalıştır (Cmd+R)
```

#### Yöntem 2: Build Edip Manuel Çalıştır

1. Xcode'da **Product > Build** (Cmd+B) yapın
2. Build başarılı olduktan sonra:

   ```bash
   # DerivedData klasörüne git
   cd ~/Library/Developer/Xcode/DerivedData

   # Toolkit for YNAB klasörünü bul
   cd Toolkit_for_YNAB-*/

   # Build Products'a git
   cd Build/Products/Debug

   # Uygulamayı çalıştır
   open "Toolkit for YNAB.app"
   ```

#### Yöntem 3: Debug İzinlerini Kontrol Et

1. **System Settings** (Sistem Ayarları) açın
2. **Privacy & Security** (Gizlilik ve Güvenlik) sekmesine gidin
3. **Developer Tools** (Geliştirici Araçları) bölümünü bulun
4. Xcode'un listede olduğundan ve işaretli olduğundan emin olun
5. Yoksa, **+** butonuna tıklayıp Xcode'u ekleyin
6. Xcode'u işaretleyin

#### Yöntem 4: Console.app'te Detaylı Hata Kontrolü

1. **Console.app** açın (Applications > Utilities > Console)
2. Sol taraftan **system.log** seçin
3. Sağ üstteki arama kutusuna şunları yazın:
   - `debugserver`
   - `Safari`
   - `Toolkit for YNAB`
4. Hata mesajlarını kontrol edin
5. Özellikle "denied" veya "permission" kelimelerini arayın

### Detaylı Sorun Giderme

#### 1. Tüm Safari Process'lerini Kontrol Et

```bash
# Safari process'lerini listele
ps aux | grep -i safari

# Tüm Safari process'lerini kapat
killall Safari

# Zorla kapat (gerekirse)
killall -9 Safari
```

#### 2. Xcode DerivedData'yı Temizle

```bash
# DerivedData klasörünü temizle
rm -rf ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*

# Xcode'da Clean Build Folder yap (Cmd+Shift+K)
```

#### 3. Xcode'u Yeniden Başlat

1. Xcode'u tamamen kapatın (Cmd+Q)
2. Activity Monitor'da Xcode process'lerini kontrol edin
3. Xcode'u tekrar açın
4. Projeyi yeniden açın

#### 4. System Integrity Protection (SIP) Kontrolü

```bash
# SIP durumunu kontrol et
csrutil status

# Eğer "System Integrity Protection status: enabled" görüyorsanız, bu normaldir
# Safari extension development için SIP'i devre dışı bırakmaya gerek yoktur
```

#### 5. Code Signing Kontrolü

Xcode'da:

1. Project navigator'da projeyi seçin
2. Her target için (Host App ve Extension):
   - **Signing & Capabilities** sekmesine gidin
   - **Automatically manage signing** işaretli olmalı
   - Veya manuel olarak bir **Team** seçin

### Alternatif Test Yöntemi (Debug Olmadan)

Eğer debug hatası devam ediyorsa, extension'ı debug olmadan test edebilirsiniz:

1. **Xcode'da Build (Cmd+B)** yapın
2. Build başarılı olduktan sonra:
   ```bash
   # Build edilen uygulamayı bul ve çalıştır
   open ~/Library/Developer/Xcode/DerivedData/Toolkit_for_YNAB-*/Build/Products/Debug/"Toolkit for YNAB.app"
   ```
3. Safari otomatik olarak açılacak
4. Extension'ı Safari ayarlarından etkinleştirin
5. YNAB sitesine gidin ve test edin

### Debug Olmadan Test Etme

Debug hatası alıyorsanız ama extension'ı test etmek istiyorsanız:

1. Xcode'da **Product > Scheme > Edit Scheme** (Cmd+<)
2. Sol taraftan **Run** seçin
3. **Info** sekmesinde **Debug executable** checkbox'ını kaldırın
4. **OK** butonuna tıklayın
5. Tekrar **Cmd+R** ile çalıştırın

Bu yöntem debugger olmadan çalıştırır, bu yüzden breakpoint'ler çalışmaz ama extension normal şekilde yüklenir.

### Daha Fazla Yardım

Eğer sorun devam ediyorsa:

1. **Console.app**'te detaylı hata mesajlarını kontrol edin
2. Xcode'da **Window > Devices and Simulators** açın
3. **View Device Logs** butonuna tıklayın
4. Safari ile ilgili crash log'larını kontrol edin

### Özet: En Hızlı Çözüm

```bash
# 1. Safari'yi kapat
killall Safari

# 2. Xcode'da Clean Build Folder (Cmd+Shift+K)

# 3. Build (Cmd+B)

# 4. Run (Cmd+R)
```

Bu adımlar %90 durumda sorunu çözer.
