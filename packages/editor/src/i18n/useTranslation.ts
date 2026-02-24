import { useState, useCallback, useEffect } from 'react';
import en from './en.json';
import ru from './ru.json';
import ja from './ja.json';

export type Language = 'en' | 'ru' | 'ja';

const translations: Record<Language, any> = {
    en,
    ru,
    ja
};

// Module-level variable to store current language
let currentLanguage: Language = 'en';

// Event listeners to sync language across all hook instances
const listeners = new Set<(lang: Language) => void>();

const setGlobalLanguage = (lang: Language) => {
    currentLanguage = lang;
    listeners.forEach((listener) => listener(lang));
};

// Helper to access nested keys safely
function getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export const useTranslation = () => {
    const [language, setLanguage] = useState<Language>(currentLanguage);

    useEffect(() => {
        const handler = (lang: Language) => setLanguage(lang);
        listeners.add(handler);
        return () => {
            listeners.delete(handler);
        };
    }, []);

    const changeLanguage = useCallback((lang: Language) => {
        setGlobalLanguage(lang);
    }, []);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>) => {
            const currentTranslations = translations[language];
            let value = getNestedValue(currentTranslations, key);

            // Fallback to English if translation is missing
            if (value === undefined && language !== 'en') {
                value = getNestedValue(translations['en'], key);
            }

            if (typeof value !== 'string') {
                // If the key is missing or points to an object, return the key
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
