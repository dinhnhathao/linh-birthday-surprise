# 🎀 Linh's Birthday Surprise

Mini web sinh nhật dành cho Linh, thiết kế mobile-first cho iPhone 17 Pro.

## Chạy trong VS Code

1. Cài Node.js 20.19+ (hoặc Node.js 22+).
2. Mở thư mục `linh-birthday-surprise` trong VS Code.
3. Mở Terminal và chạy:

```bash
npm install
npm run dev
```

4. Mở URL mà Vite hiển thị (thường là http://localhost:5173).

## Xuất bản lên GitHub Pages

Cách đơn giản nhất: GitHub Actions.

1. Tạo repository mới trên GitHub và push toàn bộ thư mục dự án lên nhánh `main`.
2. Vào **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. File `.github/workflows/deploy.yml` sẽ tự build và triển khai khi push lên `main`.
4. Link web thường là `https://TEN-TAI-KHOAN.github.io/TEN-REPOSITORY/`.

> Cấu hình `base: './'` trong `vite.config.js` giúp asset chạy đúng trong đường dẫn repository.

## Thay hình

- `public/images/cat.png`: mèo hoạt hình (đã tách nền từ ảnh bạn gửi).
- `public/images/pocket4.png`: ảnh món quà bạn gửi.

## Âm thanh

Các hiệu ứng SFX được tạo bằng Web Audio API tại `src/audio.js` nên không cần tải thêm MP3. Nút loa ở góc trên bên phải dùng để bật/tắt âm thanh. Trên Safari iPhone, âm thanh được kích hoạt sau khi người dùng bấm nút.

Thêm nhạc nền sau: đặt MP3 trong `public/music/` rồi tích hợp audio player vào `src/main.jsx`. Nhạc nền chưa được phát ở phiên bản này.

## Tùy chỉnh

- Thời lượng: `DURATION` và `EVENTS` trong `src/main.jsx`.
- Ngày sinh hợp lệ: hàm `start()` trong `src/main.jsx`.
- Nội dung lời chúc: `compliments` và phân cảnh `end`.
- Màu sắc, font, hiệu ứng jelly: `src/style.css`.

## Ghi chú về hoạt hình

Đây là bản v1 sử dụng hình mèo đã tách nền và hoạt hình CSS, kèm lớp phủ miệng/bụng, **chưa phải rig SVG từng khớp chân/tai/mắt**. Các hiệu ứng được đồng bộ theo timeline với âm thanh tổng hợp. Để đạt hoạt hình nhân vật chuyên nghiệp, bước tiếp theo là vẽ lại mèo thành các bộ phận vector riêng hoặc dùng spritesheet nhiều khung hình.

## v1.1 — Hoạt hình ngày sinh
- Giữ nguyên màn chào mừng và nhập ngày sinh.
- Sau khi nhấn Khám phá bí mật: ô ngày sinh mờ, 8 chữ số bay tản ra rồi tụ lại cùng dấu cộng, hiện số 14.
- Số 14 di chuyển lên cao; TOP và lời khen bay vào, chừa ô số 1. Số 1 bay vào ô, số 4 giữ trên cao.
- Khối TOP 1 rời màn hình; chữ iPhone bay vào ghép với số 4. Cảnh mèo vẫn là bản cũ và sẽ được chỉnh sau.

## v1.2 – Chuyển động element liên tục
- Khi nhấn Khám phá, đo vị trí thật của ba ô nhập và đặt từng chữ số tại đúng vị trí tương ứng. Ô nhập nhạt dần; các chữ số bay ra từ đó.
- Số 1 và số 4 trong kết quả 14 là hai element riêng được giữ nguyên định danh xuyên suốt cảnh. Số 1 di chuyển xuống chỗ trống TOP 1; số 4 đứng lại.
- Chỉ ghép `iPhone` trước; sau đó element số 4 di chuyển từ phía trên xuống ghép thành `iPhone 4`.
- Chưa sửa hoạt hình mèo.
