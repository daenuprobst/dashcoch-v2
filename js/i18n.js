import {getUserLanguage} from './helpers.js';
import config from './config.js';

export default async function i18n() {
  const translator = new Translator({
    filesLocation: '/i18n',
  });

  let language = getUserLanguage();
  if (!config.availableLanguages.includes(language)) {
    language = 'en';
  }

  if (config.availableLanguages.includes(_dc.s.language)) {
    language = _dc.s.language;
  }

  await translator.fetch(config.availableLanguages);
  return [translator, language];
}
