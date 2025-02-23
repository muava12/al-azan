import {t} from '@lingui/macro';
import {HStack, FormControl, IStackProps, Switch, Text} from 'native-base';
import {useSettingsHelper} from '@/store/settings';

export function TimeFormatSettings(props: IStackProps) {
  const [is24Hour, setIs24Hour] = useSettingsHelper('IS_24_HOUR_FORMAT');

  return (
    <HStack {...props}>
      <FormControl fontSize="md">
        <FormControl.Label>{t`Time format`}:</FormControl.Label>
        <HStack justifyContent={'space-between'}>
          <Text>{t`Use 24-Hour format`}</Text>
          <Switch value={is24Hour} onToggle={setIs24Hour} size="lg" />
        </HStack>
      </FormControl>
    </HStack>
  );
}
