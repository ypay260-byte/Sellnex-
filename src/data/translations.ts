import { Language } from '../types';

export interface Translations {
  // Navigation
  nav_dashboard: string;
  nav_products: string;
  nav_import_product: string;
  nav_orders: string;
  nav_store_builder: string;
  nav_customers: string;
  nav_suppliers: string;
  nav_automation: string;
  nav_payments: string;
  nav_delivery: string;
  nav_analytics: string;
  nav_partner_links: string;
  nav_integrations: string;
  nav_pricing: string;
  nav_settings: string;
  nav_admin: string;
  nav_logout: string;
  nav_home: string;
  nav_how_it_works: string;
  nav_features: string;
  nav_login: string;
  nav_signup: string;
  nav_view_store: string;

  // Common UI
  btn_back: string;
  btn_save: string;
  btn_cancel: string;
  btn_delete: string;
  btn_edit: string;
  btn_create: string;
  btn_search: string;
  btn_filter: string;
  btn_loading: string;
  btn_close: string;
  btn_copy: string;
  btn_copied: string;
  btn_select: string;
  btn_view_details: string;
  btn_add_to_cart: string;
  btn_buy_now: string;
  btn_checkout: string;
  btn_confirm_order: string;
  btn_start_selling: string;
  btn_explore_demo: string;
  search_placeholder: string;
  status_active: string;
  status_draft: string;
  status_published: string;
  status_out_of_stock: string;
  status_pending: string;
  status_paid: string;
  status_shipped: string;
  status_delivered: string;
  status_cancelled: string;
  device_mode: string;
  language: string;

  // Top Bar & Notifications
  topbar_import_btn: string;
  topbar_notifications: string;
  topbar_profile: string;
  topbar_verified_seller: string;

  // Landing Page
  landing_badge: string;
  landing_hero_title: string;
  landing_hero_title_highlight: string;
  landing_hero_subtitle: string;
  landing_stat_gmv: string;
  landing_stat_merchants: string;
  landing_stat_delivery: string;
  landing_stat_zero_risk: string;
  landing_how_title: string;
  landing_how_subtitle: string;
  landing_feat_title: string;
  landing_feat_subtitle: string;
  landing_cta_title: string;
  landing_cta_subtitle: string;
  landing_footer_desc: string;
  landing_footer_rights: string;

  // Product Import
  import_title: string;
  import_subtitle: string;
  import_url_label: string;
  import_url_placeholder: string;
  import_btn_action: string;
  import_loading_text: string;
  import_presets_title: string;
  import_product_detected: string;
  import_edit_btn: string;
  import_close_edit: string;
  import_calc_title: string;
  import_calc_subtitle: string;
  import_calc_fixed: string;
  import_calc_fixed_desc: string;
  import_calc_percent: string;
  import_calc_percent_desc: string;
  import_profit_target_label: string;
  import_margin_percent_label: string;
  import_supplier_cost: string;
  import_shipping_cost: string;
  import_payment_fee: string;
  import_platform_fee: string;
  import_your_net_profit: string;
  import_customer_price: string;
  import_customer_price_desc: string;
  import_profit_per_order: string;
  import_margin_rate: string;
  import_btn_publish: string;
  import_btn_save_draft: string;

  // Products View
  products_title: string;
  products_subtitle: string;
  products_add_btn: string;
  products_import_btn: string;
  products_all: string;
  products_published: string;
  products_drafts: string;
  products_out_of_stock: string;
  products_th_product: string;
  products_th_category: string;
  products_th_supplier: string;
  products_th_cost: string;
  products_th_profit: string;
  products_th_selling_price: string;
  products_th_stock: string;
  products_th_status: string;
  products_th_actions: string;

  // Orders View
  orders_title: string;
  orders_subtitle: string;
  orders_tab_all: string;
  orders_tab_pending: string;
  orders_tab_paid: string;
  orders_tab_shipped: string;
  orders_tab_delivered: string;
  orders_th_order_num: string;
  orders_th_customer: string;
  orders_th_items: string;
  orders_th_total: string;
  orders_th_profit: string;
  orders_th_payment: string;
  orders_th_status: string;
  orders_th_date: string;
  orders_action_fulfill: string;

  // Storefront & Checkout
  store_all_products: string;
  store_categories: string;
  store_cart: string;
  store_cart_empty: string;
  store_cart_total: string;
  store_checkout_title: string;
  store_name_label: string;
  store_phone_label: string;
  store_region_label: string;
  store_address_label: string;
  store_payment_method: string;
  store_pay_click: string;
  store_pay_payme: string;
  store_pay_cod: string;
  store_free_shipping: string;
  store_order_success_title: string;
  store_order_success_desc: string;
  store_order_num: string;
  store_back_to_shop: string;

