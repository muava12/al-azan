import {t} from '@lingui/macro';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
} from '@notifee/react-native';
import {ToastAndroid} from 'react-native';
import {getPrayerTimes} from '@/adhan';
import {
  REMINDER_CHANNEL_ID,
  REMINDER_CHANNEL_NAME,
} from '@/constants/notification';
import {hasAtLeastOneNotificationSetting} from '@/store/calculation_settings';
import {Reminder} from '@/store/settings';
import {getNextDayBeginning, getTime} from '@/utils/date';

type SetReminderOptions = {
  date?: Date;
  noToast?: boolean;
  reminders: Array<Reminder>;
};

export async function setReminders(options: SetReminderOptions) {
  const notificationSettingsIsValid = hasAtLeastOneNotificationSetting();

  if (!notificationSettingsIsValid) return;

  if (!options?.reminders) return;

  let targetDate = options?.date || new Date();
  let prayerTimes = getPrayerTimes(targetDate);
  let tomorrowPrayerTimes = getPrayerTimes(getNextDayBeginning(targetDate));

  if (!prayerTimes || !tomorrowPrayerTimes) return;

  const channelId = await notifee.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: REMINDER_CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  });

  await notifee
    .cancelTriggerNotifications(options.reminders.map(r => r.id))
    .catch(console.error);

  for (const reminder of options.reminders.filter(r => r.enabled)) {
    let pTime = prayerTimes[reminder.prayer].getTime();
    if (pTime < Date.now()) {
      pTime = tomorrowPrayerTimes[reminder.prayer].getTime();
    }

    const timestamp = pTime + reminder.duration * reminder.durationModifier;

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee
      .createTriggerNotification(
        {
          id: reminder.id,
          title: t`Reminder`,
          body: reminder.label || '',
          android: {
            smallIcon: 'ic_stat_name',
            channelId,
            category: AndroidCategory.ALARM,
            importance: AndroidImportance.HIGH,
            autoCancel: false,
          },
        },
        trigger,
      )
      .catch(console.error);

    if (!options?.noToast) {
      const time24Format = getTime(new Date(timestamp));

      ToastAndroid.show(
        t`Reminder` +
          ': ' +
          time24Format +
          (new Date(timestamp).getDay() !== new Date().getDay()
            ? ' ' + t`Tomorrow`
            : ''),
        ToastAndroid.SHORT,
      );
    }
  }

  return Promise.resolve();
}
