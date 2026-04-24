# G.ARTISAN.A Project Inquiry WebApp

نسخة أولية كاملة لاستمارة طلب مشروع جديد باللغة العربية.

## الملفات

- `index.html` — هيكل الواجهة.
- `style.css` — التصميم والألوان.
- `script.js` — التنقل، الاختيارات، المراجعة، ورسالة واتساب.

## التشغيل محليًا

افتح ملف `index.html` مباشرة في المتصفح.

## رفعها على GitHub Pages

1. أنشئ Repository جديد.
2. ارفع الملفات الثلاثة داخل الجذر:
   - `index.html`
   - `style.css`
   - `script.js`
3. من Settings > Pages:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /root
4. افتح الرابط الناتج.

## تغيير رقم الواتساب

افتح `script.js` وعدّل هذا السطر:

```js
const WHATSAPP_NUMBER = "972XXXXXXXXX";
```

اكتب الرقم بصيغة دولية بدون `+` وبدون مسافات.

مثال:

```js
const WHATSAPP_NUMBER = "9725XXXXXXXX";
```

## تغيير الشعار

في `index.html` ابحث عن:

```html
<div class="brand-logo">
```

واستبدل الـ SVG الموجود بشعارك الحقيقي أو صورة SVG.

## ربط Google Sheets لاحقًا

الملف جاهز مبدئيًا للربط. عند تجهيز Apps Script Web App، ضع الرابط هنا داخل `script.js`:

```js
const GOOGLE_APPS_SCRIPT_URL = "";
```

## ملاحظة

هذه النسخة تفتح واتساب برسالة جاهزة. Google Sheets لم يتم تفعيله بعد لأن هذا يحتاج رابط Apps Script خاص بك.


## طريقة أسرع لاستبدال الشعار

ضع ملف شعارك بصيغة `logo.svg` داخل نفس فولدر المشروع، ثم في `index.html` استبدل الـ SVG داخل:

```html
<div class="brand-logo">
```

بهذا السطر:

```html
<img src="logo.svg" alt="G.ARTISAN.A Logo" />
```


## v1.3 Updates

- تم دمج شعار G.ARTISAN.A الحقيقي داخل البوكس بدل حرف G.
- تمت إضافة ملفين:
  - `logo-gray.svg`: الشعار الكامل كما أرسلته.
  - `logo-mark.svg`: نسخة mark-only مناسبة للمربع الصغير.
- تم تصغير النصوص والبانل الجانبي باتجاه Minimal أنظف.
- تم تخفيف الظلال والزوايا وحجم العناصر.
