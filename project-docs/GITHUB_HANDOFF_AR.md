# دليل تسليم ورفع مشروع LuxRide على GitHub

هذا الدليل يشرح كيف يحتفظ مالك المشروع بالكود في حساب GitHub الخاص به، وكيف يرفع التعديلات المستقبلية بطريقة آمنة.

## ما الذي يحفظه GitHub؟

يحفظ المستودع كود واجهة React، قالب WordPress، إضافة LuxRide، السكربتات، الصور المضمنة في المشروع، والوثائق. لا يُعد GitHub نسخة احتياطية من قاعدة بيانات الموقع أو الحجوزات أو مكتبة وسائط WordPress أو إعدادات الخادم السرية.

يجب حفظ قاعدة البيانات وملفات `wp-content/uploads` ونسخ الخادم الاحتياطية في مساحة نسخ احتياطي منفصلة وآمنة.

## الطريقة الموصى بها لتسليم الملكية

إذا كان المشروع موجودًا بالفعل في مستودع GitHub ويراد الاحتفاظ بجميع النسخ السابقة وسجل التعديلات:

1. ينشئ العميل حساب GitHub ويفعّل المصادقة الثنائية.
2. يرسل اسم مستخدم GitHub فقط، ولا يرسل كلمة المرور أو رمز التحقق.
3. ينقل مالك المستودع الحالي ملكية المستودع من إعدادات GitHub إلى حساب العميل.
4. يضيف العميل المبرمج بصفته `Collaborator` عند الحاجة إلى صيانة مستقبلية.
5. يبقى الفرع الرئيسي باسم `main`، ويُفضّل تفعيل حمايته ومنع الحذف أو الـ force push.

نقل الملكية هو الخيار الأفضل لأنه يحافظ على سجل Git والـ commits والروابط والمشكلات والإصدارات.

## إنشاء مستودع جديد في حساب العميل

إذا لم يتم نقل المستودع الحالي:

1. يدخل العميل إلى GitHub ويختار `New repository`.
2. يختار اسمًا مثل `LuxRide` ويجعله `Private`.
3. لا يفعّل إنشاء README أو `.gitignore` أو License لأن المشروع يحتويها مسبقًا.
4. يضيف المبرمج كمتعاون من `Settings > Collaborators`.
5. يربط المبرمج المشروع المحلي بالمستودع الجديد ثم يرفع الفرع `main`.

أوامر الربط التي ينفذها المبرمج بعد استبدال `CLIENT_USERNAME` باسم حساب العميل:

```bash
git remote rename origin previous-origin
git remote add origin https://github.com/CLIENT_USERNAME/LuxRide.git
git push -u origin main
```

لا يُطلب من العميل مشاركة كلمة المرور. تسجيل الدخول يتم عبر GitHub Desktop أو نافذة GitHub الرسمية.

## الطريقة السهلة باستخدام GitHub Desktop

### الإعداد لأول مرة

1. ثبّت GitHub Desktop من الموقع الرسمي وسجّل الدخول بحساب العميل.
2. اختر `File > Clone repository`.
3. اختر مستودع `LuxRide` وحدد مجلدًا محليًا مناسبًا.
4. بعد انتهاء النسخ افتح المشروع من GitHub Desktop أو محرر الأكواد.

### رفع تحديث مستقبلي

1. افتح GitHub Desktop واضغط `Fetch origin` ثم `Pull origin` قبل البدء.
2. نفّذ التعديل داخل مجلد المشروع.
3. راجع قائمة `Changes` وتأكد من عدم وجود ملفات سرية أو نسخ احتياطية.
4. اكتب ملخصًا واضحًا، مثل `Update transfer prices` أو `Fix booking form`.
5. اضغط `Commit to main` للتعديلات البسيطة المعتمدة، أو أنشئ فرعًا جديدًا للتغييرات البرمجية الكبيرة.
6. اضغط `Push origin`.
7. افتح صفحة المستودع على GitHub وتأكد أن آخر commit ظهر.

رفع الملفات إلى GitHub لا ينشرها تلقائيًا على موقع WordPress. النشر على الإنتاج عملية منفصلة تتطلب بناء الواجهة عند الحاجة، ونسخة احتياطية، ورفع الملفات المطلوبة، ومسح الكاش، ثم الفحص.

## طريقة المبرمج باستخدام Git

قبل كل تعديل:

```bash
git switch main
git pull --rebase origin main
git status
```

بعد التعديل والاختبار:

```bash
npm install
npm run check
git status
git diff
git add path/to/changed-file
git commit -m "Describe the completed change"
git pull --rebase origin main
git push origin main
```

يفضّل استخدام فرع وPull Request للتغييرات الكبيرة:

```bash
git switch -c feature/short-description
git add path/to/changed-file
git commit -m "Describe the completed change"
git push -u origin feature/short-description
```

ثم يفتح المبرمج Pull Request، وتتم المراجعة قبل دمجه في `main`.

## فحوصات مطلوبة قبل الرفع

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

لتعديلات إضافة WordPress، افحص ملفات PHP المعدلة أيضًا:

```bash
php -l wordpress/wp-content/plugins/luxride-booking-engine/luxride-booking-engine.php
php -l wordpress/wp-content/plugins/luxride-booking-engine/includes/class-luxride-booking-admin.php
php -l wordpress/wp-content/plugins/luxride-booking-engine/includes/class-luxride-booking-importer.php
```

## ملفات ممنوع رفعها

- `.env` وأي ملف يحتوي كلمات مرور أو رموز API.
- `wp-config.php`.
- مفاتيح SSH وملفات `.pem` أو `.ppk`.
- نسخ قواعد البيانات مثل `.sql` و`.sql.gz` و`.dump`.
- نسخ الخادم الاحتياطية ومجلدات Updraft أو All-in-One WP Migration.
- مجلدات WordPress التشغيلية مثل `uploads` و`cache`.
- `node_modules` و`dist` وملفات الكاش والسجلات.
- بيانات العملاء أو الحجوزات المصدرة من الإنتاج.

إذا ظهر ملف من هذه الأنواع في GitHub Desktop، لا تنفذ commit قبل مراجعته وإزالته من قائمة التغييرات.

## استعادة المشروع على جهاز جديد

1. ثبّت GitHub Desktop أو Git، وNode.js 20 أو أحدث.
2. انسخ المستودع من حساب العميل.
3. افتح مجلد المشروع ونفّذ:

```bash
npm install
npm run check
```

4. أضف إعدادات البيئة محليًا من المصدر الآمن؛ لا تستخرجها من GitHub ولا ترفعها إليه.
5. استعد قاعدة البيانات ووسائط WordPress من نسخة الخادم الاحتياطية فقط إذا كان المطلوب إنشاء بيئة WordPress كاملة.

## قائمة تحقق سريعة

- المستودع في حساب العميل ومضبوط على `Private`.
- العميل هو المالك والمبرمج Collaborator فقط.
- المصادقة الثنائية مفعلة.
- لا توجد أسرار أو قواعد بيانات أو بيانات عملاء في GitHub.
- `main` محدث وآخر commit ظاهر على GitHub.
- الاختبارات والبناء ناجحان قبل كل رفع.
- يوجد نسخ احتياطي منفصل لقاعدة البيانات والوسائط.
- النشر على الموقع يتم بخطوات منفصلة بعد GitHub.
