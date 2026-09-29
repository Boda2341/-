# عاداتي

تطبيق React/Vite لتتبع العادات، جاهز للنشر على Vercel.

## التشغيل المحلي

```powershell
$env:Path="C:\Program Files\nodejs;$env:Path"
npm install
npm run dev
```

## تفعيل Gemini

انسخ `.env.example` إلى `.env.local` وضع مفتاح Gemini في `GEMINI_API_KEY`. المفتاح لا يوضع داخل React ولا يرفع إلى Git.

## النشر على Vercel

1. ارفع مجلد `habits-app` إلى GitHub.
2. اختر المستودع من Vercel واضغط Deploy.
3. أضف Environment Variable باسم `GEMINI_API_KEY` في إعدادات المشروع، ثم أعد Deploy.

إعدادات Vercel: Build Command هو `npm run build` وOutput Directory هو `dist`، وهي موجودة مسبقًا في `vercel.json`.
