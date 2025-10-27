module.exports = {
  input: ['src/**/*.{ts,tsx}', '!**/node_modules/**'],
  options: {
    lngs: ['en', 'zh'],
    defaultLng: 'en',
    defaultNs: 'translation',
    resource: {
      loadPath: 'src/locales/{{lng}}/{{ns}}.json',
      savePath: 'src/locales/{{lng}}/{{ns}}.json'
    },
    ns: ['translation', 'detail', 'create', 'redpacket', 'profile', 'invite', 'history', 'avatar', 'ranking', 'app', 'actions', 'market'],
    keySeparator: '.',
    nsSeparator: ':',
    sort: true
  }
};
