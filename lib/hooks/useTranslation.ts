import { useLanguageContext } from '@/lib/context/LanguageContext';
import { translations, TranslationKey } from '@/lib/translations';

export function useTranslation() {
    const { language, setLanguage } = useLanguageContext();

    const t = (key: TranslationKey): string => {
        return translations[language][key] || key;
    };

    return { t, language, setLanguage };
}
