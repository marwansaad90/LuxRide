# 03 - إدارة السيارات

## الهدف
تعديل سيارات الأسطول من شاشة سهلة بدون Custom Fields.

## المسار
`WordPress Admin -> Vehicles`

## الخطوات
1. افتح `Vehicles`.
2. اختر Toyota Corolla أو Mitsubishi Xpander 2027 أو Toyota HiAce.
3. عدل `Vehicle Name / Model`.
4. عدل `Vehicle Class`, `Passengers`, `Bags`.
5. اكتب `Summary EN` و `Summary AR`.
6. اكتب `Features EN` و `Features AR`.
7. استخدم `Published / Visible` للتحكم في ظهور السيارة للعميل.
8. استخدم `Available for Booking` لتعطيل الحجز مؤقتاً مع إبقاء السيارة ظاهرة.
9. فعّل أو ألغِ WiFi و Air Conditioning و Ice Box و USB / Charging.
10. اختر الصورة من `Choose from Media Library`.
11. اضغط تحديث.

## معنى الحقول
- `Published / Visible`: إظهار أو إخفاء السيارة من الموقع.
- `Available for Booking`: إذا ألغيتها تبقى السيارة ظاهرة لكنها تصبح باهتة وغير قابلة للحجز.
- `Display Order`: ترتيب العرض.
- `Vehicle Type Label AR`: اسم نوع السيارة بالعربية.
- `Vehicle Image`: صورة السيارة من مكتبة الوسائط.

## الحفظ والتحقق
افتح صفحة `Our Fleet` بالعربية والإنجليزية، ثم جرب السيارة في الحاسبة.

## تعطيل سيارة مؤقتاً
1. افتح السيارة.
2. اترك `Published / Visible` مفعلاً.
3. ألغِ `Available for Booking`.
4. اضغط تحديث.
5. سيراها العميل مع شارة `Temporarily Unavailable` أو `غير متاحة حالياً`.
6. زر الحجز يصبح غير فعال، وخيار الحاسبة يصبح غير قابل للاختيار.
7. لإعادة التفعيل، فعّل `Available for Booking` واحفظ.

## أخطاء شائعة
- كتابة قيمة غير رقمية في الركاب أو الحقائب.
- إلغاء `Published / Visible` عندما تريد فقط إيقاف الحجز مؤقتاً.
- تغيير مفتاح السيارة الداخلي.

## ما لا تلمسه
لا تغير source id. المفاتيح الثابتة هي `sedan`, `mpv`, `minivan`.
