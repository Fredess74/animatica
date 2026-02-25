import { useState, useCallback, useEffect } from 'react';
import en from './en.json';
import ru from './ru.json';

export type Language = 'en' | 'ru' | 'ja';

// Module-level variable to store current language
let currentLanguage: Language = 'en';

// Store subscribers to update all components when language changes
const listeners = new Set<(lang: Language) => void>();

// Helper to access nested keys safely
function getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

const translations: Record<string, any> = {
    en,
    ru,
    // TODO: Add 'ja' support when translation file is created
    ja: en
};

export const useTranslation = () => {
    const [language, setLanguage] = useState<Language>(currentLanguage);

    useEffect(() => {
        const listener = (lang: Language) => setLanguage(lang);
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    const changeLanguage = useCallback((lang: Language) => {
        if (currentLanguage !== lang) {
            currentLanguage = lang;
            listeners.forEach((listener) => listener(lang));
        }
    }, []);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>) => {
            const currentTranslations = translations[language] || translations['en'];
            let value = getNestedValue(currentTranslations, key);

            // Fallback to English if translation is missing
            if (value === undefined && language !== 'en') {
                value = getNestedValue(translations['en'], key);
            }

            if (typeof value !== 'string') {
                return key;
            }

            if (params) {
                Object.entries(params).forEach(([paramKey, paramValue]) => {
                    value = value!.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
                });
            }

            return value;
        },
        [language]
    );

    return {
        t,
        i18n: {
            language,
            changeLanguage,
        },
    };
};
