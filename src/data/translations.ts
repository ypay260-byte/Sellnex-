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
  nav_signup_short: string;
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

  // Device selector
  landing_device_selector_title: string;
  landing_device_ready_badge: string;
  landing_device_mobile_title: string;
  landing_device_mobile_desc: string;
  landing_device_desktop_title: string;
  landing_device_desktop_desc: string;

  // Value Pills
  landing_pill_no_inventory: string;
  landing_pill_payments_ready: string;
  landing_pill_delivery: string;
  landing_pill_profit_calc: string;

  // Workflow (6 steps)
  landing_workflow_badge: string;
  landing_workflow_title: string;
  landing_workflow_subtitle: string;
  landing_step_of: string;
  landing_step_1_title: string;
  landing_step_1_desc: string;
  landing_step_1_badge: string;
  landing_step_2_title: string;
  landing_step_2_desc: string;
  landing_step_2_badge: string;
  landing_step_3_title: string;
  landing_step_3_desc: string;
  landing_step_3_badge: string;
  landing_step_4_title: string;
  landing_step_4_desc: string;
  landing_step_4_badge: string;
  landing_step_5_title: string;
  landing_step_5_desc: string;
  landing_step_5_badge: string;
  landing_step_6_title: string;
  landing_step_6_desc: string;
  landing_step_6_badge: string;

  // Teaser
  landing_teaser_title: string;
  landing_teaser_desc: string;
  landing_teaser_btn: string;

  // Features
  landing_feat_badge: string;
  landing_feat_1_title: string;
  landing_feat_1_desc: string;
  landing_feat_2_title: string;
  landing_feat_2_desc: string;
  landing_feat_3_title: string;
  landing_feat_3_desc: string;
  landing_feat_4_title: string;
  landing_feat_4_desc: string;
  landing_feat_5_title: string;
  landing_feat_5_desc: string;
  landing_feat_6_title: string;
  landing_feat_6_desc: string;
  landing_feat_7_title: string;
  landing_feat_7_desc: string;
  landing_feat_8_title: string;
  landing_feat_8_desc: string;

  // Ecosystem & Integrations
  landing_eco_badge: string;
  landing_eco_title: string;
  landing_eco_subtitle: string;
  landing_eco_btn: string;

  // Pricing
  landing_pricing_badge: string;
  landing_pricing_title: string;
  landing_pricing_subtitle: string;
  landing_per_month: string;
  landing_plan_free_desc: string;
  landing_plan_free_btn: string;
  landing_plan_pro_badge: string;
  landing_plan_pro_desc: string;
  landing_plan_pro_btn: string;
  landing_plan_biz_desc: string;
  landing_plan_biz_btn: string;

  // Mockup & Footer
  landing_mockup_auto_active: string;
  landing_mockup_revenue: string;
  landing_mockup_revenue_change: string;
  landing_mockup_profit: string;
  landing_mockup_margin: string;
  landing_mockup_orders: string;
  landing_mockup_orders_sub: string;
  landing_mockup_products: string;
  landing_mockup_latest_order: string;
  landing_mockup_launch: string;
  landing_footer_tagline: string;

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

  // Auth Extended
  auth_login_headline: string;
  auth_signup_headline: string;
  auth_forgot_headline: string;
  auth_reset_sent_headline: string;
  auth_login_desc: string;
  auth_signup_desc: string;
  auth_forgot_desc: string;
  auth_reset_sent_desc: string;
  auth_tab_login: string;
  auth_tab_signup: string;
  auth_tab_telegram: string;
  auth_email_or_phone: string;
  auth_email_address: string;
  auth_phone_number: string;
  auth_full_name: string;
  auth_forgot_password_link: string;
  auth_password_label: string;
  auth_password_requirements: string;
  auth_req_strong: string;
  auth_req_incomplete: string;
  auth_req_upper: string;
  auth_req_lower: string;
  auth_req_number: string;
  auth_req_dot: string;
  auth_req_min_length: string;
  auth_confirm_password: string;
  auth_pw_match: string;
  auth_pw_mismatch: string;
  auth_btn_signin_dashboard: string;
  auth_btn_register: string;
  auth_btn_send_reset: string;
  auth_btn_back_to_login: string;
  auth_recovery_dispatched: string;
  auth_btn_return_login: string;
  auth_business_type_title: string;
  auth_type_store: string;
  auth_type_store_desc: string;
  auth_type_cafe: string;
  auth_type_cafe_desc: string;
  auth_tg_isolation_title: string;
  auth_tg_isolation_desc: string;
  auth_tg_test_accounts: string;
  auth_tg_account_1: string;
  auth_tg_account_2: string;
  auth_tg_or_custom_id: string;
  auth_tg_user_id_label: string;
  auth_tg_name_label: string;
  auth_tg_btn_enter: string;
  auth_footer_cloud: string;

  // Dashboard
  dash_title: string;
  dash_welcome: string;
  dash_open_store: string;
  dash_add_product: string;
  dash_live_link_title: string;
  dash_live_badge: string;
  dash_copy_link: string;
  dash_share_social: string;
  dash_welcome_banner_title: string;
  dash_welcome_banner_desc: string;
  dash_add_first_product: string;
  dash_customize_store: string;
  dash_stat_revenue: string;
  dash_stat_orders: string;
  dash_stat_profit: string;
  dash_stat_catalog_usage: string;
  dash_stat_margin_avg: string;
  dash_pending_processing: string;
  dash_this_week_change: string;
  dash_recent_orders_title: string;
  dash_view_all_orders: string;
  dash_th_order_id: string;
  dash_th_customer: string;
  dash_th_status: string;
  dash_th_amount: string;
  dash_th_profit: string;
  dash_no_orders_title: string;
  dash_no_orders_desc: string;
  dash_quick_status_title: string;
  dash_store_active_badge: string;
  dash_business_modes: string;
  dash_mode_personal: string;
  dash_mode_dropship: string;
  dash_open_customizer: string;
  dash_chart_title: string;
  dash_chart_subtitle: string;
  dash_chart_tab_revenue: string;
  dash_chart_tab_profit: string;
  dash_chart_tab_both: string;
  dash_chart_30d_badge: string;
  dash_chart_30d_total: string;
  dash_chart_daily_avg: string;
  dash_chart_peak_day: string;
  dash_chart_footnote: string;
  dash_top_products: string;
  dash_all_products: string;

  // Topbar / Sidebar / Common
  topbar_your_stores: string;
  topbar_create_another_store: string;
  topbar_store_settings: string;
  topbar_store_builder: string;
  topbar_admin_portal: string;
  topbar_sign_out: string;
  trial_expired_title: string;
  trial_expired_desc: string;
  trial_btn_upgrade: string;
  trial_active_title: string;
  trial_products_count: string;
  sidebar_preview: string;
  sidebar_copy_link: string;
  sidebar_switch_to_store: string;
  sidebar_switch_to_cafe: string;
  sidebar_change_mode: string;
  sidebar_admin_panel: string;
  mobile_tab_home: string;
  mobile_tab_products: string;
  mobile_tab_orders: string;
  mobile_tab_store: string;
  mobile_tab_more: string;
  mobile_drawer_title: string;
  mobile_drawer_subtitle: string;
  mobile_view_store: string;

  // Additional Common / Topbar / Sidebar / Search / Device / Pricing
  topbar_back: string;
  topbar_search_placeholder: string;
  topbar_device_title: string;
  topbar_device_label: string;
  topbar_seller_account: string;
  topbar_store_singular: string;
  topbar_store_plural: string;
  sidebar_limit_used: string;
  sidebar_upgrade: string;
  sidebar_integrations_title: string;
  sidebar_live_badge: string;
  sidebar_admin_badge: string;
  search_input_placeholder: string;
  search_stores_heading: string;
  search_products_heading: string;
  search_orders_heading: string;
  search_customers_heading: string;
  search_no_results: string;
  search_cost_label: string;
  search_price_label: string;
  search_profit_label: string;
  device_modal_badge: string;
  device_modal_title: string;
  device_modal_subtitle: string;
  device_phone_title: string;
  device_phone_desc: string;
  device_computer_title: string;
  device_computer_desc: string;
  device_selected_badge: string;
  device_continue_btn: string;
  device_modal_footer: string;
  pricing_page_title: string;
  pricing_page_subtitle: string;
  pricing_current_plan: string;
  pricing_active_sub: string;
  pricing_free_trial: string;
  pricing_catalog_limit: string;
  pricing_products_unit: string;
  pricing_existing_products: string;
  pricing_status_label: string;
  pricing_login_register: string;
  pricing_starter_quick_btn: string;
  pricing_select_plan_btn: string;
  pricing_current_active_badge: string;
  pricing_trial_period_badge: string;
  pricing_auth_required_title: string;
  pricing_auth_required_desc: string;
  pricing_checkout_success_title: string;
  pricing_checkout_close_btn: string;
  pricing_checkout_badge: string;
  pricing_checkout_activate_title: string;
  pricing_user_label: string;
  pricing_tab_paynet: string;
  pricing_tab_paynet_speed: string;
  pricing_tab_card: string;
  pricing_paynet_connecting: string;
  pricing_paynet_official_gateway: string;
  pricing_paynet_scan_qr: string;
  pricing_paynet_cashier_code_label: string;
  pricing_paynet_tx_id: string;
  pricing_paynet_total_amount: string;
  pricing_paynet_status_pending: string;
  pricing_paynet_status_paid: string;
  pricing_paynet_status_cancelled: string;
  pricing_paynet_status_failed: string;
  pricing_paynet_btn_verify: string;
  pricing_qa_simulator_title: string;
  pricing_qa_btn_success: string;
  pricing_qa_btn_cancel: string;
  pricing_qa_btn_reject: string;
  pricing_paynet_load_failed: string;
  pricing_card_recipient_label: string;
  pricing_card_official_tag: string;
  pricing_receipt_upload_label: string;
  pricing_receipt_attached_title: string;
  pricing_receipt_ready_admin: string;
  pricing_receipt_drop_hint: string;
  pricing_receipt_formats_hint: string;
  pricing_sender_phone_label: string;
  pricing_tx_note_label: string;
  pricing_btn_submit_receipt: string;
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
    nav_signup_short: "Ro'yxat",
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

    // Device selector
    landing_device_selector_title: 'Qurilma boʻyicha kirish:',
    landing_device_ready_badge: 'Telegram & Web tayyor',
    landing_device_mobile_title: '📱 Telefon / Mini App',
    landing_device_mobile_desc: 'Mobil va Telegram Mini App',
    landing_device_desktop_title: '💻 Kompyuter / Desktop',
    landing_device_desktop_desc: 'Keng ekranli Boshqaruv paneli',

    // Value Pills
    landing_pill_no_inventory: 'Omborxona talab qilinmaydi',
    landing_pill_payments_ready: 'Click va Payme ulangan',
    landing_pill_delivery: 'Oʻzbekiston boʻylab 24-48 soatda yetkazish',
    landing_pill_profit_calc: 'Avtomatik sof foyda kalkulyatori',

    // Workflow (6 steps)
    landing_workflow_badge: 'Bosqichma-bosqich jarayon',
    landing_workflow_title: 'Sellnex qanday ishlaydi?',
    landing_workflow_subtitle: 'Oʻzbekistonda dropshipping biznesingizni 6 ta oddiy, avtomatlashtirilgan qadamda boshlang.',
    landing_step_of: '06 dan {step}-qadam',
    landing_step_1_title: 'Mahsulotni import qilish',
    landing_step_1_desc: 'Amazon, Alibaba, Uzum Market yoki mahalliy yetkazib beruvchilardan istalgan mahsulot havolasini kiriting. Rasmlar, tavsif va variantlar bir zumda yuklanadi.',
    landing_step_1_badge: 'Avto-import',
    landing_step_2_title: 'Foydangizni belgilang',
    landing_step_2_desc: 'Aqlli foyda kalkulyatoridan foydalaning. Belgilangan daromad (masalan, 75 000 soʻm) yoki foizli marjani kiriting. Sotuv narxi avtomatik hisoblanadi.',
    landing_step_2_badge: 'Aqlli hisob-kitob',
    landing_step_3_title: 'Doʻkoningizni ishga tushiring',
    landing_step_3_desc: 'Qulay konstruktor yordamida oʻz brendingiz vitrinasini 2 daqiqada yarating. Shaxsiy domeningizni ulang yoki bepul .sellnex.uz manzilidan foydalaning.',
    landing_step_3_badge: 'Bir zumda tayyor',
    landing_step_4_title: 'Havolangizni ulashing',
    landing_step_4_desc: 'Doʻkoningiz havolasini Instagram, Telegram, TikTok va WhatsApp orqali targʻib qiling. Hamkorlik va reklama monitoringi tizimi oʻrnatilgan.',
    landing_step_4_badge: 'Barcha tarmoqlarda',
    landing_step_5_title: 'Buyurtma va toʻlovlarni qabul qiling',
    landing_step_5_desc: 'Click, Payme, Uzum Bank va yetkazib berilganda naqd toʻlov (COD) orqali oson toʻlov qabul qiling. Pul toʻgʻridan-toʻgʻri hisobingizga tushadi.',
    landing_step_5_badge: 'Milliy toʻlovlar',
    landing_step_6_title: 'Yetkazishni avtomatlashtiring',
    landing_step_6_desc: 'Bizning avtomatizatsiya tizimimiz buyurtmalarni avtomatik tarzda yetkazib beruvchilarga yoʻnaltiradi, kuryerni kuzatadi va xaridoringizga xabar beradi.',
    landing_step_6_badge: 'Avtomatlashtirilgan',

    // Teaser
    landing_teaser_title: 'Mahsulot importini hoziroq sinab koʻrmoqchimisiz?',
    landing_teaser_desc: 'Bir zumda sof foyda va marjani hisoblash uchun Amazon, Alibaba yoki Uzum havolasini kalkulyatorimizga kiriting.',
    landing_teaser_btn: 'Mahsulot importi va foyda kalkulyatorini ochish',

    // Features
    landing_feat_badge: 'Platforma imkoniyatlari',
    landing_feat_1_title: 'Doʻkon Konstruktori',
    landing_feat_1_desc: 'Oʻzbekiston bozoriga moslashtirilgan, mobil konversiyasi yuqori boʻlgan Shopify uslubidagi internet-doʻkon.',
    landing_feat_2_title: '1 bosishda mahsulot importi',
    landing_feat_2_desc: 'Istalgan yirik marketpleysdan ulgurji narxlar, zaxira, yuqori sifatli rasmlar va variantlarni bir zumda yuklab oling.',
    landing_feat_3_title: 'Dinamik foyda kalkulyatori',
    landing_feat_3_desc: 'Yetkazib beruvchi narxi + logistika + toʻlov komissiyasi + sof daromadingizni real vaqtda hisoblang.',
    landing_feat_4_title: 'Click va Payme toʻlov shlyuzlari',
    landing_feat_4_desc: 'Click, Payme, Uzum Bank va muddatli toʻlovlarni qoʻllab-quvvatlovchi integratsiyalashgan toʻlov moduli.',
    landing_feat_5_title: 'Uzum Market Ekotizimi',
    landing_feat_5_desc: 'Mahsulot zaxirasini sinxronlash, buyurtmalarni eksport qilish va kanallarni qulay boshqarish.',
    landing_feat_6_title: 'Buyurtmalarni avtomatlashtirish',
    landing_feat_6_desc: 'Buyurtmalarni yetkazib beruvchilarga avtomatik joʻnatish, zaxiralarni yangilash va Telegram bot bildirishnomalari.',
    landing_feat_7_title: 'Real-vaqt Tahlili',
    landing_feat_7_desc: 'Umumiy aylanma (GMV), sof foyda, trafik manbalari (Telegram, TikTok, IG) va ommabop mahsulotlarni kuzating.',
    landing_feat_8_title: 'Viloyatlar boʻylab yetkazib berish',
    landing_feat_8_desc: 'UzPost, BTS Cargo, Fargo Express va Yandex Delivery orqali 12 ta viloyat boʻyicha avtomatlashtirilgan joʻnatish.',

    // Ecosystem & Integrations
    landing_eco_badge: 'Bogʻlangan ekotizim',
    landing_eco_title: 'Marketpleyslar, Yetkazib beruvchilar va Toʻlov tizimlari',
    landing_eco_subtitle: 'Sevimli platformalaringizni tayyor avtomatlashtirilgan integratsiyalar bilan ulang.',
    landing_eco_btn: 'Boshqaruv panelida integratsiyalarni koʻrish',

    // Pricing
    landing_pricing_badge: 'Shaffof tariflar',
    landing_pricing_title: 'Har bir sotuvchi uchun mos rejalar',
    landing_pricing_subtitle: 'Bepul sinovdan boshlang va biznesingiz bilan birga daromadingizni oshiring.',
    landing_per_month: '/ oyiga',
    landing_plan_free_desc: 'Dropshippingni boshlab sinab koʻrish uchun qulay',
    landing_plan_free_btn: 'Bepul boshlash',
    landing_plan_pro_badge: 'Eng ommabop',
    landing_plan_pro_desc: 'Faol onlayn sotuvchilar va dropshipperlar uchun',
    landing_plan_pro_btn: 'PRO tarifiga ulanish',
    landing_plan_biz_desc: 'Katta aylanmaga ega agentliklar va tarmoq doʻkonlar uchun',
    landing_plan_biz_btn: 'Business tarifiga oʻtish',

    // Mockup & Footer
    landing_mockup_auto_active: '● Buyurtmalarni avtomatlashtirish: FAOL',
    landing_mockup_revenue: 'Umumiy tushum',
    landing_mockup_revenue_change: '↑ +24.8% bu hafta',
    landing_mockup_profit: 'Sof foyda',
    landing_mockup_margin: 'Oʻrtacha marja: 26.0%',
    landing_mockup_orders: 'Qabul qilingan buyurtmalar',
    landing_mockup_orders_sub: '100% avtomatik dropshipping',
    landing_mockup_products: 'Faol mahsulotlar',
    landing_mockup_latest_order: 'Oxirgi buyurtma',
    landing_mockup_launch: 'Boshqaruv panelini ochish →',
    landing_footer_tagline: 'Soting. Avtomatlashtiring. Oʻsing.',

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

    // Auth Extended
    auth_login_headline: 'Sellnex tizimiga kirish',
    auth_signup_headline: 'Sotuvchi hisobini yaratish',
    auth_forgot_headline: 'Parolni tiklash',
    auth_reset_sent_headline: 'Pochtani tekshiring',
    auth_login_desc: 'Boshqaruv paneliga kirish uchun email va parolingizni kiriting.',
    auth_signup_desc: 'Oʻzbekiston boʻylab savdoni boshlash uchun roʻyxatdan oʻting.',
    auth_forgot_desc: 'Parolni tiklash havolasini olish uchun emailingizni kiriting.',
    auth_reset_sent_desc: 'Parolni tiklash boʻyicha koʻrsatmalar yuborildi.',
    auth_tab_login: 'Kirish',
    auth_tab_signup: 'Roʻyxatdan oʻtish',
    auth_tab_telegram: 'Telegram Kafe',
    auth_email_or_phone: 'Email yoki Telefon raqam',
    auth_email_address: 'Elektron pochta manzili',
    auth_phone_number: 'Telefon raqam',
    auth_full_name: 'Ism va Familiya',
    auth_forgot_password_link: 'Parolni unutdingizmi?',
    auth_password_label: 'Parol',
    auth_password_requirements: 'Parol talablari',
    auth_req_strong: 'Kuchli parol',
    auth_req_incomplete: 'Toʻliq emas',
    auth_req_upper: '1 ta katta harf (A-Z)',
    auth_req_lower: '1 ta kichik harf (a-z)',
    auth_req_number: '1 ta raqam (0-9)',
    auth_req_dot: '1 ta nuqta (.)',
    auth_req_min_length: 'Kamida 8 ta belgi (masalan: Sellnex1.)',
    auth_confirm_password: 'Parolni tasdiqlang',
    auth_pw_match: 'Parollar mos keldi',
    auth_pw_mismatch: 'Parollar mos kelmadi',
    auth_btn_signin_dashboard: 'Boshqaruv paneliga kirish',
    auth_btn_register: 'Roʻyxatdan oʻtish',
    auth_btn_send_reset: 'Tiklash havolasini yuborish',
    auth_btn_back_to_login: '← Kirish sahifasiga qaytish',
    auth_recovery_dispatched: 'Tiklash havolasi yuborildi',
    auth_btn_return_login: 'Kirishga qaytish',
    auth_business_type_title: 'Sellnex’dan qanday foydalanmoqchisiz?',
    auth_type_store: 'Online doʻkon',
    auth_type_store_desc: 'Mahsulot sotish, savat va doʻkon',
    auth_type_cafe: 'Restoran / Kafe',
    auth_type_cafe_desc: 'Menyu, taomlar va buyurtmalar',
    auth_tg_isolation_title: 'Multi-Tenant Kafe Izolyatsiyasi',
    auth_tg_isolation_desc: 'Har bir Telegram hisobi mustaqil ownerId va cafeId ga ega. Boshqa kafening menyusi yoki buyurtmalari hech qachon aralashmaydi.',
    auth_tg_test_accounts: 'Sinov uchun 2 ta mustaqil Telegram hisobi:',
    auth_tg_account_1: '1-hisob: Farrux',
    auth_tg_account_2: '2-hisob: Dilshod',
    auth_tg_or_custom_id: 'Yoki oʻz ID ingiz',
    auth_tg_user_id_label: 'Telegram User ID *',
    auth_tg_name_label: 'Ismingiz yoki Kafe Nomi (ixtiyoriy)',
    auth_tg_btn_enter: 'Telegram orqali Kafega Kirish',
    auth_footer_cloud: 'Sellnex E-Commerce Cloud • Oʻzbekiston va Markaziy Osiyo',

    // Dashboard
    dash_title: 'Sotuvchi paneli',
    dash_welcome: 'Xush kelibsiz, {name}. Doʻkoningiz, buyurtmalar va havolalarni boshqaring.',
    dash_open_store: 'Doʻkonni ochish',
    dash_add_product: 'Mahsulot qoʻshish / import',
    dash_live_link_title: 'Sizning faol doʻkon havolangiz',
    dash_live_badge: 'Onlayn • Kirish talab etilmaydi',
    dash_copy_link: 'Doʻkon havolasini nusxalash',
    dash_share_social: 'Ijtimoiy tarmoqlarga ulashish',
    dash_welcome_banner_title: 'Yangi Sellnex doʻkoningizga xush kelibsiz!',
    dash_welcome_banner_desc: 'Sizning ommaviy doʻkoningiz faol. Shaxsiy mahsulotlar (oʻz omboringiz) yoki dropshipping (Uzum Market / AliExpress) orqali savdoni boshlang.',
    dash_add_first_product: 'Birinchi mahsulotni qoʻshish',
    dash_customize_store: 'Doʻkonni sozlash',
    dash_stat_revenue: 'Umumiy tushum',
    dash_stat_orders: 'Jami buyurtmalar',
    dash_stat_profit: 'Kutilayotgan sof foyda',
    dash_stat_catalog_usage: 'Katalog hajmi',
    dash_stat_margin_avg: 'Oʻrtacha rentabellik',
    dash_pending_processing: 'ta kutilayotgan buyurtma',
    dash_this_week_change: 'bu hafta',
    dash_recent_orders_title: 'Soʻnggi xaridor buyurtmalari',
    dash_view_all_orders: 'Barcha buyurtmalarni koʻrish',
    dash_th_order_id: 'Buyurtma ID',
    dash_th_customer: 'Mijoz',
    dash_th_status: 'Holat',
    dash_th_amount: 'Summa',
    dash_th_profit: 'Foyda',
    dash_no_orders_title: 'Hali buyurtmalar kelmadi',
    dash_no_orders_desc: 'Doʻkon havolangizni Instagram, TikTok yoki Telegramda ulashing. Mijozlar buyurtmalari bu yerda real vaqtda paydo boʻladi.',
    dash_quick_status_title: 'Doʻkon holati',
    dash_store_active_badge: 'Doʻkon faol va ommaga ochiq',
    dash_business_modes: 'Biznes rejimlari',
    dash_mode_personal: 'Shaxsiy',
    dash_mode_dropship: 'Dropship',
    dash_open_customizer: 'Doʻkon konstruktorini ochish',
    dash_chart_title: 'Daromad va Foyda dinamikasi',
    dash_chart_subtitle: 'Oxirgi 30 kunlik buyurtmalar tushumi va toʻlovlar trendi',
    dash_chart_tab_revenue: 'Tushum (UZS)',
    dash_chart_tab_profit: 'Sof foyda (UZS)',
    dash_chart_tab_both: 'Ikkalasi',
    dash_chart_30d_badge: 'Oxirgi 30 kun',
    dash_chart_30d_total: '30 kunlik jami tushum',
    dash_chart_daily_avg: 'Kunlik oʻrtacha',
    dash_chart_peak_day: 'Eng yuqori tushumli kun',
    dash_chart_footnote: 'Doʻkoningizdagi toʻlangan va qabul qilingan buyurtmalar asosida shakllangan',
    dash_top_products: 'Ommabop mahsulotlar',
    dash_all_products: 'Barcha mahsulotlar',

    // Topbar / Sidebar / Common
    topbar_your_stores: 'Sizning doʻkonlaringiz',
    topbar_create_another_store: '+ Yangi doʻkon qoʻshish',
    topbar_store_settings: 'Doʻkon va profil sozlamalari',
    topbar_store_builder: 'Konstruktor / Doʻkon dizayni',
    topbar_admin_portal: 'Bosh admin portali',
    topbar_sign_out: 'Tizimdan chiqish',
    trial_expired_title: 'Obunangiz muddati tugadi.',
    trial_expired_desc: 'Mahsulotlar qoʻshish va doʻkonni boshqarish uchun tarifingizni yangilang.',
    trial_btn_upgrade: 'Tarifni oshirish',
    trial_active_title: 'Bepul sinov muddati:',
    trial_products_count: 'mahsulot',
    sidebar_preview: 'Koʻrish',
    sidebar_copy_link: 'Havolani olish',
    sidebar_switch_to_store: '🛍️ Doʻkon Rejimiga oʻtish',
    sidebar_switch_to_cafe: '🍽️ Restoran Rejimiga oʻtish',
    sidebar_change_mode: 'Oʻzgartirish',
    sidebar_admin_panel: 'Bosh Admin Panel',
    mobile_tab_home: 'Bosh sahifa',
    mobile_tab_products: 'Mahsulotlar',
    mobile_tab_orders: 'Buyurtmalar',
    mobile_tab_store: 'Doʻkon',
    mobile_tab_more: 'Yana',
    mobile_drawer_title: 'Sellnex Menyusi',
    mobile_drawer_subtitle: 'Barcha boʻlimlar va sozlamalar',
    mobile_view_store: 'Doʻkonni koʻrish',

    // Additional Common / Topbar / Sidebar / Search / Device / Pricing
    topbar_back: 'Orqaga',
    topbar_search_placeholder: 'Mahsulotlar, buyurtmalar, mijozlarni qidirish...',
    topbar_device_title: 'Qurilma rejimini tanlash (Telefon / Kompyuter)',
    topbar_device_label: 'Qurilma',
    topbar_seller_account: 'Sotuvchi hisobi',
    topbar_store_singular: 'doʻkon',
    topbar_store_plural: 'doʻkon',
    sidebar_limit_used: 'Mahsulot limiti band',
    sidebar_upgrade: 'Tarifni oshirish →',
    sidebar_integrations_title: 'Toʻlov va Integratsiyalar',
    sidebar_live_badge: 'Jonli',
    sidebar_admin_badge: 'Admin',
    search_input_placeholder: 'Mahsulotlar, buyurtmalar, mijozlar, SKU yoki telefon raqami... (Esc yopish)',
    search_stores_heading: 'Doʻkonlar',
    search_products_heading: 'Mahsulotlar',
    search_orders_heading: 'Buyurtmalar',
    search_customers_heading: 'Mijozlar',
    search_no_results: 'Hech narsa topilmadi',
    search_cost_label: 'Tannarx',
    search_price_label: 'Narx',
    search_profit_label: 'foyda',
    device_modal_badge: 'QURILMA SOZLAMASI',
    device_modal_title: 'Qaysi qurilmadan foydalanmoqdasiz?',
    device_modal_subtitle: 'Bir marta tanlang, tizim ushbu sozlamani profilingizda eslab qoladi',
    device_phone_title: '📱 Telefon',
    device_phone_desc: 'Mobil brauzer yoki ilova orqali',
    device_computer_title: '💻 Kompyuter',
    device_computer_desc: 'Noutbuk yoki ish stoli kompyuteri',
    device_selected_badge: 'Tanlandi',
    device_continue_btn: 'DAVOM ETISH',
    device_modal_footer: 'Tanlovingiz profilingizda saqlanadi. Istalgan vaqt yuqori paneldagi tugma orqali oʻzgartirishingiz mumkin.',
    pricing_page_title: 'Obuna Tariflari va Mahsulot Limitlari',
    pricing_page_subtitle: 'Oʻzbekistondagi onlayn savdo uchun qulay va shaffof obuna rejalari. Paynet orqali bir zumda toʻlov.',
    pricing_current_plan: 'Joriy Tarif:',
    pricing_active_sub: 'Faol Obuna',
    pricing_free_trial: '7 Kunlik Bepul Sinov',
    pricing_catalog_limit: 'Maksimal katalog hajmi:',
    pricing_products_unit: 'ta mahsulot',
    pricing_existing_products: 'Mavjud mahsulotlar:',
    pricing_status_label: 'Holati:',
    pricing_login_register: 'Kirish / Roʻyxatdan oʻtish',
    pricing_starter_quick_btn: 'Starter ($1 / 3 oy) — Paynet',
    pricing_select_plan_btn: 'Tarifini Tanlash',
    pricing_current_active_badge: 'Joriy Faol Tarifingiz',
    pricing_trial_period_badge: 'Bepul Sinov Davri',
    pricing_auth_required_title: 'Tizimga Kirish Talab Qilinadi',
    pricing_auth_required_desc: 'Obuna sotib olish va mahsulot limitini kengaytirish uchun avval hisobingizga kiring yoki roʻyxatdan oʻting.',
    pricing_checkout_success_title: 'Obuna Muvaffaqiyatli Faollashtirildi! 🎉',
    pricing_checkout_close_btn: 'Yopish va Doʻkonga Qaytish',
    pricing_checkout_badge: 'Rasmiy Toʻlov & Obuna',
    pricing_checkout_activate_title: 'Tarifini Faollashtirish',
    pricing_user_label: 'Foydalanuvchi:',
    pricing_tab_paynet: '🟢 Paynet (Avtomatik)',
    pricing_tab_paynet_speed: 'Tezkor',
    pricing_tab_card: '💳 Karta (P2P Chek)',
    pricing_paynet_connecting: 'Paynet toʻlov shlyuziga ulanmoqda...',
    pricing_paynet_official_gateway: 'Paynet Rasmiy Shlyuzi',
    pricing_paynet_scan_qr: 'Paynet ilovasi orqali skanerlang',
    pricing_paynet_cashier_code_label: 'Kassa toʻlov kodi (Paynet shoxobchalari uchun):',
    pricing_paynet_tx_id: 'Tranzaksiya ID:',
    pricing_paynet_total_amount: 'Jami toʻlov miqdori:',
    pricing_paynet_status_pending: 'Status: Toʻlov kutilmoqda (har 3 soniyada avto-tekshiruv)',
    pricing_paynet_status_paid: 'Status: Toʻlov qabul qilindi!',
    pricing_paynet_status_cancelled: 'Status: Toʻlov bekor qilindi',
    pricing_paynet_status_failed: 'Status: Toʻlov amalga oshmadi',
    pricing_paynet_btn_verify: 'Tekshirish',
    pricing_qa_simulator_title: '🧪 QA & Test Simulyatori (Barcha holatlarni tekshirish):',
    pricing_qa_btn_success: '✓ Muvaffaqiyatli (Test)',
    pricing_qa_btn_cancel: 'Bekor qilish',
    pricing_qa_btn_reject: 'Rad etish',
    pricing_paynet_load_failed: 'Toʻlov maʻlumotlari yuklanmadi. Iltimos qaytadan urinib koʻring.',
    pricing_card_recipient_label: 'Qabul qiluvchi karta (Uzcard / Humo):',
    pricing_card_official_tag: 'Rasmiy',
    pricing_receipt_upload_label: 'Toʻlov cheki / Skrinshotini yuklash',
    pricing_receipt_attached_title: 'Chek skrinshoti biriktirildi',
    pricing_receipt_ready_admin: 'Admin tasdiqlashiga tayyor',
    pricing_receipt_drop_hint: 'Chek rasmini yuklash uchun bosing',
    pricing_receipt_formats_hint: 'Click, Payme yoki bank cheki skrinshoti (JPG, PNG)',
    pricing_sender_phone_label: 'Telefon raqamingiz',
    pricing_tx_note_label: 'Tranzaksiya / Izoh (ixtiyoriy)',
    pricing_btn_submit_receipt: 'Chekni Yuborish (Admin Tasdiqlashi)',
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
    nav_signup_short: 'Регистрация',
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

    // Device selector
    landing_device_selector_title: 'Вход по типу устройства:',
    landing_device_ready_badge: 'Telegram и Web готовы',
    landing_device_mobile_title: '📱 Телефон / Mini App',
    landing_device_mobile_desc: 'Мобильное приложение и Telegram Mini App',
    landing_device_desktop_title: '💻 Компьютер / Desktop',
    landing_device_desktop_desc: 'Полноэкранная панель управления',

    // Value Pills
    landing_pill_no_inventory: 'Без собственного склада',
    landing_pill_payments_ready: 'Click и Payme подключены',
    landing_pill_delivery: 'Доставка по Узбекистану за 24-48ч',
    landing_pill_profit_calc: 'Авто-калькулятор чистой прибыли',

    // Workflow (6 steps)
    landing_workflow_badge: 'Полный цикл работы',
    landing_workflow_title: 'Как работает Sellnex?',
    landing_workflow_subtitle: 'Запустите свой дропшиппинг-бизнес в Узбекистане за 6 простых автоматизированных шагов.',
    landing_step_of: 'Шаг {step} из 06',
    landing_step_1_title: 'Импорт товара',
    landing_step_1_desc: 'Вставьте ссылку на товар с Amazon, Alibaba, Uzum Market или от местных поставщиков. Фотографии, описания и варианты извлекаются моментально.',
    landing_step_1_badge: 'Авто-импорт',
    landing_step_2_title: 'Установите свою прибыль',
    landing_step_2_desc: 'Используйте умный калькулятор прибыли. Укажите фиксированный доход (напр. 75 000 сум) или процент маржи. Розничная цена рассчитается сама.',
    landing_step_2_badge: 'Умный расчет',
    landing_step_3_title: 'Опубликуйте свой магазин',
    landing_step_3_desc: 'Настройте брендированный магазин за 2 минуты в удобном конструкторе. Подключите свой домен или используйте бесплатный адрес .sellnex.uz.',
    landing_step_3_badge: 'Мгновенный запуск',
    landing_step_4_title: 'Делитесь ссылкой на магазин',
    landing_step_4_desc: 'Продвигайте ссылку на магазин в Instagram, Telegram, TikTok и WhatsApp со встроенными партнерскими и рекламными метками.',
    landing_step_4_badge: 'Мультиканальность',
    landing_step_5_title: 'Получайте заказы и оплату',
    landing_step_5_desc: 'Принимайте платежи через Click, Payme, Uzum Bank и наличными при получении. Средства покупателей поступают напрямую вам.',
    landing_step_5_badge: 'Платежи Узбекистана',
    landing_step_6_title: 'Автоматизируйте доставку',
    landing_step_6_desc: 'Наша система автоматически направляет заказы поставщикам, отслеживает отправку курьерами и уведомляет ваших клиентов.',
    landing_step_6_badge: 'На автопилоте',

    // Teaser
    landing_teaser_title: 'Хотите протестировать импорт товара прямо сейчас?',
    landing_teaser_desc: 'Вставьте ссылку с Amazon, Alibaba или Uzum в наш калькулятор, чтобы мгновенно увидеть маржу.',
    landing_teaser_btn: 'Открыть импорт товара и калькулятор прибыли',

    // Features
    landing_feat_badge: 'Возможности платформы',
    landing_feat_1_title: 'Конструктор витрины',
    landing_feat_1_desc: 'Кастомизируемые витрины в стиле Shopify, оптимизированные для мобильных продаж и высокой конверсии в Узбекистане.',
    landing_feat_2_title: 'Импорт товаров в 1 клик',
    landing_feat_2_desc: 'Извлечение оптовых цен, остатков, фото высокого разрешения и вариантов с любого ведущего маркетплейса.',
    landing_feat_3_title: 'Динамический калькулятор прибыли',
    landing_feat_3_desc: 'Расчет себестоимости + логистики + комиссии платежей + вашей чистой прибыли в режиме реального времени.',
    landing_feat_4_title: 'Платежные шлюзы Click и Payme',
    landing_feat_4_desc: 'Встроенный национальный платежный шлюз с поддержкой Click, Payme и рассрочки от Uzum Bank.',
    landing_feat_5_title: 'Экосистема Uzum Market',
    landing_feat_5_desc: 'Синхронизация остатков, экспорт заказов и удобное управление продажами на маркетплейсах.',
    landing_feat_6_title: 'Автоматизация заказов',
    landing_feat_6_desc: 'Автоотправка заказов поставщикам, автосинхронизация остатков и моментальные оповещения в Telegram-бот.',
    landing_feat_7_title: 'Аналитика в реальном времени',
    landing_feat_7_desc: 'Контролируйте GMV, чистую маржу, каналы трафика (Telegram, TikTok, IG) и самые продаваемые товары.',
    landing_feat_8_title: 'Региональная доставка и курьеры',
    landing_feat_8_desc: 'Автоматическая отправка через UzPost, BTS Cargo, Fargo Express и Яндекс Доставку по всем 12 регионам.',

    // Ecosystem & Integrations
    landing_eco_badge: 'Связанная экосистема',
    landing_eco_title: 'Маркетплейсы, Поставщики и Платежные системы',
    landing_eco_subtitle: 'Подключайте любимые сервисы с помощью готовых автоматических интеграций.',
    landing_eco_btn: 'Управление интеграциями в панели',

    // Pricing
    landing_pricing_badge: 'Прозрачные тарифы',
    landing_pricing_title: 'Тарифные планы для каждого продавца',
    landing_pricing_subtitle: 'Начните бесплатно и масштабируйте доходы по мере роста продаж.',
    landing_per_month: '/ месяц',
    landing_plan_free_desc: 'Идеально для первого знакомства с дропшиппингом',
    landing_plan_free_btn: 'Начать бесплатно',
    landing_plan_pro_badge: 'Популярный',
    landing_plan_pro_desc: 'Для активных онлайн-продавцов и дропшипперов',
    landing_plan_pro_btn: 'Оформить подписку PRO',
    landing_plan_biz_desc: 'Для крупных агентств и сетей магазинов',
    landing_plan_biz_btn: 'Перейти на Business',

    // Mockup & Footer
    landing_mockup_auto_active: '● Автовыполнение заказов: АКТИВНО',
    landing_mockup_revenue: 'Общая выручка',
    landing_mockup_revenue_change: '↑ +24.8% на этой неделе',
    landing_mockup_profit: 'Чистая прибыль',
    landing_mockup_margin: 'Средняя маржа: 26.0%',
    landing_mockup_orders: 'Оформлено заказов',
    landing_mockup_orders_sub: '100% автоматический дропшип',
    landing_mockup_products: 'Активные товары',
    landing_mockup_latest_order: 'Последний заказ',
    landing_mockup_launch: 'Открыть панель управления →',
    landing_footer_tagline: 'Продавайте. Автоматизируйте. Растите.',

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

    // Auth Extended
    auth_login_headline: 'Вход в Sellnex',
    auth_signup_headline: 'Создайте аккаунт продавца',
    auth_forgot_headline: 'Сброс пароля',
    auth_reset_sent_headline: 'Проверьте почту',
    auth_login_desc: 'Введите ваш email и пароль для входа в панель управления.',
    auth_signup_desc: 'Зарегистрируйтесь, чтобы начать продажи по всему Узбекистану.',
    auth_forgot_desc: 'Введите ваш email для получения ссылки на сброс пароля.',
    auth_reset_sent_desc: 'Инструкции по восстановлению пароля отправлены на почту.',
    auth_tab_login: 'Вход',
    auth_tab_signup: 'Регистрация',
    auth_tab_telegram: 'Telegram Кафе',
    auth_email_or_phone: 'Email или номер телефона',
    auth_email_address: 'Адрес электронной почты',
    auth_phone_number: 'Номер телефона',
    auth_full_name: 'Имя и Фамилия',
    auth_forgot_password_link: 'Забыли пароль?',
    auth_password_label: 'Пароль',
    auth_password_requirements: 'Требования к паролю',
    auth_req_strong: 'Надежный пароль',
    auth_req_incomplete: 'Не завершено',
    auth_req_upper: '1 заглавная буква (A-Z)',
    auth_req_lower: '1 строчная буква (a-z)',
    auth_req_number: '1 цифра (0-9)',
    auth_req_dot: '1 точка (.)',
    auth_req_min_length: 'Минимум 8 символов (например: Sellnex1.)',
    auth_confirm_password: 'Подтвердите пароль',
    auth_pw_match: 'Пароли совпадают',
    auth_pw_mismatch: 'Пароли не совпадают',
    auth_btn_signin_dashboard: 'Войти в панель управления',
    auth_btn_register: 'Зарегистрироваться',
    auth_btn_send_reset: 'Отправить ссылку для сброса',
    auth_btn_back_to_login: '← Вернуться ко входу',
    auth_recovery_dispatched: 'Ссылка для восстановления отправлена',
    auth_btn_return_login: 'Вернуться ко входу',
    auth_business_type_title: 'Как вы планируете использовать Sellnex?',
    auth_type_store: 'Интернет-магазин',
    auth_type_store_desc: 'Продажа товаров, корзина и витрина',
    auth_type_cafe: 'Ресторан / Кафе',
    auth_type_cafe_desc: 'Меню, блюда и заказы',
    auth_tg_isolation_title: 'Изоляция Multi-Tenant Кафе',
    auth_tg_isolation_desc: 'У каждого аккаунта Telegram свой независимый ownerId и cafeId. Меню и заказы других заведений никогда не смешиваются.',
    auth_tg_test_accounts: '2 независимых аккаунта Telegram для тестирования:',
    auth_tg_account_1: 'Аккаунт 1: Фаррух',
    auth_tg_account_2: 'Аккаунт 2: Дильшод',
    auth_tg_or_custom_id: 'Или ваш собственный ID',
    auth_tg_user_id_label: 'Telegram User ID *',
    auth_tg_name_label: 'Ваше имя или Название кафе (необязательно)',
    auth_tg_btn_enter: 'Войти в Кафе через Telegram',
    auth_footer_cloud: 'Sellnex E-Commerce Cloud • Узбекистан и Центральная Азия',

    // Dashboard
    dash_title: 'Панель продавца',
    dash_welcome: 'С возвращением, {name}. Управляйте магазином, заказами и ссылками.',
    dash_open_store: 'Открыть магазин',
    dash_add_product: 'Добавить / Импорт товара',
    dash_live_link_title: 'Ссылка на вашу активную витрину',
    dash_live_badge: 'Онлайн • Вход не требуется',
    dash_copy_link: 'Скопировать ссылку магазина',
    dash_share_social: 'Поделиться в соцсетях',
    dash_welcome_banner_title: 'Добро пожаловать в ваш новый магазин Sellnex!',
    dash_welcome_banner_desc: 'Ваша витрина активна. Начните продажи со своими товарами или по дропшиппингу (Uzum Market / AliExpress).',
    dash_add_first_product: 'Добавить первый товар',
    dash_customize_store: 'Настроить витрину',
    dash_stat_revenue: 'Общая выручка',
    dash_stat_orders: 'Всего заказов',
    dash_stat_profit: 'Ожидаемая чистая прибыль',
    dash_stat_catalog_usage: 'Использование каталога',
    dash_stat_margin_avg: 'Средняя маржинальность',
    dash_pending_processing: 'заказов в обработке',
    dash_this_week_change: 'на этой неделе',
    dash_recent_orders_title: 'Последние заказы клиентов',
    dash_view_all_orders: 'Все заказы',
    dash_th_order_id: 'ID заказа',
    dash_th_customer: 'Клиент',
    dash_th_status: 'Статус',
    dash_th_amount: 'Сумма',
    dash_th_profit: 'Прибыль',
    dash_no_orders_title: 'Заказов пока нет',
    dash_no_orders_desc: 'Поделитесь ссылкой на магазин в Instagram, TikTok или Telegram. Заказы клиентов появятся здесь мгновенно.',
    dash_quick_status_title: 'Статус магазина',
    dash_store_active_badge: 'Витрина активна и доступна',
    dash_business_modes: 'Режимы бизнеса',
    dash_mode_personal: 'Собственные',
    dash_mode_dropship: 'Дропшиппинг',
    dash_open_customizer: 'Открыть конструктор витрины',
    dash_chart_title: 'Динамика выручки и прибыли',
    dash_chart_subtitle: 'Тренды выручки от заказов и поступлений за последние 30 дней',
    dash_chart_tab_revenue: 'Выручка (UZS)',
    dash_chart_tab_profit: 'Чистая прибыль (UZS)',
    dash_chart_tab_both: 'Оба показателя',
    dash_chart_30d_badge: 'Последние 30 дней',
    dash_chart_30d_total: 'Общая выручка за 30 дней',
    dash_chart_daily_avg: 'В среднем за день',
    dash_chart_peak_day: 'Пиковый день продаж',
    dash_chart_footnote: 'Рассчитано на основе оплаченных и выполненных заказов магазина',
    dash_top_products: 'Популярные товары',
    dash_all_products: 'Все товары',

    // Topbar / Sidebar / Common
    topbar_your_stores: 'Ваши магазины',
    topbar_create_another_store: '+ Создать еще магазин',
    topbar_store_settings: 'Настройки магазина и профиля',
    topbar_store_builder: 'Конструктор / Дизайн витрины',
    topbar_admin_portal: 'Панель администратора',
    topbar_sign_out: 'Выйти из системы',
    trial_expired_title: 'Срок подписки истек.',
    trial_expired_desc: 'Обновите тариф, чтобы продолжить управление магазином и товарами.',
    trial_btn_upgrade: 'Улучшить тариф',
    trial_active_title: 'Бесплатный период:',
    trial_products_count: 'товаров',
    sidebar_preview: 'Просмотр',
    sidebar_copy_link: 'Копировать',
    sidebar_switch_to_store: '🛍️ Перейти в режим Магазина',
    sidebar_switch_to_cafe: '🍽️ Перейти в режим Ресторана',
    sidebar_change_mode: 'Изменить',
    sidebar_admin_panel: 'Главная панель Admin',
    mobile_tab_home: 'Главная',
    mobile_tab_products: 'Товары',
    mobile_tab_orders: 'Заказы',
    mobile_tab_store: 'Магазин',
    mobile_tab_more: 'Еще',
    mobile_drawer_title: 'Меню Sellnex',
    mobile_drawer_subtitle: 'Все разделы и настройки',
    mobile_view_store: 'Открыть витрину',

    // Additional Common / Topbar / Sidebar / Search / Device / Pricing
    topbar_back: 'Назад',
    topbar_search_placeholder: 'Поиск товаров, заказов, клиентов...',
    topbar_device_title: 'Выбор режима устройства (Телефон / Компьютер)',
    topbar_device_label: 'Устройство',
    topbar_seller_account: 'Аккаунт продавца',
    topbar_store_singular: 'магазин',
    topbar_store_plural: 'магазинов',
    sidebar_limit_used: 'Лимит товаров использован',
    sidebar_upgrade: 'Улучшить тариф →',
    sidebar_integrations_title: 'Платежи и Интеграции',
    sidebar_live_badge: 'Активен',
    sidebar_admin_badge: 'Админ',
    search_input_placeholder: 'Поиск товаров, заказов, клиентов, SKU или телефонов... (Esc закрыть)',
    search_stores_heading: 'Магазины',
    search_products_heading: 'Товары',
    search_orders_heading: 'Заказы',
    search_customers_heading: 'Клиенты',
    search_no_results: 'Ничего не найдено',
    search_cost_label: 'Себестоимость',
    search_price_label: 'Цена',
    search_profit_label: 'прибыль',
    device_modal_badge: 'НАСТРОЙКА УСТРОЙСТВА',
    device_modal_title: 'Какое устройство вы используете?',
    device_modal_subtitle: 'Выберите один раз, система сохранит настройку в вашем профиле',
    device_phone_title: '📱 Телефон',
    device_phone_desc: 'Через мобильный браузер или приложение',
    device_computer_title: '💻 Компьютер',
    device_computer_desc: 'Ноутбук или настольный ПК',
    device_selected_badge: 'Выбрано',
    device_continue_btn: 'ПРОДОЛЖИТЬ',
    device_modal_footer: 'Ваш выбор сохраняется в профиле. Вы можете изменить его в любое время в верхней панели.',
    pricing_page_title: 'Тарифные планы и лимиты товаров',
    pricing_page_subtitle: 'Удобные и прозрачные тарифные планы для торговли в Узбекистане. Мгновенная оплата через Paynet.',
    pricing_current_plan: 'Текущий тариф:',
    pricing_active_sub: 'Активная подписка',
    pricing_free_trial: '7 дней бесплатного теста',
    pricing_catalog_limit: 'Максимальный лимит каталога:',
    pricing_products_unit: 'товаров',
    pricing_existing_products: 'Текущие товары:',
    pricing_status_label: 'Статус:',
    pricing_login_register: 'Войти / Регистрация',
    pricing_starter_quick_btn: 'Starter ($1 / 3 мес) — Paynet',
    pricing_select_plan_btn: 'Выбрать тариф',
    pricing_current_active_badge: 'Ваш активный тариф',
    pricing_trial_period_badge: 'Пробный период',
    pricing_auth_required_title: 'Требуется авторизация',
    pricing_auth_required_desc: 'Чтобы оформить подписку и расширить лимит товаров, пожалуйста, войдите в аккаунт или зарегистрируйтесь.',
    pricing_checkout_success_title: 'Подписка успешно активирована! 🎉',
    pricing_checkout_close_btn: 'Закрыть и вернуться в магазин',
    pricing_checkout_badge: 'Официальная оплата и подписка',
    pricing_checkout_activate_title: 'Активация тарифа',
    pricing_user_label: 'Пользователь:',
    pricing_tab_paynet: '🟢 Paynet (Автоматически)',
    pricing_tab_paynet_speed: 'Быстро',
    pricing_tab_card: '💳 Карта (Чек P2P)',
    pricing_paynet_connecting: 'Подключение к шлюзу Paynet...',
    pricing_paynet_official_gateway: 'Официальный шлюз Paynet',
    pricing_paynet_scan_qr: 'Сканируйте через приложение Paynet',
    pricing_paynet_cashier_code_label: 'Код оплаты в кассе (для точек Paynet):',
    pricing_paynet_tx_id: 'ID транзакции:',
    pricing_paynet_total_amount: 'Итоговая сумма оплаты:',
    pricing_paynet_status_pending: 'Статус: Ожидание оплаты (автопроверка каждые 3 сек)',
    pricing_paynet_status_paid: 'Статус: Оплата принята!',
    pricing_paynet_status_cancelled: 'Статус: Оплата отменена',
    pricing_paynet_status_failed: 'Статус: Оплата не прошла',
    pricing_paynet_btn_verify: 'Проверить',
    pricing_qa_simulator_title: '🧪 Тестовый QA-симулятор (проверка всех статусов):',
    pricing_qa_btn_success: '✓ Успешно (Тест)',
    pricing_qa_btn_cancel: 'Отменить',
    pricing_qa_btn_reject: 'Отклонить',
    pricing_paynet_load_failed: 'Данные оплаты не загрузились. Пожалуйста, попробуйте снова.',
    pricing_card_recipient_label: 'Карта получателя (Uzcard / Humo):',
    pricing_card_official_tag: 'Официальный',
    pricing_receipt_upload_label: 'Загрузить чек / скриншот оплаты',
    pricing_receipt_attached_title: 'Скриншот чека прикреплен',
    pricing_receipt_ready_admin: 'Готово для подтверждения администратором',
    pricing_receipt_drop_hint: 'Нажмите для загрузки чека',
    pricing_receipt_formats_hint: 'Скриншот Click, Payme или банковского приложения (JPG, PNG)',
    pricing_sender_phone_label: 'Ваш номер телефона',
    pricing_tx_note_label: 'Транзакция / Примечание (необязательно)',
    pricing_btn_submit_receipt: 'Отправить чек (на проверку админу)',
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
    nav_signup_short: 'Sign Up',
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

    // Device selector
    landing_device_selector_title: 'Access by device type:',
    landing_device_ready_badge: 'Telegram & Web ready',
    landing_device_mobile_title: '📱 Phone / Mini App',
    landing_device_mobile_desc: 'Mobile & Telegram Mini App',
    landing_device_desktop_title: '💻 Computer / Desktop',
    landing_device_desktop_desc: 'Wide-screen Merchant Dashboard',

    // Value Pills
    landing_pill_no_inventory: 'No Inventory Required',
    landing_pill_payments_ready: 'Click & Payme Ready',
    landing_pill_delivery: '24-48h Delivery in Uzbekistan',
    landing_pill_profit_calc: 'Automatic Profit Calculator',

    // Workflow (6 steps)
    landing_workflow_badge: 'End-to-End Workflow',
    landing_workflow_title: 'How Sellnex Works',
    landing_workflow_subtitle: 'Start your dropshipping business in Uzbekistan in 6 simple, automated steps.',
    landing_step_of: 'Step {step} of 06',
    landing_step_1_title: 'Import a Product',
    landing_step_1_desc: 'Paste any product link from Amazon, Alibaba, Uzum Market, or local suppliers. We instantly extract images, descriptions & variants.',
    landing_step_1_badge: 'Auto-Import',
    landing_step_2_title: 'Set Your Profit',
    landing_step_2_desc: 'Use our smart profit calculator. Enter fixed earnings (e.g. 75,000 UZS) or percentage margin. Selling price is calculated automatically.',
    landing_step_2_badge: 'Smart Math',
    landing_step_3_title: 'Publish Your Store',
    landing_step_3_desc: 'Customize your branded storefront in 2 minutes with our drag-and-drop builder. Connect custom domain or use your free .sellnex.uz URL.',
    landing_step_3_badge: 'Live Instantly',
    landing_step_4_title: 'Share Your Link',
    landing_step_4_desc: 'Promote your store link across Instagram, Telegram, TikTok and WhatsApp with built-in affiliate and tracking campaign links.',
    landing_step_4_badge: 'Multi-Channel',
    landing_step_5_title: 'Receive Orders & Paid',
    landing_step_5_desc: 'Accept local payments effortlessly with Click, Payme, Uzum Bank, and Cash on Delivery. Customer funds transfer directly.',
    landing_step_5_badge: 'Uzbekistan Switch',
    landing_step_6_title: 'Automate Fulfillment',
    landing_step_6_desc: 'Sit back as our automation engine automatically routes orders to suppliers, tracks courier dispatch, and updates your customer.',
    landing_step_6_badge: 'Hands-Free',

    // Teaser
    landing_teaser_title: 'Want to test importing a product right now?',
    landing_teaser_desc: 'Try pasting any Amazon, Alibaba or Uzum link into our calculator to see instant profit margins.',
    landing_teaser_btn: 'Open Product Importer & Profit Calculator',

    // Features
    landing_feat_badge: 'Platform Capabilities',
    landing_feat_1_title: 'Storefront Builder',
    landing_feat_1_desc: 'Shopify-style customizable storefronts optimized for mobile conversion in Uzbekistan.',
    landing_feat_2_title: '1-Click Product Importer',
    landing_feat_2_desc: 'Extract supplier costs, stock, high-res photos and variants from any major e-commerce marketplace.',
    landing_feat_3_title: 'Dynamic Profit Calculator',
    landing_feat_3_desc: 'Calculate supplier base + logistics + payment commission + your net profit in real-time.',
    landing_feat_4_title: 'Click & Payme Native Gateways',
    landing_feat_4_desc: 'Pre-integrated national payment switch with support for Click, Payme, and Uzum Bank installments.',
    landing_feat_5_title: 'Uzum Market Ecosystem',
    landing_feat_5_desc: 'Sync inventory, export orders, and manage cross-platform marketplace channels seamlessly.',
    landing_feat_6_title: 'Dropship Order Automation',
    landing_feat_6_desc: 'Auto-dispatch orders to suppliers, auto-sync stock, and send Telegram bot alerts instantly.',
    landing_feat_7_title: 'Real-time Analytics',
    landing_feat_7_desc: 'Monitor GMV, net margins, traffic channels (Telegram, TikTok, IG), and best-sellers.',
    landing_feat_8_title: 'Regional Delivery & Couriers',
    landing_feat_8_desc: 'Automated dispatch with UzPost, BTS Cargo, Fargo Express, and Yandex Delivery across all 12 regions.',

    // Ecosystem & Integrations
    landing_eco_badge: 'Connected Ecosystem',
    landing_eco_title: 'Marketplaces, Suppliers & Local Payments',
    landing_eco_subtitle: 'Connect your favorite platforms with real automated integrations.',
    landing_eco_btn: 'Manage Integrations in Dashboard',

    // Pricing
    landing_pricing_badge: 'Simple Pricing',
    landing_pricing_title: 'Transparent Plans for Every Seller',
    landing_pricing_subtitle: 'Start for free and scale your commerce revenue as you grow.',
    landing_per_month: '/ month',
    landing_plan_free_desc: 'Perfect for trying out dropshipping',
    landing_plan_free_btn: 'Get Started Free',
    landing_plan_pro_badge: 'Most Popular',
    landing_plan_pro_desc: 'For active online sellers & dropshippers',
    landing_plan_pro_btn: 'Subscribe to PRO',
    landing_plan_biz_desc: 'For large volume agencies & multi-stores',
    landing_plan_biz_btn: 'Upgrade to Business',

    // Mockup & Footer
    landing_mockup_auto_active: '● Order Auto-Fulfillment: ACTIVE',
    landing_mockup_revenue: 'Total Revenue',
    landing_mockup_revenue_change: '↑ +24.8% this week',
    landing_mockup_profit: 'Net Profit',
    landing_mockup_margin: 'Avg. margin: 26.0%',
    landing_mockup_orders: 'Orders Placed',
    landing_mockup_orders_sub: '100% automated dropship',
    landing_mockup_products: 'Active Products',
    landing_mockup_latest_order: 'Latest Order',
    landing_mockup_launch: 'Launch Dashboard →',
    landing_footer_tagline: 'Sell. Automate. Grow.',

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

    // Auth Extended
    auth_login_headline: 'Log In to Sellnex',
    auth_signup_headline: 'Create Your Seller Account',
    auth_forgot_headline: 'Reset Your Password',
    auth_reset_sent_headline: 'Check Your Email',
    auth_login_desc: 'Enter your registered email and password to access your dashboard.',
    auth_signup_desc: 'Register your account to start selling across Uzbekistan.',
    auth_forgot_desc: 'Enter your registered email to receive a password reset link.',
    auth_reset_sent_desc: 'We have dispatched password recovery instructions to your email.',
    auth_tab_login: 'Log In',
    auth_tab_signup: 'Sign Up',
    auth_tab_telegram: 'Telegram Café',
    auth_email_or_phone: 'Email or Phone Number',
    auth_email_address: 'Email Address',
    auth_phone_number: 'Phone Number',
    auth_full_name: 'Full Name',
    auth_forgot_password_link: 'Forgot password?',
    auth_password_label: 'Password',
    auth_password_requirements: 'Password Requirements',
    auth_req_strong: 'Strong Password',
    auth_req_incomplete: 'Incomplete',
    auth_req_upper: '1 uppercase letter (A-Z)',
    auth_req_lower: '1 lowercase letter (a-z)',
    auth_req_number: '1 number (0-9)',
    auth_req_dot: '1 dot (.)',
    auth_req_min_length: 'Minimum 8 characters (e.g. Sellnex1.)',
    auth_confirm_password: 'Confirm Password',
    auth_pw_match: 'Passwords match',
    auth_pw_mismatch: 'Passwords do not match',
    auth_btn_signin_dashboard: 'Sign In to Dashboard',
    auth_btn_register: 'Register',
    auth_btn_send_reset: 'Send Password Reset Link',
    auth_btn_back_to_login: '← Back to Sign In',
    auth_recovery_dispatched: 'Recovery Link Dispatched',
    auth_btn_return_login: 'Return to Login',
    auth_business_type_title: 'How do you plan to use Sellnex?',
    auth_type_store: 'Online Store',
    auth_type_store_desc: 'Product sales, cart and storefront',
    auth_type_cafe: 'Restaurant / Café',
    auth_type_cafe_desc: 'Menu, dishes and table orders',
    auth_tg_isolation_title: 'Multi-Tenant Café Isolation',
    auth_tg_isolation_desc: 'Each Telegram account has its independent ownerId and cafeId. Menus and orders of other establishments are never mixed.',
    auth_tg_test_accounts: '2 independent test Telegram accounts:',
    auth_tg_account_1: 'Account 1: Farrukh',
    auth_tg_account_2: 'Account 2: Dilshod',
    auth_tg_or_custom_id: 'Or your own ID',
    auth_tg_user_id_label: 'Telegram User ID *',
    auth_tg_name_label: 'Your Name or Café Name (optional)',
    auth_tg_btn_enter: 'Enter Café via Telegram',
    auth_footer_cloud: 'Sellnex E-Commerce Cloud • Uzbekistan & Central Asia',

    // Dashboard
    dash_title: 'Seller Dashboard',
    dash_welcome: 'Welcome back, {name}. Manage your store operations, orders, and public links.',
    dash_open_store: 'Open Store',
    dash_add_product: 'Add / Import Product',
    dash_live_link_title: 'Your Live Public Store Link',
    dash_live_badge: 'Online & No-Login Required',
    dash_copy_link: 'Copy Store Link',
    dash_share_social: 'Share on Social',
    dash_welcome_banner_title: 'Welcome to your new Sellnex Store!',
    dash_welcome_banner_desc: 'Your public storefront is live. Choose between Personal Products (your warehouse) or Dropshipping (Uzum Market / AliExpress) to start selling.',
    dash_add_first_product: 'Add First Product',
    dash_customize_store: 'Customize Store',
    dash_stat_revenue: 'Total Revenue',
    dash_stat_orders: 'Total Orders',
    dash_stat_profit: 'Est. Net Profit',
    dash_stat_catalog_usage: 'Catalog Usage',
    dash_stat_margin_avg: 'Average margin',
    dash_pending_processing: 'pending processing',
    dash_this_week_change: 'this week',
    dash_recent_orders_title: 'Recent Customer Orders',
    dash_view_all_orders: 'View All Orders',
    dash_th_order_id: 'Order ID',
    dash_th_customer: 'Customer',
    dash_th_status: 'Status',
    dash_th_amount: 'Amount',
    dash_th_profit: 'Profit',
    dash_no_orders_title: 'No orders received yet',
    dash_no_orders_desc: 'Share your public store link on Instagram, TikTok, or Telegram. Orders placed by customers will appear here in real-time.',
    dash_quick_status_title: 'Store Quick Status',
    dash_store_active_badge: 'Storefront is Active & Public',
    dash_business_modes: 'Business Modes',
    dash_mode_personal: 'Personal',
    dash_mode_dropship: 'Dropship',
    dash_open_customizer: 'Open Storefront Customizer',
    dash_chart_title: 'Revenue & Profit Overview',
    dash_chart_subtitle: 'Daily order revenue and payment trends over the last 30 days',
    dash_chart_tab_revenue: 'Revenue (UZS)',
    dash_chart_tab_profit: 'Net Profit (UZS)',
    dash_chart_tab_both: 'Both',
    dash_chart_30d_badge: 'Last 30 Days',
    dash_chart_30d_total: '30-Day Total Revenue',
    dash_chart_daily_avg: 'Daily Average',
    dash_chart_peak_day: 'Peak Sales Day',
    dash_chart_footnote: 'Based on verified and paid orders across your storefront',
    dash_top_products: 'Top Products',
    dash_all_products: 'All Products',

    // Topbar / Sidebar / Common
    topbar_your_stores: 'Your Stores',
    topbar_create_another_store: '+ Create Another Store',
    topbar_store_settings: 'Store & Account Settings',
    topbar_store_builder: 'Customizer / Store Builder',
    topbar_admin_portal: 'Platform Admin Portal',
    topbar_sign_out: 'Sign Out',
    trial_expired_title: 'Your subscription has expired.',
    trial_expired_desc: 'Upgrade your plan to continue adding products and managing your store.',
    trial_btn_upgrade: 'Upgrade Plan',
    trial_active_title: 'Free Trial:',
    trial_products_count: 'products',
    sidebar_preview: 'Preview',
    sidebar_copy_link: 'Copy Link',
    sidebar_switch_to_store: '🛍️ Switch to Store Mode',
    sidebar_switch_to_cafe: '🍽️ Switch to Restaurant Mode',
    sidebar_change_mode: 'Switch',
    sidebar_admin_panel: 'Platform Admin Panel',
    mobile_tab_home: 'Home',
    mobile_tab_products: 'Products',
    mobile_tab_orders: 'Orders',
    mobile_tab_store: 'Store',
    mobile_tab_more: 'More',
    mobile_drawer_title: 'Sellnex Navigation',
    mobile_drawer_subtitle: 'Quick access to all tools & settings',
    mobile_view_store: 'View Store',

    // Additional Common / Topbar / Sidebar / Search / Device / Pricing
    topbar_back: 'Back',
    topbar_search_placeholder: 'Search products, orders, customers...',
    topbar_device_title: 'Select device mode (Phone / Computer)',
    topbar_device_label: 'Device',
    topbar_seller_account: 'Seller Account',
    topbar_store_singular: 'store',
    topbar_store_plural: 'stores',
    sidebar_limit_used: 'Product limit used',
    sidebar_upgrade: 'Upgrade Plan →',
    sidebar_integrations_title: 'Payments & Integrations',
    sidebar_live_badge: 'Live',
    sidebar_admin_badge: 'Admin',
    search_input_placeholder: 'Search products, orders, customers, SKUs, or phone numbers... (Esc to close)',
    search_stores_heading: 'Stores',
    search_products_heading: 'Products',
    search_orders_heading: 'Orders',
    search_customers_heading: 'Customers',
    search_no_results: 'No results found',
    search_cost_label: 'Cost',
    search_price_label: 'Price',
    search_profit_label: 'profit',
    device_modal_badge: 'DEVICE SETTING',
    device_modal_title: 'Which device are you using?',
    device_modal_subtitle: 'Select once, the system will remember this setting in your profile',
    device_phone_title: '📱 Phone',
    device_phone_desc: 'Via mobile browser or app',
    device_computer_title: '💻 Computer',
    device_computer_desc: 'Laptop or desktop computer',
    device_selected_badge: 'Selected',
    device_continue_btn: 'CONTINUE',
    device_modal_footer: 'Your choice is saved in your profile. You can change it anytime via the top bar.',
    pricing_page_title: 'Subscription Plans & Product Limits',
    pricing_page_subtitle: 'Transparent and flexible subscription plans for commerce in Uzbekistan. Instant payment via Paynet.',
    pricing_current_plan: 'Current Plan:',
    pricing_active_sub: 'Active Subscription',
    pricing_free_trial: '7-Day Free Trial',
    pricing_catalog_limit: 'Maximum Catalog Limit:',
    pricing_products_unit: 'products',
    pricing_existing_products: 'Current Products:',
    pricing_status_label: 'Status:',
    pricing_login_register: 'Sign In / Register',
    pricing_starter_quick_btn: 'Starter ($1 / 3 mos) — Paynet',
    pricing_select_plan_btn: 'Choose Plan',
    pricing_current_active_badge: 'Your Active Plan',
    pricing_trial_period_badge: 'Free Trial Period',
    pricing_auth_required_title: 'Authentication Required',
    pricing_auth_required_desc: 'To purchase a subscription and expand your product limit, please log in or create an account.',
    pricing_checkout_success_title: 'Subscription Successfully Activated! 🎉',
    pricing_checkout_close_btn: 'Close & Return to Store',
    pricing_checkout_badge: 'Official Payment & Subscription',
    pricing_checkout_activate_title: 'Activate Plan',
    pricing_user_label: 'User:',
    pricing_tab_paynet: '🟢 Paynet (Automatic)',
    pricing_tab_paynet_speed: 'Instant',
    pricing_tab_card: '💳 Card (P2P Receipt)',
    pricing_paynet_connecting: 'Connecting to Paynet payment gateway...',
    pricing_paynet_official_gateway: 'Paynet Official Gateway',
    pricing_paynet_scan_qr: 'Scan via Paynet mobile app',
    pricing_paynet_cashier_code_label: 'Cashier payment code (for Paynet branches):',
    pricing_paynet_tx_id: 'Transaction ID:',
    pricing_paynet_total_amount: 'Total payment amount:',
    pricing_paynet_status_pending: 'Status: Waiting for payment (auto-checks every 3s)',
    pricing_paynet_status_paid: 'Status: Payment received!',
    pricing_paynet_status_cancelled: 'Status: Payment cancelled',
    pricing_paynet_status_failed: 'Status: Payment failed',
    pricing_paynet_btn_verify: 'Verify',
    pricing_qa_simulator_title: '🧪 QA Test Simulator (verify all statuses):',
    pricing_qa_btn_success: '✓ Success (Test)',
    pricing_qa_btn_cancel: 'Cancel',
    pricing_qa_btn_reject: 'Reject',
    pricing_paynet_load_failed: 'Payment details could not be loaded. Please try again.',
    pricing_card_recipient_label: 'Recipient Card (Uzcard / Humo):',
    pricing_card_official_tag: 'Official',
    pricing_receipt_upload_label: 'Upload payment receipt / screenshot',
    pricing_receipt_attached_title: 'Receipt screenshot attached',
    pricing_receipt_ready_admin: 'Ready for admin verification',
    pricing_receipt_drop_hint: 'Click to upload receipt image',
    pricing_receipt_formats_hint: 'Click, Payme, or bank app screenshot (JPG, PNG)',
    pricing_sender_phone_label: 'Your phone number',
    pricing_tx_note_label: 'Transaction ID / Note (optional)',
    pricing_btn_submit_receipt: 'Submit Receipt (Admin Review)',
  },
};

export const languagesList = [
  { code: 'uz' as Language, name: 'Oʻzbekcha', short: 'UZ', flag: '🇺🇿' },
  { code: 'ru' as Language, name: 'Русский', short: 'RU', flag: '🇷🇺' },
  { code: 'en' as Language, name: 'English', short: 'EN', flag: '🇬🇧' },
];
