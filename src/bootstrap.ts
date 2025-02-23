import {i18n} from '@lingui/core';
import {loadLocale} from '@/i18n';
import {settings} from '@/store/settings';

export async function bootstrap() {
  const state = settings.getState();
  try {
    await loadLocale(state['SELECTED_LOCALE']);
  } catch {
    console.warn(
      'could not find any matching file for locale: ' +
        state['SELECTED_LOCALE'],
    );
    i18n.activate('en');
  }
}
