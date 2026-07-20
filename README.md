# KMS301 Frontend

Prototype web frontend cho môn KMS301, dùng React + Vite để demo giao diện knowledge management dashboard.

## Chạy local

```bash
npm install
npm run dev
```

Mặc định app chạy tại:

```text
http://localhost:5173/
```

## Build production

```bash
npm run build
```

## Kết nối backend

App sẽ thử lấy dữ liệu từ biến môi trường:

```text
VITE_API_URL=http://localhost:4000/api/kms
```

Nếu backend chưa có API này, frontend tự dùng dữ liệu fallback trong `src/data/fallbackData.js` để demo giao diện.

## Cấu trúc chính

```text
src/
  App.jsx
  main.jsx
  styles.css
  assets/
    kms-hero.png
  components/
    KnowledgeScene.jsx
  data/
    fallbackData.js
```
