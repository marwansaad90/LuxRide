<?php
/**
 * One-time seed data copied from the approved React LuxRide content.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}

function luxride_seed_records(): array
{
    $vehicles = [
        ['type' => 'luxride_vehicle', 'slug' => 'corolla', 'title' => 'Toyota Corolla', 'order' => 10, 'meta' => ['luxride_source_id' => 'corolla', 'luxride_vehicle_type' => 'Sedan', 'luxride_vehicle_type_ar' => 'سيدان', 'luxride_image_url' => 'corolla-DapmP377.webp', 'luxride_passengers' => 3, 'luxride_baggage' => 2, 'luxride_features_en' => 'Up to 3 passengers · 2 bags', 'luxride_features_ar' => 'حتى 3 ركاب · حقيبتان', 'luxride_trip_type' => 'sedan', 'luxride_active' => 1, 'luxride_wifi' => 1, 'luxride_summary_en' => 'Comfortable private car for couples and solo travellers', 'luxride_summary_ar' => 'سيارة مريحة للأزواج والمسافرين بمفردهم']],
        ['type' => 'luxride_vehicle', 'slug' => 'xpander', 'title' => 'Mitsubishi Xpander 2027', 'order' => 20, 'meta' => ['luxride_source_id' => 'xpander', 'luxride_vehicle_type' => 'MPV', 'luxride_vehicle_type_ar' => 'MPV', 'luxride_image_url' => 'xpander-C6iSlNr2.webp', 'luxride_passengers' => 4, 'luxride_baggage' => 4, 'luxride_features_en' => 'Up to 4 passengers · 4 bags', 'luxride_features_ar' => 'حتى 4 ركاب · 4 حقائب', 'luxride_trip_type' => 'mpv', 'luxride_active' => 1, 'luxride_wifi' => 1, 'luxride_summary_en' => 'Ideal for families and small groups', 'luxride_summary_ar' => 'مثالية للعائلات والمجموعات الصغيرة']],
        ['type' => 'luxride_vehicle', 'slug' => 'hiace', 'title' => 'Toyota HiAce', 'order' => 30, 'meta' => ['luxride_source_id' => 'hiace', 'luxride_vehicle_type' => 'Mini Van', 'luxride_vehicle_type_ar' => 'ميني فان', 'luxride_image_url' => 'hiace-C5medIaU.webp', 'luxride_passengers' => 8, 'luxride_baggage' => 8, 'luxride_features_en' => 'Up to 8 passengers · 8 bags', 'luxride_features_ar' => 'حتى 8 ركاب · 8 حقائب', 'luxride_trip_type' => 'minivan', 'luxride_active' => 1, 'luxride_wifi' => 0, 'luxride_summary_en' => 'For larger groups and extra luggage', 'luxride_summary_ar' => 'للمجموعات الأكبر والأمتعة الإضافية']],
    ];

    $destinations = luxride_seed_destinations();
    $experiences = luxride_seed_experiences();
    $faqs = luxride_seed_faqs();

    return array_merge($vehicles, $destinations, $experiences, $faqs);
}

function luxride_destination_record(string $id, int $order, string $from, string $to, string $image, string $duration, int $price, array $extra = []): array
{
    $meta = array_merge([
        'luxride_source_id' => $id,
        'luxride_route_from' => $from,
        'luxride_route_to' => $to,
        'luxride_image_url' => $image,
        'luxride_duration' => $duration,
        'luxride_from_price' => $price,
        'luxride_airport_fee' => str_contains($from, 'Airport') || str_contains($to, 'Airport') ? 1 : 0,
        'luxride_permit_required' => in_array($from, ['Luxor', 'Aswan', 'Cairo', 'Sharm El Sheikh'], true) || in_array($to, ['Luxor', 'Aswan', 'Cairo', 'Sharm El Sheikh'], true) ? 1 : 0,
        'luxride_context' => 'destination',
        'luxride_active' => 1,
    ], $extra);

    return ['type' => 'luxride_destination', 'slug' => $id, 'title' => "{$from} to {$to}", 'order' => $order, 'meta' => $meta];
}

function luxride_seed_destinations(): array
{
    $airport = ['luxride_group_en' => 'Airport transfers', 'luxride_group_ar' => 'توصيلات المطار'];
    $area = ['luxride_group_en' => 'Hurghada area transfers', 'luxride_group_ar' => 'توصيلات منطقة الغردقة'];
    $long = ['luxride_group_en' => 'City and long-distance transfers', 'luxride_group_ar' => 'توصيلات المدن والمسافات الطويلة'];
    $al_ahyaa = 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
    $alexandria = 'https://images.unsplash.com/photo-1682090500311-9e57a5a57390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
    $sharm = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Sharm_El_Sheikh._Naama_Bay..jpg/1280px-Sharm_El_Sheikh._Naama_Bay..jpg';

    return [
        luxride_destination_record('airport-hurghada', 101, 'Hurghada Airport', 'Hurghada', 'hurghada-client-Cf7RMFet.jpg', '20 min', 13, array_merge($airport, ['luxride_context' => 'popular,destination'])),
        luxride_destination_record('airport-makadi', 102, 'Hurghada Airport', 'Makadi Bay', 'makadi-bay-transfer-DT-qVWIH.webp', '40 min', 18, array_merge($airport, ['luxride_context' => 'popular,destination'])),
        luxride_destination_record('airport-gouna', 103, 'Hurghada Airport', 'El Gouna', 'el-gouna-transfer-C--OCwK9.webp', '35 min', 21, array_merge($airport, ['luxride_context' => 'popular,destination'])),
        luxride_destination_record('airport-sahl', 104, 'Hurghada Airport', 'Sahl Hasheesh', 'sahl-hasheesh-client-Cg4CCvc7.jpg', '30 min', 15, array_merge($airport, ['luxride_context' => 'popular,destination'])),
        luxride_destination_record('airport-village', 105, 'Hurghada Airport', 'Village Road', 'village-road-transfer-D3tiIelP.webp', 'on request', 14, array_merge($airport, ['luxride_context' => 'popular,destination', 'luxride_image_position' => 'center 62%'])),
        luxride_destination_record('airport-ahyaa', 106, 'Hurghada Airport', 'Al Ahyaa', $al_ahyaa, 'on request', 14, array_merge($airport, ['luxride_context' => 'popular,destination'])),
        luxride_destination_record('hurghada-city-airport', 201, 'Hurghada', 'Hurghada Airport', 'airport-client-DcCKDvLK.jpg', '20 min', 13, array_merge($area, ['luxride_context' => 'popular,destination', 'luxride_image_position' => 'center 58%', 'luxride_display_from_en' => 'Hurghada City', 'luxride_display_from_ar' => 'مدينة الغردقة'])),
        luxride_destination_record('hurghada-village', 202, 'Hurghada', 'Village Road', 'village-road-transfer-D3tiIelP.webp', 'on request', 13, array_merge($area, ['luxride_image_position' => 'center 62%'])),
        luxride_destination_record('hurghada-makadi', 203, 'Hurghada', 'Makadi Bay', 'makadi-bay-transfer-DT-qVWIH.webp', '40 min', 15, $area),
        luxride_destination_record('hurghada-gouna', 204, 'Hurghada', 'El Gouna', 'el-gouna-transfer-C--OCwK9.webp', '35 min', 18, $area),
        luxride_destination_record('hurghada-sahl', 205, 'Hurghada', 'Sahl Hasheesh', 'sahl-hasheesh-client-Cg4CCvc7.jpg', '30 min', 15, $area),
        luxride_destination_record('hurghada-soma', 206, 'Hurghada', 'Soma Bay', 'soma-bay-transfer-DpDkPAWy.webp', '50 min', 22, $area),
        luxride_destination_record('hurghada-ahyaa', 207, 'Hurghada', 'Al Ahyaa', $al_ahyaa, 'on request', 15, $area),
        luxride_destination_record('hurghada-luxor', 301, 'Hurghada', 'Luxor', 'luxor-private-transfer-Bzl7xXK9.webp', '4 h', 75, array_merge($long, ['luxride_context' => 'popular,destination'])),
        luxride_destination_record('hurghada-cairo', 302, 'Hurghada', 'Cairo', 'cairo-pyramids-transfer-DZehCFZ5.webp', '5 h 30 min', 107, array_merge($long, ['luxride_context' => 'popular,destination'])),
        luxride_destination_record('hurghada-sharm', 303, 'Hurghada', 'Sharm El Sheikh', $sharm, '6 h', 268, $long),
        luxride_destination_record('hurghada-aswan', 304, 'Hurghada', 'Aswan', 'aswan-private-transfer-BMsSpzQt.webp', '7 h', 130, $long),
        luxride_destination_record('hurghada-alexandria', 305, 'Hurghada', 'Alexandria', $alexandria, '8 h', 268, $long),
        luxride_destination_record('hurghada-marsa-alam', 306, 'Hurghada', 'Marsa Alam', 'marsa-alam-transfer-CXOBN-Z0.webp', '3 h', 73, array_merge($long, ['luxride_context' => 'popular,destination'])),
        luxride_destination_record('hurghada-wadi-el-gemal', 307, 'Hurghada', 'Wadi El Gemal', 'wadi-el-gemal-transfer-D9G_lI_K.webp', '4 h', 160, array_merge($long, ['luxride_context' => 'popular,destination'])),
    ];
}

function luxride_seed_experiences(): array
{
    return [
        luxride_experience_record('hurghada-luxor-unforgettable-day-trip', 10, '2026-08-09', 'A Featured Journey: An Unforgettable Day Trip to Luxor', 'رحلة مميزة: يوم لا يُنسى إلى الأقصر', ['luxor-day-trip-3-x0e8B2c3.webp', 'luxor-day-trip-1-BP1aqwBB.webp', 'luxor-day-trip-5-DbrTdZbg.webp', 'luxor-day-trip-2-90lh6n3b.webp', 'luxor-day-trip-4-BcC53DUm.webp'], 'Round Trip Transfer', 'توصيلة ذهاب وعودة', 'Mitsubishi Xpander 2027', 'A recent full-day Hurghada to Luxor transfer with punctual pickup, a sparkling clean air-conditioned vehicle, cold drinks, flexible sightseeing, and a smooth hotel drop-off.', 'توصيلة حديثة ليوم كامل من الغردقة إلى الأقصر مع استلام دقيق، وسيارة مكيفة ونظيفة، ومشروبات باردة، ومرونة في الجولة، وعودة سلسة إلى الفندق.', 'We’d love to share the story of a recent trip with one of our valued guests who chose us for a full-day journey from Hurghada to Luxor.\n\nFrom the very start, our driver arrived right on the dot, greeting them with a sparkling clean, fully air-conditioned vehicle built for absolute comfort in the desert heat. To make the long drive even more enjoyable, we had a cold box ready and packed with refreshing drinks and tasty treats.\n\nAs they crossed the desert, whenever the drinks ran low, the driver did not wait to be asked. He proactively pulled over at a local store to restock cold beverages, keeping everyone refreshed throughout the ride.\n\nDuring their tour of ancient Luxor, the guests enjoyed complete flexibility, exploring at their own pace without ever feeling rushed. Communication was smooth and easy in basic English, and for any extra questions, translation apps made the conversation completely effortless.\n\nThey wrapped up the day feeling relaxed, refreshed, and full of great memories, finishing with a smooth drop-off right back at their hotel door. For us, it is never just about getting you from point A to point B. It is about taking care of every single detail so you can truly enjoy the ride.', 'نود مشاركة قصة رحلة حديثة مع أحد ضيوفنا الكرام الذي اختارنا ليوم كامل من الغردقة إلى الأقصر.\n\nمنذ البداية وصل السائق في الموعد تماماً، واستقبل الضيوف بسيارة نظيفة ولامعة ومكيفة بالكامل، ومجهزة لراحة عالية في حرارة الطريق الصحراوي. ولجعل الرحلة الطويلة أكثر متعة، كانت هناك حقيبة تبريد جاهزة ومليئة بالمشروبات الباردة والوجبات الخفيفة.\n\nوأثناء عبور الصحراء، عندما بدأت المشروبات تنفد، لم ينتظر السائق أن يُطلب منه ذلك؛ بل توقف من تلقاء نفسه عند متجر محلي لإعادة تزويد السيارة بالمشروبات الباردة، ليبقى الجميع منتعشين طوال الطريق.\n\nوخلال جولتهم في آثار الأقصر القديمة، استمتع الضيوف بمرونة كاملة واستكشفوا على وتيرتهم الخاصة من دون أي شعور بالاستعجال. كان التواصل سهلاً وواضحاً بالإنجليزية الأساسية، وأي أسئلة إضافية جعلت تطبيقات الترجمة المحادثة أكثر سلاسة.\n\nاختتم الضيوف يومهم وهم مرتاحون ومنتعشون وممتلئون بذكريات جميلة، مع توصيل سلس حتى باب الفندق. بالنسبة لنا، الأمر لا يقتصر على نقلك من نقطة إلى أخرى؛ بل على الاهتمام بكل تفصيلة حتى تستمتع بالرحلة حقاً.', ['#Luxor', '#PrivateTransfer'], ['#الأقصر', '#توصيلة_خاصة'], 'Hurghada City Center', 'Luxor', 'roundTrip'),
        luxride_experience_record('hurghada-wadi-el-gemal-overday', 20, '2026-08-07', 'Nature Escape Transfer: Hurghada to Wadi El Gemal', 'توصيلة طبيعية خاصة: من الغردقة إلى وادي الجمال', ['wadi-el-gemal-transfer-D9G_lI_K.webp'], 'Round Trip Transfer', 'توصيلة ذهاب وعودة', 'Mitsubishi Xpander 2027', 'A private round trip from Hurghada to the Wadi El Gemal area with clear route planning and fixed pricing.', 'توصيلة خاصة ذهاباً وعودة من الغردقة إلى منطقة وادي الجمال مع تخطيط واضح وسعر ثابت.', 'A private transfer designed for guests heading from Hurghada to the Wadi El Gemal area with a calm pickup, clear route planning, comfortable air-conditioned seating, and fixed pricing shown before the request is sent.', 'توصيلة خاصة للضيوف المتجهين من الغردقة إلى منطقة وادي الجمال مع استلام هادئ، وتخطيط واضح للمسار، ومقاعد مكيفة مريحة، وسعر ثابت يظهر قبل إرسال الطلب.', ['#WadiElGemal', '#PrivateTransfer'], ['#وادي_الجمال', '#توصيلة_خاصة'], 'Hurghada City Center', 'Wadi El Gemal', 'roundTrip'),
        luxride_experience_record('hurghada-luxor-dendera-overday', 30, '2026-08-06', 'Historical Private Transfer: Hurghada to Luxor & Dendera', 'توصيلة تاريخية خاصة: من الغردقة إلى الأقصر ودندرة', ['luxor-statue-transfer-CimtBXId.webp'], 'Round Trip Transfer', 'توصيلة ذهاب وعودة', 'Mitsubishi Xpander 2027', 'A full-day private transfer from Hurghada through the desert road to Luxor and Dendera.', 'توصيلة خاصة ليوم كامل من الغردقة عبر الطريق الصحراوي إلى الأقصر ودندرة.', 'A full-day private transfer for a German family from Hurghada through the desert road to Luxor, with time planned for the Valley of the Kings and a return stop near Dendera. The transfer keeps the practical details visible: fixed price, private vehicle, planned breaks, and direct booking support.', 'توصيلة خاصة ليوم كامل لعائلة ألمانية من الغردقة عبر الطريق الصحراوي إلى الأقصر، مع وقت مخطط لوادي الملوك وتوقف في طريق العودة قرب دندرة. تعرض التوصيلة التفاصيل العملية بوضوح: سعر ثابت، سيارة خاصة، استراحات مخططة، ودعم مباشر للحجز.', ['#Luxor', '#DenderaTemple', '#PrivateTransfer'], ['#الأقصر', '#معبد_دندرة', '#توصيلة_خاصة'], 'Hurghada City Center', 'Luxor', 'roundTrip'),
        luxride_experience_record('hurghada-port-ghalib-marina-overday', 40, '2026-08-08', 'Marina Escape Transfer: Hurghada to Porto Ghalib', 'توصيلة مارينا خاصة: من الغردقة إلى بورتو غالب', ['port-ghalib-transfer-CMQmh6KK.jpg'], 'Round Trip Transfer', 'توصيلة ذهاب وعودة', 'Mitsubishi Xpander 2027', 'A comfortable private transfer from Hurghada to Porto Ghalib Marina, planned around relaxed Red Sea views and clear fixed pricing.', 'توصيلة خاصة ومريحة من الغردقة إلى مارينا بورتو غالب، مع رحلة هادئة على ساحل البحر الأحمر وسعر ثابت واضح.', 'A private Red Sea transfer for guests heading from Hurghada to Porto Ghalib Marina, with comfortable air-conditioned seating, space for luggage, planned pickup details, and fixed pricing prepared before the booking request is sent.', 'توصيلة خاصة على ساحل البحر الأحمر للضيوف المتجهين من الغردقة إلى مارينا بورتو غالب، مع مقاعد مكيفة ومريحة، ومساحة للأمتعة، وتفاصيل استلام واضحة، وسعر ثابت يظهر قبل إرسال طلب الحجز.', ['#PortoGhalib', '#PrivateTransfer'], ['#بورتو_غالب', '#توصيلة_خاصة'], 'Hurghada City Center', 'Porto Ghaleb', 'roundTrip', 'center 72%'),
        luxride_experience_record('hurghada-sharm-one-way', 50, '2026-08-05', 'Direct Private Transfer: Hurghada to Sharm El Sheikh', 'توصيلة خاصة مباشرة: من الغردقة إلى شرم الشيخ', ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Sharm_El_Sheikh._Naama_Bay..jpg/1280px-Sharm_El_Sheikh._Naama_Bay..jpg'], 'One Way Transfer', 'توصيلة ذهاب فقط', 'Mitsubishi Xpander 2027', 'A smooth direct private overland transfer from Hurghada to Sharm El Sheikh.', 'توصيلة برية خاصة ومباشرة من الغردقة إلى شرم الشيخ.', 'A smooth overland private transfer for guests traveling directly from Hurghada to Sharm El Sheikh, with luggage space, air-conditioned comfort, and fixed pricing without hidden surprises.', 'توصيلة برية خاصة وسلسة للضيوف المسافرين مباشرة من الغردقة إلى شرم الشيخ، مع مساحة للأمتعة وراحة مكيفة وسعر ثابت دون مفاجآت مخفية.', ['#SharmElSheikh', '#DoorToDoor'], ['#شرم_الشيخ', '#من_الباب_إلى_الباب'], 'Hurghada City Center', 'Sharm El Sheikh', 'oneWay'),
    ];
}

function luxride_experience_record(string $slug, int $order, string $date, string $title, string $title_ar, array $images, string $route_type, string $route_type_ar, string $vehicle, string $excerpt, string $excerpt_ar, string $description, string $description_ar, array $tags, array $tags_ar, string $from, string $to, string $trip, string $image_position = ''): array
{
    return ['type' => 'luxride_experience', 'slug' => $slug, 'title' => $title, 'date' => $date, 'order' => $order, 'content' => $description, 'meta' => ['luxride_source_id' => $slug, 'luxride_title_ar' => $title_ar, 'luxride_gallery_urls' => wp_json_encode($images, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 'luxride_route_type_en' => $route_type, 'luxride_route_type_ar' => $route_type_ar, 'luxride_vehicle_en' => $vehicle, 'luxride_vehicle_ar' => $vehicle, 'luxride_summary_en' => $excerpt, 'luxride_summary_ar' => $excerpt_ar, 'luxride_description_ar' => $description_ar, 'luxride_tags_en' => wp_json_encode($tags, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 'luxride_tags_ar' => wp_json_encode($tags_ar, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 'luxride_booking_from' => $from, 'luxride_booking_to' => $to, 'luxride_booking_trip' => $trip, 'luxride_image_position' => $image_position, 'luxride_active' => 1]];
}

function luxride_seed_faqs(): array
{
    $home_en = [
        ['How will I meet my driver at Hurghada Airport?', "Your driver will be waiting in the arrivals hall holding a sign with your name. If you can't find them, a quick WhatsApp message connects you instantly."],
        ['Is the displayed transfer price final?', 'Yes. The approved base price and every applicable airport, permit, discount, or accommodation item are shown separately before submission.'],
        ['Can I book a Round Trip?', 'Yes. Every route supports One Way and Round Trip options, with the approved fixed price shown before submission.'],
        ['What happens if my flight is delayed?', 'We monitor your flight in real time and adjust the pickup automatically — at no extra cost to you.'],
        ['Can I request a child seat?', 'Yes, a child seat can be requested free of charge with any transfer. Please select the child seat option when booking.'],
        ['How can I confirm my booking?', 'Complete the three booking steps and use the single Send Booking Request button. LuxRide will review the details and contact you to confirm availability.'],
        ['What is the cancellation policy?', 'Full refund when cancelled at least 24 hours before the experience start time in the local timezone. No refund for cancellation less than 24 hours before the start time.'],
    ];
    $home_ar = [
        ['كيف سألتقي بسائقي في مطار الغردقة؟', 'سيكون سائقك في انتظارك في صالة الوصول حاملاً لافتة باسمك. إذا لم تجده، رسالة واتساب سريعة تصلك به فوراً.'],
        ['هل السعر المعروض للنقل نهائي؟', 'نعم. يُعرض السعر الأساسي المعتمد وكل رسم مطار أو تصريح أو خصم أو مبيت مطبق بشكل منفصل قبل الإرسال.'],
        ['هل يمكنني حجز ذهاب وعودة؟', 'نعم. يدعم كل مسار خياري الذهاب فقط والذهاب والعودة، مع عرض السعر الثابت المعتمد قبل الإرسال.'],
        ['ماذا يحدث إذا تأخرت رحلتي الجوية؟', 'نتابع رحلتك في الوقت الفعلي ونعدّل موعد الاستلام تلقائياً — دون أي تكلفة إضافية.'],
        ['هل يمكنني طلب كرسي أطفال؟', 'نعم، يمكن طلب كرسي أطفال مجاناً مع أي توصيلة. يرجى اختيار خيار كرسي الأطفال أثناء الحجز.'],
        ['كيف يمكنني تأكيد حجزي؟', 'أكمل خطوات الحجز الثلاث واستخدم زر إرسال طلب الحجز الوحيد. ستراجع LuxRide التفاصيل وتتواصل معك لتأكيد التوفر.'],
        ['ما سياسة الإلغاء؟', 'استرداد كامل عند الإلغاء قبل 24 ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي. لا استرداد عند الإلغاء قبل أقل من 24 ساعة من وقت البدء.'],
    ];

    $page_en = [
        ['Is the displayed transfer price final?', 'Yes. The price displayed in the calculator is fixed and inclusive, with no hidden fees. Airport operating fees and mandatory tourism travel permits are displayed separately and clearly before the booking is submitted.'],
        ['Can I request a child seat?', 'Yes, a child seat can be requested free of charge with any transfer. Please select the child seat option when booking.'],
        ['How can I confirm my booking?', 'Complete the three booking steps and select the single Send Booking Request button. LuxRide will review the details and contact you to confirm availability.'],
        ['Can I make a booking for today?', 'Standard online bookings must be submitted at least three hours before departure. For last-minute or same-day bookings, contact LuxRide directly through WhatsApp to check availability.'],
        ['What happens if my flight is delayed?', 'LuxRide monitors the flight status in real time and adjusts the airport pickup time accordingly.'],
        ['How long will the driver wait at the airport?', 'The maximum waiting time for airport arrivals is three hours.'],
        ['Do long-distance transfers require travel permits?', 'Yes. Transfers to Luxor, Aswan, Cairo, and Sharm El Sheikh require an official tourism and security permit. The applicable permit fee is displayed clearly in the final booking price.'],
        ['Can I book a Round Trip?', 'Yes. Every route supports One Way and Round Trip options, with the approved fixed price shown before submission.'],
        ['Are taxes included?', 'Yes. All prices are shown in EUR and are tax inclusive.'],
        ['Can I change my booking?', 'Yes. Contact us on WhatsApp with your booking details and we will do our best to accommodate changes based on availability.'],
        ['What is the cancellation policy?', 'Full refund when cancelled at least 24 hours before the experience start time in the local timezone. No refund for cancellation less than 24 hours before the start time.'],
        ['How do I meet the driver?', 'For airport arrivals, your driver waits in the arrivals hall holding a sign with your name. For hotel pickups, the driver meets you at reception at the agreed time.'],
        ['Can additional destinations be added?', 'Yes. Mention any additional stops in your booking notes or on WhatsApp and we will provide an updated fixed price.'],
    ];
    $page_ar = [
        ['هل السعر المعروض للنقل نهائي؟', 'نعم. السعر المعروض في الحاسبة ثابت وشامل، بدون رسوم خفية. تُعرض رسوم تشغيل المطار وتصاريح السفر السياحي الإلزامية بشكل منفصل وواضح قبل إرسال الحجز.'],
        ['هل يمكنني طلب كرسي أطفال؟', 'نعم، يمكن طلب كرسي أطفال مجاناً مع أي توصيلة. يرجى اختيار خيار كرسي الأطفال أثناء الحجز.'],
        ['كيف يمكنني تأكيد حجزي؟', 'أكمل خطوات الحجز الثلاث ثم اختر زر إرسال طلب الحجز الوحيد. ستراجع LuxRide التفاصيل وتتواصل معك لتأكيد التوفر.'],
        ['هل يمكنني الحجز لليوم؟', 'يجب تقديم الحجوزات القياسية عبر الإنترنت قبل ثلاث ساعات على الأقل من المغادرة. للحجوزات اللحظية أو في نفس اليوم، تواصل مع LuxRide مباشرةً عبر واتساب للتحقق من التوفر.'],
        ['ماذا يحدث إذا تأخرت رحلتي الجوية؟', 'تتابع LuxRide حالة الرحلة في الوقت الفعلي وتعدّل موعد استلام المطار وفقاً لذلك.'],
        ['كم سينتظر السائق في المطار؟', 'الحد الأقصى لوقت الانتظار لوصول المطار هو ثلاث ساعات.'],
        ['هل تتطلب التوصيلات بعيدة المسافة تصاريح سفر؟', 'نعم. تتطلب التوصيلات إلى الأقصر وأسوان والقاهرة وشرم الشيخ تصريحاً سياحياً وأمنياً رسمياً. تُعرض رسوم التصريح المطبقة بوضوح في السعر النهائي للحجز.'],
        ['هل يمكنني حجز ذهاب وعودة؟', 'نعم. يدعم كل مسار خياري الذهاب فقط والذهاب والعودة، مع عرض السعر الثابت المعتمد قبل الإرسال.'],
        ['هل الضرائب مشمولة؟', 'نعم. جميع الأسعار معروضة باليورو وشاملة الضريبة.'],
        ['هل يمكنني تعديل حجزي؟', 'نعم. تواصل معنا عبر واتساب مع تفاصيل حجزك وسنبذل قصارى جهدنا لاستيعاب التغييرات حسب التوفر.'],
        ['ما هي سياسة الإلغاء؟', 'استرداد كامل عند الإلغاء قبل ٢٤ ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي. لا استرداد عند الإلغاء قبل أقل من ٢٤ ساعة من وقت البدء.'],
        ['كيف أقابل السائق؟', 'لوصول المطار، ينتظرك السائق في صالة الوصول حاملاً لافتة باسمك. لاستلام الفنادق، يقابلك السائق في الاستقبال في الوقت المتفق عليه.'],
        ['هل يمكن إضافة وجهات إضافية؟', 'نعم. اذكر أي محطات إضافية في ملاحظات حجزك أو عبر واتساب وسنوفّر سعراً ثابتاً محدّثاً.'],
    ];

    $records = [];
    foreach ($home_en as $index => $item) {
        $records[] = luxride_faq_record('home-faq-' . ($index + 1), 'home', $index + 1, $item[0], $item[1], $home_ar[$index][0], $home_ar[$index][1]);
    }
    foreach ($page_en as $index => $item) {
        $records[] = luxride_faq_record('page-faq-' . ($index + 1), 'page', $index + 1, $item[0], $item[1], $page_ar[$index][0], $page_ar[$index][1]);
    }

    return $records;
}

function luxride_faq_record(string $slug, string $context, int $order, string $q, string $a, string $q_ar, string $a_ar): array
{
    return ['type' => 'luxride_faq', 'slug' => $slug, 'title' => $q, 'order' => $order, 'content' => $a, 'meta' => ['luxride_source_id' => $slug, 'luxride_faq_context' => $context, 'luxride_question_ar' => $q_ar, 'luxride_answer_ar' => $a_ar, 'luxride_active' => 1]];
}

function luxride_ensure_seed_content(bool $force = false): void
{
    foreach (luxride_seed_records() as $record) {
        $existing = get_page_by_path($record['slug'], OBJECT, $record['type']);
        if ($existing && !$force) {
            continue;
        }

        $post_data = [
            'post_type' => $record['type'],
            'post_status' => 'publish',
            'post_name' => $record['slug'],
            'post_title' => $record['title'],
            'post_content' => $record['content'] ?? '',
            'post_date' => ($record['date'] ?? current_time('mysql')),
            'menu_order' => (int) $record['order'],
        ];

        $post_id = $existing ? wp_update_post(array_merge(['ID' => $existing->ID], $post_data), true) : wp_insert_post($post_data, true);
        if (is_wp_error($post_id)) {
            continue;
        }

        foreach (($record['meta'] ?? []) as $key => $value) {
            update_post_meta((int) $post_id, $key, $value);
        }
    }

    update_option('luxride_seed_version', '2026-08-13-phase-1');
}
