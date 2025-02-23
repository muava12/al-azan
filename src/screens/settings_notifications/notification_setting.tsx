import {t} from '@lingui/macro';
import {HStack, Text, Checkbox, Stack} from 'native-base';
import {IHStackProps} from 'native-base/lib/typescript/components/primitives/Stack/HStack';
import {Prayer, translatePrayer} from '@/adhan';
import {
  getAdhanSettingKey,
  useCalcSettingsHelper,
} from '@/store/calculation_settings';

type NotificationSettingProps = {
  prayer: Prayer;
};

export function NotificationSetting({
  prayer,
  ...hStackProps
}: NotificationSettingProps & IHStackProps) {
  const [notify, setNotify] = useCalcSettingsHelper(
    getAdhanSettingKey(prayer, 'notify'),
  );
  const [sound, setSound] = useCalcSettingsHelper(
    getAdhanSettingKey(prayer, 'sound'),
  );

  const setSoundProxy = (s: boolean) => {
    if (s) {
      setNotify(s);
    }
    setSound(s);
  };

  const setNotifyProxy = (s: boolean) => {
    if (!s) {
      setSound(false);
    }
    setNotify(s);
  };

  const prayerName = translatePrayer(prayer);

  return (
    <HStack justifyContent="space-between" {...hStackProps}>
      <Text width="1/3">{prayerName}</Text>

      <Stack width="1/3" justifyContent="center" alignItems="center">
        <Checkbox
          value="notify"
          size="md"
          isChecked={!!notify}
          onChange={setNotifyProxy}
          accessibilityLabel={t`${prayerName} notification will be shown`}
        />
      </Stack>

      <Stack width="1/6" justifyContent="center" alignItems="center">
        <Checkbox
          value="sound"
          size="md"
          isChecked={!!sound}
          onChange={setSoundProxy}
          accessibilityLabel={t`${prayerName} sound will be played`}
        />
      </Stack>
    </HStack>
  );
}
