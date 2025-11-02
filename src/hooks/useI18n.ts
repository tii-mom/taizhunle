import { useTranslation, type Namespace, type TFunction } from 'react-i18next';

type UseI18nResult = {
  t: TFunction;
  locale: string;
  changeLanguage: (lang: string) => Promise<TFunction>;
};

export function useI18n(ns?: Namespace): UseI18nResult {
  const { t, i18n } = useTranslation(ns);
  return { t, locale: i18n.language, changeLanguage: i18n.changeLanguage.bind(i18n) };
}
