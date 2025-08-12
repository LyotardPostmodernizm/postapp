
# PostApp - Basit Sosyal Medya Platformu

## Proje Tanımı
PostApp, kullanıcıların sosyal medya gönderileri paylaşabileceği, bu gönderilere yorum yapabileceği ve gönderilere beğeni yollayabileceği basit bir fullstack web uygulamasıdır. Proje, Spring Boot ile geliştirilmiş bir backend ve React ile geliştirilmiş bir frontend içerir.

## Öne Çıkan Özellikler
📝 Gönderi Paylaşımı: Kullanıcılar metin tabanlı gönderiler oluşturabilir. (Projenin ikinci versiyonunda fotoğraflı gönderiler de oluşturabilecektir.)

💬 Yorum Sistemi: Gönderilere yorum yapma ve yorumlara cevap yazmabilme

❤️ Beğeni Sistemi: Gönderileri ve yorumları beğenme

👤 Kullanıcı Profilleri: Özelleştirilebilir ad - soyad ve avatarlar

🔔 Etkinlik Takibi: Kullanıcı etkileşimlerinin takibi

🔒 Güvenli Kimlik Doğrulama: JWT tabanlı giriş sistemi

## Kullanılan Teknolojiler

### Backend (Spring Boot)
- Java 21

- Spring Boot 3.2.6

- Spring Security: Kimlik doğrulama ve yetkilendirme

- JWT (JSON Web Token): Güvenli oturum yönetimi

- Spring Data JPA: Veritabanı işlemleri

- Lombok: Boilerplate kod azaltma

- MapStruct: DTO ve Entity dönüşümleri

- MySQL: Veritabanı

- Maven: Bağımlılık yönetimi

### Frontend (React)
- React 18: Kullanıcı arayüzü geliştirme

- React Router: Sayfa yönlendirme

- Material-UI (MUI): UI bileşen kütüphanesi

- Axios: HTTP istekleri

- React Hook Form: Form yönetimi

- Yup: Form doğrulama

- Animated Backgrounds: Dinamik arka planlar -> (Link: https://github.com/umerfarok/animated-backgrounds)

- Vite: Modern build aracı

### Swagger 
- Uygulamayı geliştirme ortamında kullanacaklar, uygulamanın API endpointlerini gösterdiğim ve açıkladığım Swagger dokümantasyonuna, uygulamayı çalıştırdıktan sonra http://localhost:8080/swagger-ui/index.html URL'sine giderek ulaşabilirler.

## Kurulum ve Çalıştırma
### Backend Kurulumu
#### 1. Gereksinimler
- Java 21

- Maven

- MySQL
#### 2. Yapılması Gerekenler
.env.example isimli dosyadaki çevre değişkenlerinin her birini kopyalayıp .env isimli, projenin root klasöründe oluşturacağınız dosyaya yapıştırın ve çevre değişkenlerini MySQL veri tabanı ayarlarınıza göre değiştirin.

**Örnek olarak:**
- DB_HOST= **your_mysql_host** (localhost yazın. Çünkü program, developmentta çalışacak.)
- DB_PORT= **3306** (her zaman 3306 yazın)
- DB_NAME= **your_database_name** (buraya, MySQL workbench'ten oluşturduğunuz database'nin ismini yazın)
- DB_USERNAME= **your_mysql_username** (MySQL kullanıcı adınızı yazın)
- DB_PASSWORD= **your_super_secure_password_here** (MySQL workbench'ten oluşturduğunuz database'nin parolasını giriniz.)
- DB_DRIVER= **com.mysql.cj.jdbc.Driver** (MySQL kullanacağımız için bu aynen kalsın.)

**Geriye kalan tüm çevre değişkenlerini, oluştuduğunuz .env dosyasına aynen taşıyabilirsiniz.**

#### 3. Backend'i Çalıştırma:
```
cd be 
mvn clean install
mvn spring-boot:run
```
**Backend, http://localhost:8080 adresinde çalışacaktır.**

### Frontend Kurulumu

#### 1. Gereksinimler:

- Node.js (v18 veya üzeri)

- npm veya yarn (npm önerilir)

#### 2. Bağımlılıkları Yükleme:
```
cd fe
npm i
```

#### 3. Frontend'i Çalıştırma:
```
npm run dev
```
**Uygulama http://localhost:5173 adresinde çalışacaktır**

## API Endpointleri
Swagger linkini yukarıda verdim. Oradan, uygulamayı çalıştırdıktan sonra bakabilirsiniz.

## Uygulamadan Fotoğraflar
<img width="1905" height="946" alt="MainPage" src="https://github.com/user-attachments/assets/6a7d9782-1e65-4592-9daa-320b6aea446a" />
<img width="1909" height="950" alt="MainPage-2" src="https://github.com/user-attachments/assets/8a72bc47-7ada-4790-8376-139952260c07" />
<img width="1409" height="911" alt="UserProfile" src="https://github.com/user-attachments/assets/54b4314b-c7b9-493e-a107-dc861bd14a43" />
<img width="1321" height="950" alt="UserNotifications" src="https://github.com/user-attachments/assets/ef5ab34f-6f7a-4a02-a968-7737b04dda99" />

## Katkıda Bulunma
1) Bu repoyu fork'layın

2) Yeni bir branch oluşturun (git checkout -b feature/SoAmazingFeature)

3) Değişikliklerinizi commit edin (git commit -m 'Add some AmazingFeatures like OhMyGod!')

4) Branch'inizi push'layın (git push origin feature/SoAmazingFeature)

5) Pull Request açın

## Uygulama ile İlgili Bazı İstenmeyen Durumlar
Uygulamada post ve comment entitylerinde ilk başta Date kullanılmasına rağmen uygulama prod'a alınırken bu Date veri tipi sıkıntı çıkardığı için LocalDateTime veri tipine dönülmüştür ve bu da saati, Time Zone bazlı gösterdiği için post ve comment oluşturduğunuzda oluşturma saatin, Istanbul saatinden 3 saat ileride olduğunu göreceksiniz. Istanbul saatine çevirmek için fonksiyon yazdım ama işe yaramadı. **Belki bunu siz düzeltip pr açabilirsiniz :)** 


