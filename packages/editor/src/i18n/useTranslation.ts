import { useState, useCallback } from 'react';
import en from './en.json';

export type Language = 'en' | 'ru' | 'ja';

// Module-level variable to store current language
// In a real application, this would likely be in a Context or Store
let currentLanguage: Language = 'en';

// Helper to access nested keys safely
function getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export const useTranslation = () => {
    const [language, setLanguage] = useState<Language>(currentLanguage);

    const changeLanguage = useCallback((lang: Language) => {
        currentLanguage = lang;
        setLanguage(lang);
    }, []);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>) => {
            // Placeholder for multi-language support.
            // Currently, we only have 'en' loaded directly.
            // In the future, this would select from a map of loaded languages.
            const translations = en;

            let value = getNestedValue(translations, key);

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
