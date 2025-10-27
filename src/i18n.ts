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
        profile: enProfile,
        invite: enInvite,
        history: enHistory,
        avatar: enAvatar,
        ranking: enRanking,
        app: enApp,
        actions: enActions,
        market: enMarket,
      },
      zh: {
        translation: zhTranslation,
        detail: zhDetail,
        create: zhCreate,
        redpacket: zhRedPacket,
        profile: zhProfile,
        invite: zhInvite,
        history: zhHistory,
        avatar: zhAvatar,
        ranking: zhRanking,
        app: zhApp,
        actions: zhActions,
        market: zhMarket,
      },
    },
    ns: ['translation', 'detail', 'create', 'redpacket', 'profile', 'invite', 'history', 'avatar', 'ranking', 'app', 'actions', 'market'],
    defaultNS: 'translation',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