  // Auth & Onboarding
  auth_login_title: string;
  auth_signup_title: string;
  auth_login_subtitle: string;
  auth_signup_subtitle: string;
  auth_name: string;
  auth_email: string;
  auth_phone: string;
  auth_password: string;
  auth_have_account: string;
  auth_no_account: string;
  auth_btn_login: string;
  auth_btn_signup: string;
  onboarding_title: string;
  onboarding_step1: string;
  onboarding_step2: string;
  onboarding_step3: string;
  onboarding_btn_finish: string;

  // Settings
  settings_title: string;
  settings_tab_account: string;
  settings_tab_store: string;
  settings_tab_payments: string;
  settings_tab_domain: string;
  settings_language_label: string;
  settings_save_btn: string;
}

export const translations: Record<Language, Translations> = {
  uz: {
    // Navigation
    nav_dashboard: 'Boshqaruv paneli',
    nav_products: 'Mahsulotlar',
    nav_import_product: 'Mahsulot import qilish',
    nav_orders: 'Buyurtmalar',
    nav_store_builder: 'Doʻkon konstruktori',
    nav_customers: 'Mijozlar',
    nav_suppliers: 'Yetkazib beruvchilar',
    nav_automation: 'Avtomatizatsiya',
    nav_payments: 'Toʻlov tizimlari',
    nav_delivery: 'Yetkazib berish',
    nav_analytics: 'Tahlil va Statistika',
    nav_partner_links: 'Hamkorlik havolalari',
    nav_integrations: 'Integratsiyalar',
    nav_pricing: 'Tariflar va Rejalar',
    nav_settings: 'Sozlamalar',
    nav_admin: 'Platforma Admin',
    nav_logout: 'Tizimdan chiqish',
    nav_home: 'Bosh sahifa',
    nav_how_it_works: 'Qanday ishlaydi',
    nav_features: 'Imkoniyatlar',
    nav_login: 'Kirish',
    nav_signup: 'Roʻyxatdan oʻtish',
    nav_view_store: 'Doʻkonni koʻrish',

    // Common UI
    btn_back: 'Orqaga',
    btn_save: 'Saqlash',
    btn_cancel: 'Bekor qilish',
    btn_delete: 'Oʻchirish',
    btn_edit: 'Tahrirlash',
    btn_create: 'Yaratish',
    btn_search: 'Qidirish',
    btn_filter: 'Filtrlash',
    btn_loading: 'Yuklanmoqda...',
    btn_close: 'Yopish',
    btn_copy: 'Nusxa olish',
    btn_copied: 'Nusxa olindi!',
    btn_select: 'Tanlash',
    btn_view_details: 'Batafsil koʻrish',
    btn_add_to_cart: 'Savatga qoʻshish',
    btn_buy_now: '1 bosishda sotib olish',
    btn_checkout: 'Buyurtmani rasmiylashtirish',
    btn_confirm_order: 'Buyurtmani tasdiqlash',
    btn_start_selling: 'Savdoni boshlash',
    btn_explore_demo: 'Boshqaruv paneli',
    search_placeholder: 'Mahsulotlar, buyurtmalarni qidirish...',
    status_active: 'Faol',
    status_draft: 'Qoralama',
    status_published: 'Nashr qilingan',
    status_out_of_stock: 'Tugagan',
    status_pending: 'Kutilmoqda',
    status_paid: 'Toʻlangan',
    status_shipped: 'Yuborilgan',
    status_delivered: 'Yetkazib berilgan',
    status_cancelled: 'Bekor qilingan',
    device_mode: 'Qurilma',
    language: 'Til',

    // Top Bar & Notifications
    topbar_import_btn: 'Import qilish',
    topbar_notifications: 'Bildirishnomalar',
    topbar_profile: 'Shaxsiy profil',
    topbar_verified_seller: 'Tasdiqlangan sotuvchi',

    // Landing Page
    landing_badge: 'Oʻzbekistondagi 1-raqamli Dropshipping va E-Commerce Platformasi',
    landing_hero_title: 'Oʻz Doʻkoningizni Yaratib,',
    landing_hero_title_highlight: 'Istalgan Joyda Soting.',
    landing_hero_subtitle: 'Uzum, AliExpress va Amazon’dan mahsulotlarni import qiling, oʻz sof foydangizni belgilang, Click/Payme orqali toʻlov qabul qiling va avtomatlashtiring.',
    landing_stat_gmv: 'Umumiy savdo aylanmasi',
    landing_stat_merchants: 'Faol sotuvchilar',
    landing_stat_delivery: 'Oʻzbekiston boʻylab yetkazish',
    landing_stat_zero_risk: '0 xavf bilan boshlash',
    landing_how_title: 'Tizim qanday ishlaydi?',
    landing_how_subtitle: 'Boshlash uchun bor-yoʻgʻi 4 ta oddiy qadam kifoya',
    landing_feat_title: 'Sotuvchilar uchun barcha qulayliklar',
    landing_feat_subtitle: 'Dropshipping biznesingizni professional darajada yuritish uchun kuchli vositalar',
    landing_cta_title: 'Bugunoq oʻz onlayn doʻkoningizni ishga tushiring',
    landing_cta_subtitle: '14 kunlik bepul sinov muddati. Dasturlash bilimlari talab qilinmaydi.',
    landing_footer_desc: 'Oʻzbekistonda zamonaviy elektron tijorat va dropshipping ekotizimi.',
    landing_footer_rights: 'Barcha huquqlar himoyalangan.',

    // Product Import
    import_title: 'Mahsulotni import qilish va Foyda belgilash',
    import_subtitle: 'Uzum Market, AliExpress, Amazon yoki istalgan doʻkon havolasini kiriting. Tizim rasmlar, nom, ulgurji narx va sof foydani avtomatik hisoblab beradi.',
    import_url_label: 'Yetkazib beruvchi / Mahsulot havolasi (URL)',
    import_url_placeholder: 'https://uzum.uz/product/... yoki https://aliexpress.com/item/...',
    import_btn_action: 'Import Qilish',
    import_loading_text: 'Maʼlumotlar olinmoqda va tahlil qilinmoqda...',
    import_presets_title: 'Yoki quyidagi tayyor yetkazib beruvchi namunalaridan tanlang:',
    import_product_detected: 'Mahsulot Aniqlindi',
    import_edit_btn: 'Tahrirlash',
    import_close_edit: 'Tahrirni yopish',
    import_calc_title: 'Foyda Kalkulyatori',
    import_calc_subtitle: 'Har bir sotuvdan qancha sof foyda olmoqchisiz?',
    import_calc_fixed: 'Aniq Summa (UZS)',
    import_calc_fixed_desc: 'Masalan, har bir donadan 75,000 soʻm',
    import_calc_percent: 'Foizda (%) Ustama',
    import_calc_percent_desc: 'Masalan, yakuniy narxning 25% qismi foyda',
    import_profit_target_label: 'Siz xohlagan Sof Foyda miqdori (UZS)',
    import_margin_percent_label: 'Foyda foizi (Ustama):',
    import_supplier_cost: '1. Yetkazib beruvchi tannarxi:',
    import_shipping_cost: '2. Yetkazib berish (Pochta/Kuryer):',
    import_payment_fee: '3. Toʻlov tizimi komissiyasi (1.5%):',
    import_platform_fee: '4. Sellnex platforma komissiyasi:',
    import_your_net_profit: '5. Sizning Sof Foydangiz (Har bir sotuvdan):',
    import_customer_price: 'Mijoz Sotib Olish Narxi',
    import_customer_price_desc: 'Doʻkoningizda koʻrinadigan yakuniy narx',
    import_profit_per_order: '1 ta Buyurtmadan Sof Foyda',
    import_margin_rate: 'Rentabellik Foizi',
    import_btn_publish: 'Doʻkonga Qoʻshish va Nashr Qilish',
    import_btn_save_draft: 'Qoralama sifatida saqlash',

    // Products View
    products_title: 'Mahsulotlar katalogi',
    products_subtitle: 'Doʻkoningizdagi barcha tovarlar, narxlar va qoldiqlar nazorati',
    products_add_btn: 'Yangi mahsulot',
    products_import_btn: 'Havola orqali import',
    products_all: 'Barcha mahsulotlar',
    products_published: 'Nashr etilganlar',
    products_drafts: 'Qoralamalar',
    products_out_of_stock: 'Tugaganlar',
    products_th_product: 'Mahsulot',
    products_th_category: 'Kategoriya',
    products_th_supplier: 'Yetkazib beruvchi',
    products_th_cost: 'Tannarx',
    products_th_profit: 'Sof Foyda',
    products_th_selling_price: 'Sotuv narxi',
    products_th_stock: 'Qoldiq',
    products_th_status: 'Holati',
    products_th_actions: 'Amallar',

    // Orders View
    orders_title: 'Buyurtmalar boshqaruvi',
    orders_subtitle: 'Kelib tushgan buyurtmalar, toʻlov holati va yetkazib berish jarayoni',
    orders_tab_all: 'Barchasi',
    orders_tab_pending: 'Kutilmoqda',
    orders_tab_paid: 'Toʻlangan',
    orders_tab_shipped: 'Yuborilgan',
    orders_tab_delivered: 'Yetkazilgan',
    orders_th_order_num: 'Buyurtma №',
    orders_th_customer: 'Mijoz',
    orders_th_items: 'Mahsulotlar',
    orders_th_total: 'Umumiy summa',
    orders_th_profit: 'Sizning foydangiz',
    orders_th_payment: 'Toʻlov',
    orders_th_status: 'Holati',
    orders_th_date: 'Sana',
    orders_action_fulfill: 'Yetkazib berishga yuborish',

    // Storefront & Checkout
    store_all_products: 'Barcha mahsulotlar',
    store_categories: 'Kategoriyalar',
    store_cart: 'Savat',
    store_cart_empty: 'Savatingiz boʻsh',
    store_cart_total: 'Jami toʻlov summasi:',
    store_checkout_title: 'Buyurtmani rasmiylashtirish',
    store_name_label: 'Toʻliq ismingiz',
    store_phone_label: 'Telefon raqamingiz',
    store_region_label: 'Viloyat / Shahar',
    store_address_label: 'Aniq yetkazib berish manzili',
    store_payment_method: 'Toʻlov usulini tanlang',
    store_pay_click: 'Click orqali toʻlash',
    store_pay_payme: 'Payme orqali toʻlash',
    store_pay_cod: 'Qabul qilganda toʻlash (Naqd/Karta)',
    store_free_shipping: 'Butun Oʻzbekiston boʻylab bepul yetkazib berish',
    store_order_success_title: 'Buyurtmangiz qabul qilindi!',
    store_order_success_desc: 'Tez orada operatorimiz buyurtmani tasdiqlash uchun siz bilan bogʻlanadi.',
    store_order_num: 'Buyurtma raqami:',
    store_back_to_shop: 'Xaridni davom ettirish',

    // Auth & Onboarding
    auth_login_title: 'Hisobga kirish',
    auth_signup_title: 'Doʻkonni roʻyxatdan oʻtkazish',
    auth_login_subtitle: 'Sellnex doʻkoningiz boshqaruv paneliga kiring',
    auth_signup_subtitle: '14 kunlik bepul sinov muddatini boshlang',
    auth_name: 'Ism va Familiya',
    auth_email: 'Elektron pochta manzili',
    auth_phone: 'Telefon raqam',
    auth_password: 'Maxfiy parol',
    auth_have_account: 'Hisobingiz bormi? Tizimga kiring',
    auth_no_account: 'Hisobingiz yoʻqmi? Roʻyxatdan oʻting',
    auth_btn_login: 'Kirish',
    auth_btn_signup: 'Doʻkonni ochish',
    onboarding_title: 'Doʻkoningizni sozlash',
    onboarding_step1: 'Kategoriya',
    onboarding_step2: 'Sotuv bozori',
    onboarding_step3: 'Doʻkon nomi',
    onboarding_btn_finish: 'Doʻkonni ishga tushirish',

    // Settings
    settings_title: 'Sozlamalar va Profil',
    settings_tab_account: 'Shaxsiy profil',
    settings_tab_store: 'Doʻkon maʼlumotlari',
    settings_tab_payments: 'Toʻlov tizimlari',
    settings_tab_domain: 'Shaxsiy domen',
    settings_language_label: 'Tizim tili',
    settings_save_btn: 'Oʻzgarishlarni saqlash',
  },

  ru: {
    // Navigation
    nav_dashboard: 'Панель управления',
    nav_products: 'Товары',
    nav_import_product: 'Импорт товара',
    nav_orders: 'Заказы',
    nav_store_builder: 'Конструктор магазина',
    nav_customers: 'Клиенты',
    nav_suppliers: 'Поставщики',
    nav_automation: 'Автоматизация',
    nav_payments: 'Платежные системы',
    nav_delivery: 'Доставка',
    nav_analytics: 'Аналитика',
    nav_partner_links: 'Партнерские ссылки',
    nav_integrations: 'Интеграции',
    nav_pricing: 'Тарифы и планы',
    nav_settings: 'Настройки',
    nav_admin: 'Админ-панель',
    nav_logout: 'Выйти',
    nav_home: 'Главная',
    nav_how_it_works: 'Как это работает',
    nav_features: 'Возможности',
    nav_login: 'Войти',
    nav_signup: 'Регистрация',
    nav_view_store: 'Открыть витрину',

    // Common UI
    btn_back: 'Назад',
    btn_save: 'Сохранить',
    btn_cancel: 'Отмена',
    btn_delete: 'Удалить',
    btn_edit: 'Редактировать',
    btn_create: 'Создать',
    btn_search: 'Поиск',
    btn_filter: 'Фильтр',
    btn_loading: 'Загрузка...',
    btn_close: 'Закрыть',
    btn_copy: 'Копировать',
    btn_copied: 'Скопировано!',
    btn_select: 'Выбрать',
    btn_view_details: 'Подробнее',
    btn_add_to_cart: 'В корзину',
    btn_buy_now: 'Купить в 1 клик',
    btn_checkout: 'Оформить заказ',
    btn_confirm_order: 'Подтвердить заказ',
    btn_start_selling: 'Начать продажи',
    btn_explore_demo: 'Панель управления',
    search_placeholder: 'Поиск товаров, заказов...',
    status_active: 'Активный',
    status_draft: 'Черновик',
    status_published: 'Опубликован',
    status_out_of_stock: 'Нет в наличии',
    status_pending: 'В ожидании',
    status_paid: 'Оплачен',
    status_shipped: 'Отправлен',
    status_delivered: 'Доставлен',
    status_cancelled: 'Отменен',
    device_mode: 'Устройство',
    language: 'Язык',

    // Top Bar & Notifications
    topbar_import_btn: 'Импорт',
    topbar_notifications: 'Уведомления',
    topbar_profile: 'Профиль',
    topbar_verified_seller: 'Верифицированный продавец',

    // Landing Page
    landing_badge: '№1 Платформа дропшиппинга и электронной коммерции в Узбекистане',
    landing_hero_title: 'Создайте свой магазин.',
    landing_hero_title_highlight: 'Продавайте где угодно.',
    landing_hero_subtitle: 'Импортируйте товары с Uzum, AliExpress и Amazon, устанавливайте свою прибыль, принимайте платежи через Click/Payme и автоматизируйте заказы.',
    landing_stat_gmv: 'Общий объем продаж',
    landing_stat_merchants: 'Активных продавцов',
    landing_stat_delivery: 'Доставка по всему Узбекистану',
    landing_stat_zero_risk: 'Старт без рисков',
    landing_how_title: 'Как работает платформа?',
    landing_how_subtitle: 'Всего 4 простых шага для запуска вашего бизнеса',
    landing_feat_title: 'Все инструменты для роста продаж',
    landing_feat_subtitle: 'Мощный функционал для ведения дропшиппинг-бизнеса на профессиональном уровне',
    landing_cta_title: 'Запустите свой онлайн-магазин уже сегодня',
    landing_cta_subtitle: '14 дней бесплатного пробного периода. Навыки программирования не требуются.',
    landing_footer_desc: 'Современная экосистема электронной торговли и дропшиппинга в Центральной Азии.',
    landing_footer_rights: 'Все права защищены.',

    // Product Import
    import_title: 'Импорт товара и Расчет прибыли',
    import_subtitle: 'Вставьте ссылку на товар с Uzum Market, AliExpress, Amazon или любого сайта. Система автоматически определит фото, название, оптовую цену и рассчитает прибыль.',
    import_url_label: 'Ссылка на товар от поставщика (URL)',
    import_url_placeholder: 'https://uzum.uz/product/... или https://aliexpress.com/item/...',
    import_btn_action: 'Импортировать',
    import_loading_text: 'Получение и анализ данных товара...',
    import_presets_title: 'Или выберите один из готовых шаблонов поставщиков:',
    import_product_detected: 'Товар успешно распознан',
    import_edit_btn: 'Редактировать',
    import_close_edit: 'Закрыть редактор',
    import_calc_title: 'Калькулятор прибыли',
    import_calc_subtitle: 'Сколько чистой прибыли вы хотите получать с каждой продажи?',
    import_calc_fixed: 'Фиксированная сумма (UZS)',
    import_calc_fixed_desc: 'Например, 75 000 сум с каждой единицы',
    import_calc_percent: 'Наценка в процентах (%)',
    import_calc_percent_desc: 'Например, 25% от итоговой цены продажи',
    import_profit_target_label: 'Желаемая чистая прибыль (UZS)',
    import_margin_percent_label: 'Процент наценки (маржа):',
    import_supplier_cost: '1. Себестоимость поставщика:',
    import_shipping_cost: '2. Стоимость доставки (курьер):',
    import_payment_fee: '3. Комиссия платежной системы (1.5%):',
    import_platform_fee: '4. Комиссия платформы Sellnex:',
    import_your_net_profit: '5. Ваша чистая прибыль с продажи:',
    import_customer_price: 'Итоговая цена для покупателя',
    import_customer_price_desc: 'Окончательная цена в вашем магазине',
    import_profit_per_order: 'Чистая прибыль с 1 заказа',
    import_margin_rate: 'Рентабельность',
    import_btn_publish: 'Добавить в магазин и Опубликовать',
    import_btn_save_draft: 'Сохранить как черновик',

    // Products View
    products_title: 'Каталог товаров',
    products_subtitle: 'Управление ассортиментом, ценами, остатками и наценкой',
    products_add_btn: 'Новый товар',
    products_import_btn: 'Импорт по ссылке',
    products_all: 'Все товары',
    products_published: 'Опубликованные',
    products_drafts: 'Черновики',
    products_out_of_stock: 'Закончились',
    products_th_product: 'Товар',
    products_th_category: 'Категория',
    products_th_supplier: 'Поставщик',
    products_th_cost: 'Себестоимость',
    products_th_profit: 'Прибыль',
    products_th_selling_price: 'Цена продажи',
    products_th_stock: 'Остаток',
    products_th_status: 'Статус',
    products_th_actions: 'Действия',

    // Orders View
    orders_title: 'Управление заказами',
    orders_subtitle: 'Входящие заказы, статусы оплаты и процесс доставки',
    orders_tab_all: 'Все',
    orders_tab_pending: 'Ожидают',
    orders_tab_paid: 'Оплачены',
    orders_tab_shipped: 'Отправлены',
    orders_tab_delivered: 'Доставлены',
    orders_th_order_num: 'Заказ №',
    orders_th_customer: 'Покупатель',
    orders_th_items: 'Товары',
    orders_th_total: 'Сумма',
    orders_th_profit: 'Ваша прибыль',
    orders_th_payment: 'Оплата',
    orders_th_status: 'Статус',
    orders_th_date: 'Дата',
    orders_action_fulfill: 'Отправить на доставку',

    // Storefront & Checkout
    store_all_products: 'Все товары',
    store_categories: 'Категории',
    store_cart: 'Корзина',
    store_cart_empty: 'Ваша корзина пуста',
    store_cart_total: 'Итого к оплате:',
    store_checkout_title: 'Оформление заказа',
    store_name_label: 'Ваше полное имя',
    store_phone_label: 'Номер телефона',
    store_region_label: 'Регион / Город',
    store_address_label: 'Адрес доставки',
    store_payment_method: 'Способ оплаты',
    store_pay_click: 'Оплата через Click',
    store_pay_payme: 'Оплата через Payme',
    store_pay_cod: 'Оплата при получении (Наличные/Карта)',
    store_free_shipping: 'Бесплатная доставка по всему Узбекистану',
    store_order_success_title: 'Ваш заказ успешно принят!',
    store_order_success_desc: 'В ближайшее время оператор свяжется с вами для подтверждения доставки.',
    store_order_num: 'Номер заказа:',
    store_back_to_shop: 'Продолжить покупки',

    // Auth & Onboarding
    auth_login_title: 'Вход в аккаунт',
    auth_signup_title: 'Регистрация магазина',
    auth_login_subtitle: 'Войдите в панель управления Sellnex',
    auth_signup_subtitle: 'Начните 14 дней бесплатного пробного периода',
    auth_name: 'Имя и Фамилия',
    auth_email: 'Электронная почта',
    auth_phone: 'Номер телефона',
    auth_password: 'Пароль',
    auth_have_account: 'Уже есть аккаунт? Войти',
    auth_no_account: 'Нет аккаунта? Зарегистрироваться',
    auth_btn_login: 'Войти',
    auth_btn_signup: 'Открыть магазин',
    onboarding_title: 'Настройка вашего магазина',
    onboarding_step1: 'Категория',
    onboarding_step2: 'Рынок продаж',
    onboarding_step3: 'Название магазина',
    onboarding_btn_finish: 'Запустить магазин',

    // Settings
    settings_title: 'Настройки и Профиль',
    settings_tab_account: 'Профиль продавца',
    settings_tab_store: 'Данные магазина',
    settings_tab_payments: 'Платежные шлюзы',
    settings_tab_domain: 'Собственный домен',
    settings_language_label: 'Язык интерфейса',
    settings_save_btn: 'Сохранить изменения',
  },

  en: {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_products: 'Products',
    nav_import_product: 'Import Product',
    nav_orders: 'Orders',
    nav_store_builder: 'Store Builder',
    nav_customers: 'Customers',
    nav_suppliers: 'Suppliers',
    nav_automation: 'Automation',
    nav_payments: 'Payments',
    nav_delivery: 'Delivery',
    nav_analytics: 'Analytics',
    nav_partner_links: 'Partner Links',
    nav_integrations: 'Integrations',
    nav_pricing: 'Plans & Pricing',
    nav_settings: 'Settings',
    nav_admin: 'Platform Admin',
    nav_logout: 'Log Out',
    nav_home: 'Home',
    nav_how_it_works: 'How it Works',
    nav_features: 'Features',
    nav_login: 'Log In',
    nav_signup: 'Sign Up',
    nav_view_store: 'View Public Store',

    // Common UI
    btn_back: 'Back',
    btn_save: 'Save',
    btn_cancel: 'Cancel',
    btn_delete: 'Delete',
    btn_edit: 'Edit',
    btn_create: 'Create',
    btn_search: 'Search',
    btn_filter: 'Filter',
    btn_loading: 'Loading...',
    btn_close: 'Close',
    btn_copy: 'Copy',
    btn_copied: 'Copied!',
    btn_select: 'Select',
    btn_view_details: 'View Details',
    btn_add_to_cart: 'Add to Cart',
    btn_buy_now: 'Buy Now',
    btn_checkout: 'Proceed to Checkout',
    btn_confirm_order: 'Confirm Order',
    btn_start_selling: 'Start Selling',
    btn_explore_demo: 'Dashboard',
    search_placeholder: 'Search products, orders...',
    status_active: 'Active',
    status_draft: 'Draft',
    status_published: 'Published',
    status_out_of_stock: 'Out of Stock',
    status_pending: 'Pending',
    status_paid: 'Paid',
    status_shipped: 'Shipped',
    status_delivered: 'Delivered',
    status_cancelled: 'Cancelled',
    device_mode: 'Device',
    language: 'Language',

    // Top Bar & Notifications
    topbar_import_btn: 'Import Product',
    topbar_notifications: 'Notifications',
    topbar_profile: 'Profile',
    topbar_verified_seller: 'Verified Seller',

    // Landing Page
    landing_badge: "Central Asia's First All-in-One E-Commerce & Dropshipping Platform",
    landing_hero_title: 'Build Your Store.',
    landing_hero_title_highlight: 'Sell Anywhere.',
    landing_hero_subtitle: 'Import products from Uzum, AliExpress and Amazon, set your profit margin, accept Click/Payme payments and automate fulfillment.',
    landing_stat_gmv: 'Total Gross Volume',
    landing_stat_merchants: 'Active Merchants',
    landing_stat_delivery: 'Uzbekistan-wide Delivery',
    landing_stat_zero_risk: 'Zero-Risk Start',
    landing_how_title: 'How It Works',
    landing_how_subtitle: 'Launch your profitable e-commerce business in 4 simple steps',
    landing_feat_title: 'Everything You Need to Scale',
    landing_feat_subtitle: 'Enterprise-grade dropshipping and e-commerce tools built for high conversion',
    landing_cta_title: 'Start Building Your Online Empire Today',
    landing_cta_subtitle: '14-day free trial. No coding or prior experience required.',
    landing_footer_desc: 'Next-generation dropshipping & e-commerce ecosystem in Uzbekistan.',
    landing_footer_rights: 'All rights reserved.',

    // Product Import
    import_title: 'Import Product & Set Your Profit',
    import_subtitle: 'Paste any link from Uzum Market, AliExpress, Amazon or custom shop. The engine extracts images, titles, costs, and calculates net profit automatically.',
    import_url_label: 'Supplier Product URL',
    import_url_placeholder: 'https://uzum.uz/product/... or https://aliexpress.com/item/...',
    import_btn_action: 'Import Product',
    import_loading_text: 'Fetching product details & pricing...',
    import_presets_title: 'Or test with one of these supplier presets:',
    import_product_detected: 'Product Detected',
    import_edit_btn: 'Edit Details',
    import_close_edit: 'Close Editor',
    import_calc_title: 'Profit Calculator',
    import_calc_subtitle: 'How much net profit do you want to make on each sale?',
    import_calc_fixed: 'Fixed Amount (UZS)',
    import_calc_fixed_desc: 'e.g. 75,000 UZS profit per item',
    import_calc_percent: 'Percentage Margin (%)',
    import_calc_percent_desc: 'e.g. 25% profit margin on final price',
    import_profit_target_label: 'Your Desired Net Profit (UZS)',
    import_margin_percent_label: 'Profit Margin (%):',
    import_supplier_cost: '1. Supplier Cost:',
    import_shipping_cost: '2. Shipping / Logistics:',
    import_payment_fee: '3. Payment Processing Fee (1.5%):',
    import_platform_fee: '4. Sellnex Platform Fee:',
    import_your_net_profit: '5. Your Net Profit (Per Sale):',
    import_customer_price: 'Customer Retail Price',
    import_customer_price_desc: 'Final price displayed in your store',
    import_profit_per_order: 'Net Profit per Order',
    import_margin_rate: 'Profit Margin Rate',
    import_btn_publish: 'Add to Store & Publish',
    import_btn_save_draft: 'Save as Draft',

    // Products View
    products_title: 'Products Catalog',
    products_subtitle: 'Manage store inventory, retail pricing, stock, and status',
    products_add_btn: 'Add Product',
    products_import_btn: 'Import from URL',
    products_all: 'All Products',
    products_published: 'Published',
    products_drafts: 'Drafts',
    products_out_of_stock: 'Out of Stock',
    products_th_product: 'Product',
    products_th_category: 'Category',
    products_th_supplier: 'Supplier',
    products_th_cost: 'Cost',
    products_th_profit: 'Profit',
    products_th_selling_price: 'Selling Price',
    products_th_stock: 'Stock',
    products_th_status: 'Status',
    products_th_actions: 'Actions',

    // Orders View
    orders_title: 'Orders Management',
    orders_subtitle: 'Incoming orders, payment status, and fulfillment tracking',
    orders_tab_all: 'All',
    orders_tab_pending: 'Pending',
    orders_tab_paid: 'Paid',
    orders_tab_shipped: 'Shipped',
    orders_tab_delivered: 'Delivered',
    orders_th_order_num: 'Order #',
    orders_th_customer: 'Customer',
    orders_th_items: 'Items',
    orders_th_total: 'Total',
    orders_th_profit: 'Your Profit',
    orders_th_payment: 'Payment',
    orders_th_status: 'Status',
    orders_th_date: 'Date',
    orders_action_fulfill: 'Fulfill & Ship',

    // Storefront & Checkout
    store_all_products: 'All Products',
    store_categories: 'Categories',
    store_cart: 'Cart',
    store_cart_empty: 'Your cart is empty',
    store_cart_total: 'Order Total:',
    store_checkout_title: 'Checkout',
    store_name_label: 'Full Name',
    store_phone_label: 'Phone Number',
    store_region_label: 'Region / City',
    store_address_label: 'Delivery Address',
    store_payment_method: 'Select Payment Method',
    store_pay_click: 'Pay with Click',
    store_pay_payme: 'Pay with Payme',
    store_pay_cod: 'Cash on Delivery (COD)',
    store_free_shipping: 'Free fast delivery across Uzbekistan',
    store_order_success_title: 'Order Confirmed!',
    store_order_success_desc: 'Our manager will contact you shortly to confirm your shipment.',
    store_order_num: 'Order Number:',
    store_back_to_shop: 'Continue Shopping',

    // Auth & Onboarding
    auth_login_title: 'Log in to your account',
    auth_signup_title: 'Create your merchant account',
    auth_login_subtitle: 'Sign in to access your Sellnex merchant dashboard',
    auth_signup_subtitle: 'Start your 14-day free trial',
    auth_name: 'Full Name',
    auth_email: 'Email Address',
    auth_phone: 'Phone Number',
    auth_password: 'Password',
    auth_have_account: 'Already have an account? Log in',
    auth_no_account: "Don't have an account? Sign up",
    auth_btn_login: 'Log In',
    auth_btn_signup: 'Create Store',
    onboarding_title: 'Store Setup Wizard',
    onboarding_step1: 'Category',
    onboarding_step2: 'Target Market',
    onboarding_step3: 'Store Name',
    onboarding_btn_finish: 'Launch Store',

    // Settings
    settings_title: 'Settings & Profile',
    settings_tab_account: 'Account Profile',
    settings_tab_store: 'Store Information',
    settings_tab_payments: 'Payment Gateways',
    settings_tab_domain: 'Custom Domain',
    settings_language_label: 'Interface Language',
    settings_save_btn: 'Save Changes',
  },
};

export const languagesList = [
  { code: 'uz' as Language, name: 'Oʻzbekcha', short: 'UZ', flag: '🇺🇿' },
  { code: 'ru' as Language, name: 'Русский', short: 'RU', flag: '🇷🇺' },
  { code: 'en' as Language, name: 'English', short: 'EN', flag: '🇬🇧' },
];
