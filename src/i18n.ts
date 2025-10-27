import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enApp from './locales/en/app.json';
import zhApp from './locales/zh/app.json';
import enActions from './locales/en/actions.json';
import zhActions from './locales/zh/actions.json';
import enMarket from './locales/en/market.json';
import zhMarket from './locales/zh/market.json';
import enDetail from './locales/en/detail.json';
import zhDetail from './locales/zh/detail.json';
import enCreate from './locales/en/create.json';
import zhCreate from './locales/zh/create.json';
import enRedPacket from './locales/en/redpacket.json';
import zhRedPacket from './locales/zh/redpacket.json';
import enAssets from './locales/en/assets.json';
import zhAssets from './locales/zh/assets.json';
import enProfile from './locales/en/profile.json';
import zhProfile from './locales/zh/profile.json';
import enInvite from './locales/en/invite.json';
import zhInvite from './locales/zh/invite.json';
import enHistory from './locales/en/history.json';
import zhHistory from './locales/zh/history.json';
import enAvatar from './locales/en/avatar.json';
import zhAvatar from './locales/zh/avatar.json';
import enRanking from './locales/en/ranking.json';
import zhRanking from './locales/zh/ranking.json';
import enTranslation from './locales/en/translation.json';
import zhTranslation from './locales/zh/translation.json';
import enTheme from './locales/en/theme.json';
import zhTheme from './locales/zh/theme.json';
import enNav from './locales/en/nav.json';
import zhNav from './locales/zh/nav.json';
import enForm from './locales/en/form.json';
import zhForm from './locales/zh/form.json';
import enCommon from './locales/en/common.json';
import zhCommon from './locales/zh/common.json';
import enBrand from './locales/en/brand.json';
import zhBrand from './locales/zh/brand.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
        detail: enDetail,
        create: enCreate,
        redpacket: enRedPacket,
        assets: enAssets,
        profile: enProfile,
        invite: enInvite,
        history: enHistory,
        avatar: enAvatar,
        ranking: enRanking,
        app: enApp,
        actions: enActions,
        market: enMarket,
        theme: enTheme,
        nav: enNav,
        form: enForm,
        common: enCommon,
        brand: enBrand,
      },
      zh: {
        translation: zhTranslation,
        detail: zhDetail,
        create: zhCreate,
        redpacket: zhRedPacket,
        assets: zhAssets,
        profile: zhProfile,
        invite: zhInvite,
        history: zhHistory,
        avatar: zhAvatar,
        ranking: zhRanking,
        app: zhApp,
        actions: zhActions,
        market: zhMarket,
        theme: zhTheme,
        nav: zhNav,
        form: zhForm,
        common: zhCommon,
        brand: zhBrand,
      },
    },
    ns: ['translation', 'detail', 'create', 'redpacket', 'assets', 'profile', 'invite', 'history', 'avatar', 'ranking', 'app', 'actions', 'market', 'theme', 'nav', 'form', 'common', 'brand'],
    defaultNS: 'translation',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
