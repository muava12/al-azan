import {MessageDescriptor, i18n} from '@lingui/core';
import {defineMessage} from '@lingui/macro';

export enum Prayer {
  Fajr = 'fajr',
  Sunrise = 'sunrise',
  Dhuhr = 'dhuhr',
  Asr = 'asr',
  Sunset = 'sunset',
  Maghrib = 'maghrib',
  Isha = 'isha',
  /** middle of the night */
  Midnight = 'midnight',
}

export const NonPrayer = [Prayer.Sunrise, Prayer.Sunset, Prayer.Midnight];

export const PrayersInOrder = [
  Prayer.Fajr,
  Prayer.Sunrise,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Sunset,
  Prayer.Maghrib,
  Prayer.Isha,
  /** middle of the night */
  Prayer.Midnight,
];

const prayerTranslations = {
  fajr: defineMessage({
    id: 'fajr.prayer',
    message: 'Fajr',
  }),
  sunrise: defineMessage({
    id: 'sunrise',
    message: 'Sunrise',
  }),
  dhuhr: defineMessage({
    id: 'dhuhr.prayer',
    message: 'Dhuhr',
  }),
  asr: defineMessage({
    id: 'asr.prayer',
    message: 'Asr',
  }),
  sunset: defineMessage({
    id: 'sunset',
    message: 'Sunset',
  }),
  maghrib: defineMessage({
    id: 'maghrib.prayer',
    message: 'Maghrib',
  }),
  isha: defineMessage({
    id: 'isha.prayer',
    message: 'Isha',
  }),
  midnight: defineMessage({
    id: 'sunnah.midnight',
    message: 'Midnight',
  }),
} as Record<string, MessageDescriptor>;

export function translatePrayer(prayer: Prayer | String) {
  return i18n._(prayerTranslations[prayer.toLowerCase()]);
}
