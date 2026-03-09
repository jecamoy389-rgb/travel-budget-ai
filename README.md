# 🌍 TravelBudget AI

Умный калькулятор бюджета путешествий на базе Claude AI с актуальными ценами.

---

## 🚀 Деплой на Vercel (5 минут)

### 1. Загрузи проект на GitHub

1. Зайди на [github.com](https://github.com) → **New repository**
2. Назови его `travel-budget-ai` → **Create repository**
3. Загрузи все файлы этой папки в репозиторий (кнопка "uploading an existing file")

### 2. Задеплой на Vercel

1. Зайди на [vercel.com](https://vercel.com) → **Sign up** (через GitHub)
2. Нажми **Add New → Project**
3. Выбери репозиторий `travel-budget-ai` → **Import**
4. Настройки оставь как есть (Vercel сам определит Vite) → **Deploy**

### 3. Добавь API ключ Anthropic

1. В Vercel открой свой проект → вкладка **Settings → Environment Variables**
2. Добавь переменную:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** твой ключ с [console.anthropic.com](https://console.anthropic.com)
3. Нажми **Save**
4. Зайди в **Deployments** → нажми **Redeploy** (чтобы применить ключ)

### 4. Готово! 🎉

Vercel выдаст ссылку вида `travel-budget-ai.vercel.app` — отправляй всем!

---

## 💻 Запуск локально

```bash
npm install
npm run dev
```

Создай файл `.env` в корне:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 📁 Структура проекта

```
travel-budget-ai/
├── api/
│   └── chat.js          ← Vercel serverless функция (прокси к Anthropic)
├── src/
│   ├── main.jsx         ← Точка входа React
│   └── App.jsx          ← Основной калькулятор
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## 🔒 Безопасность

API ключ хранится только на сервере Vercel в переменных окружения.
Пользователи видят только твой сайт — ключ им недоступен.
