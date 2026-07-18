/**
 * i18n.js — Internationalization (TR/EN) for GSEM MEP PRO
 * IIFE pattern: window.i18n = { lang, strings, setLang, get, applyI18n }
 */
(function() {
    'use strict';

    // Localized strings: Türkçe (tr) ve İngilizce (en)
    const strings = {
        tr: {
            app_title: 'GSEM MEP PRO',
            app_name: 'GSEM MEP PRO',
            project_explorer: 'Proje Gezgini',
            btn_add_room: '+ Mahal Ekle',
            module_title: 'Isıtma/Soğutma Modülü — Mahaller Listesi',
            ribbon_home: 'Ana Sayfa',
            ribbon_heating_cooling: 'Isitma/Sogutma',
            ribbon_ventilation: 'Havalandir',
            ribbon_plumbing: 'Sihhi Test',
            ribbon_fire: 'Yangin Sistem',
            ribbon_reports: 'Raporlar',
            ribbon_settings: 'Ayarlar',
            ribbon_add_label: 'Ekle',
            sidebar_project_explorer: 'Proje Gezgini',
            tree_project: 'Proje',
            doc_tab_rooms: 'Mahaller',
            content_title_rooms: 'Isıtma/Soğutma Modülü — Mahaller Listesi',
            table_room_name: 'Mahal Adi',
            table_area: 'Alan (m2)',
            table_height: 'Yukseklik (m)',
            table_heat_loss: 'Isi Kaybi (W)',
            table_cooling_load: 'Sogutma Yuku (W)',
            table_status: 'Durum',
            panel_summary_title: 'Hesap Ozeti',
            panel_heating_load: 'Isi Yuku',
            panel_cooling_load: 'Sogutma Yuku',
            panel_total: 'Toplam:',
            panel_unit_load: 'Birim Yuku:',
            panel_room_count: 'Mahal Sayisi:',
            panel_info: 'Bilgi',
            panel_info_text: 'Mahaller ekleyerek baslayın.',
            footer_ready: 'Hazir',
            footer_version: 'GSEM MEP PRO v1.0',
            footer_units: 'Birim: SI (m, kW)',
            modal_title_add_room: 'Yeni Mahal Ekle',
            modal_room_name: 'Mahal Adi',
            modal_area: 'Alan (m2)',
            modal_height: 'Kat Yuksekligi (m)',
            modal_ext_temp_winter: 'Dis Sicaklik - Kis (°C)',
            modal_int_temp_winter: 'Ic Sicaklik - Kis (°C)',
            modal_ext_temp_summer: 'Dis Sicaklik - Yaz (°C)',
            modal_int_temp_summer: 'Ic Sicaklik - Yaz (°C)',
            modal_cancel: 'Iptal',
            modal_add: 'Ekle',
            modal_fill_fields: 'Lutfen tum alanlari doldurun.',
            info_add_rooms: 'Mahaller ekleyerek baslayın.',
            table_empty: 'Mahal eklenmemis',
            summary_area: 'Toplam Alan:',
            summary_heating: 'Isı Kaybi:',
            summary_cooling: 'Soğutma Yükü:',
            summary_rooms: 'Mahallar:',
            error_calc_engine_missing: 'hesaplaMahalV5 fonksiyonu yüklenmedi (calc-engine.js eksik?).',
            error_calc_failed: 'Mahal hesaplamada hata (hesaplaMahalV5).',
            error_storage_write: 'localStorage yazma hatası.',
            error_storage_read: 'localStorage okuma hatası.',
            report_title: 'Proje Raporu',
            report_subtitle: 'Isıtma/Soğutma Hesapları',
            report_summary: 'Özet',
            report_total_area: 'Toplam Alan:',
            report_total_heating: 'Toplam Isı Kaybı:',
            report_total_cooling: 'Toplam Soğutma Yükü:',
            report_avg_heating: 'Ortalama Isı (W/m²):',
            report_export: 'Rapor İndir (CSV)',
            report_no_data: 'Rapor göstermek için mahaller ekleyin.',
            settings_title: 'Ayarlar',
            settings_theme_label: 'Tema',
            theme_light: 'Açık',
            theme_dark: 'Koyu',
            ai_agent_title: 'AI Agent',
            ai_agent_groq_key_label: 'Groq API Key',
            ai_agent_connected: 'Bağlı',
            ai_agent_disconnected: 'Bağlı Değil',
            ai_agent_info: 'https://console.groq.com/keys adresinden API key alın',
            btn_save: 'Kaydet',
            error_invalid_api_key: 'API Key geçersiz. "gsk_" ile başlamalıdır.',
            success_api_key_saved: 'API Key başarıyla kaydedildi.',
            home_welcome: 'Hoş Geldiniz',
            home_intro_text: 'GSEM MEP PRO — HVAC sistemi hesaplamaları için entegre tasarım aracı.',
            home_start_guide: 'Başlamak için soldaki sekmelerden bir disiplin modülü seçin:',
            home_module_heating: 'Isitma/Sogutma — Mahal ısı yükü hesaplamaları',
            home_module_ventilation: 'Havalandırma — Hava debisi tasarımı',
            home_module_plumbing: 'Sihhi Tesisat — Su hattı boyutlandırması',
            home_module_fire: 'Yangın Sistemleri — Sprinkler tasarımı',
            ai_assistant_title: 'AI Asistan',
            ai_prompt_placeholder: 'HVAC hakkında soru sor...',
            btn_send: 'Gönder',
            ai_error_empty_prompt: 'Lütfen bir soru girin.',
            ai_error_no_key: 'Lütfen Settings\'de Groq API key girin.',
            ai_loading: 'Yanıt alınıyor...'
        },
        en: {
            app_title: 'GSEM MEP PRO',
            app_name: 'GSEM MEP PRO',
            project_explorer: 'Project Explorer',
            btn_add_room: '+ Add Room',
            module_title: 'Heating/Cooling Module — Room List',
            ribbon_home: 'Home',
            ribbon_heating_cooling: 'Heating/Cooling',
            ribbon_ventilation: 'Ventilation',
            ribbon_plumbing: 'Plumbing',
            ribbon_fire: 'Fire Systems',
            ribbon_reports: 'Reports',
            ribbon_settings: 'Settings',
            ribbon_add_label: 'Add',
            sidebar_project_explorer: 'Project Explorer',
            tree_project: 'Project',
            doc_tab_rooms: 'Rooms',
            content_title_rooms: 'Heating/Cooling Module — Room List',
            table_room_name: 'Room Name',
            table_area: 'Area (m2)',
            table_height: 'Height (m)',
            table_heat_loss: 'Heat Loss (W)',
            table_cooling_load: 'Cooling Load (W)',
            table_status: 'Status',
            panel_summary_title: 'Calculation Summary',
            panel_heating_load: 'Heating Load',
            panel_cooling_load: 'Cooling Load',
            panel_total: 'Total:',
            panel_unit_load: 'Unit Load:',
            panel_room_count: 'Room Count:',
            panel_info: 'Info',
            panel_info_text: 'Start by adding rooms.',
            footer_ready: 'Ready',
            footer_version: 'GSEM MEP PRO v1.0',
            footer_units: 'Units: SI (m, kW)',
            modal_title_add_room: 'Add New Room',
            modal_room_name: 'Room Name',
            modal_area: 'Area (m2)',
            modal_height: 'Ceiling Height (m)',
            modal_ext_temp_winter: 'Ext. Temperature - Winter (°C)',
            modal_int_temp_winter: 'Int. Temperature - Winter (°C)',
            modal_ext_temp_summer: 'Ext. Temperature - Summer (°C)',
            modal_int_temp_summer: 'Int. Temperature - Summer (°C)',
            modal_cancel: 'Cancel',
            modal_add: 'Add',
            modal_fill_fields: 'Please fill all fields.',
            info_add_rooms: 'Start by adding rooms.',
            table_empty: 'No rooms added',
            summary_area: 'Total Area:',
            summary_heating: 'Heat Loss:',
            summary_cooling: 'Cooling Load:',
            summary_rooms: 'Rooms:',
            error_calc_engine_missing: 'hesaplaMahalV5 function not loaded (calc-engine.js missing?).',
            error_calc_failed: 'Error during room calculation (hesaplaMahalV5).',
            error_storage_write: 'localStorage write error.',
            error_storage_read: 'localStorage read error.',
            report_title: 'Project Report',
            report_subtitle: 'Heating/Cooling Calculations',
            report_summary: 'Summary',
            report_total_area: 'Total Area:',
            report_total_heating: 'Total Heat Loss:',
            report_total_cooling: 'Total Cooling Load:',
            report_avg_heating: 'Average Heat (W/m²):',
            report_export: 'Download Report (CSV)',
            report_no_data: 'Add rooms to display report.',
            settings_title: 'Settings',
            settings_theme_label: 'Theme',
            theme_light: 'Light',
            theme_dark: 'Dark',
            ai_agent_title: 'AI Agent',
            ai_agent_groq_key_label: 'Groq API Key',
            ai_agent_connected: 'Connected',
            ai_agent_disconnected: 'Disconnected',
            ai_agent_info: 'Get your API key from https://console.groq.com/keys',
            btn_save: 'Save',
            error_invalid_api_key: 'Invalid API Key. Must start with "gsk_".',
            success_api_key_saved: 'API Key saved successfully.',
            home_welcome: 'Welcome',
            home_intro_text: 'GSEM MEP PRO — Integrated design tool for HVAC system calculations.',
            home_start_guide: 'To get started, select a discipline module from the left:',
            home_module_heating: 'Heating/Cooling — Room heat load calculations',
            home_module_ventilation: 'Ventilation — Air flow design',
            home_module_plumbing: 'Plumbing — Water line sizing',
            home_module_fire: 'Fire Systems — Sprinkler design',
            ai_assistant_title: 'AI Assistant',
            ai_prompt_placeholder: 'Ask a question about HVAC...',
            btn_send: 'Send',
            ai_error_empty_prompt: 'Please enter a question.',
            ai_error_no_key: 'Please configure Groq API key in Settings.',
            ai_loading: 'Fetching response...'
        }
    };

    /**
     * Public API: window.i18n
     */
    window.i18n = {
        lang: 'tr', // Default language
        strings: strings,

        /**
         * setLang(lang): Set current language (tr or en)
         * Persists to localStorage for session recovery
         */
        setLang: function(lang) {
            if (strings[lang]) {
                this.lang = lang;
                localStorage.setItem('i18n_lang', lang);
            } else {
                console.warn(`i18n: Unknown language '${lang}'. Keeping current: '${this.lang}'`);
            }
        },

        /**
         * get(key): Retrieve localized string
         * Fallback: if key missing in current lang, try EN; if not found, return key itself
         */
        get: function(key) {
            if (!key || typeof key !== 'string') return '';

            const currentLangDict = strings[this.lang] || {};
            if (key in currentLangDict) {
                return currentLangDict[key];
            }

            // Fallback to EN
            const enDict = strings.en || {};
            if (key in enDict) {
                return enDict[key];
            }

            // Not found: return key as-is (helps debugging)
            return key;
        },

        /**
         * applyI18n(): Walk DOM and replace text in [data-i18n="key"] elements
         * Supports: textContent for text nodes, title attribute for tooltips
         */
        applyI18n: function() {
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                const value = this.get(key);

                if (value) {
                    // If element has no text, set textContent
                    if (!el.textContent || el.textContent.trim() === '') {
                        el.textContent = value;
                    } else {
                        // Update existing text (common for titles)
                        el.textContent = value;
                    }
                }
            });

            // Apply placeholders
            this.applyI18nPlaceholders();
        },

        /**
         * applyI18nPlaceholders(): Apply i18n to placeholder attributes
         */
        applyI18nPlaceholders: function() {
            const elements = document.querySelectorAll('[data-i18n-placeholder]');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const value = this.get(key);
                if (value) el.placeholder = value;
            });
        }
    };

    /**
     * On DOMContentLoaded: restore saved language & apply i18n
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Restore language from localStorage (if exists)
        const savedLang = localStorage.getItem('i18n_lang');
        if (savedLang && strings[savedLang]) {
            window.i18n.setLang(savedLang);
        }

        // Apply i18n to DOM
        window.i18n.applyI18n();
    });

})();
