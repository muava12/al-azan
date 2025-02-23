import {MessageDescriptor, i18n} from '@lingui/core';
import {defineMessage} from '@lingui/macro';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  FullscreenAlarm: {options: string};
  DisplaySettings: undefined;
  LocationSettings: undefined;
  NotificationSettings: undefined;
  AdhanSettings: undefined;
  CalculationSettings: undefined;
  BatteryOptimizationSettings: undefined;
  WidgetSettings: undefined;
  RemindersSettings: undefined;
  AboutSettings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const routeTranslations = {
  Home: defineMessage({
    id: 'home',
    message: 'Home',
  }),
  Settings: defineMessage({
    id: 'settings',
    message: 'Settings',
  }),
  FullscreenAlarm: defineMessage({
    id: 'fullscreen_alarm',
    message: 'Playing Adhan',
    comment: 'screen title',
  }),
  DisplaySettings: defineMessage({
    id: 'display_settings',
    message: 'Display',
    comment: 'screen title',
  }),
  LocationSettings: defineMessage({
    id: 'location_settings',
    message: 'Location',
    comment: 'screen title',
  }),
  NotificationSettings: defineMessage({
    id: 'notification_settings',
    message: 'Notification & Sound',
    comment: 'screen title',
  }),
  AdhanSettings: defineMessage({
    id: 'adhan_settings',
    message: 'Adhan',
    comment: 'screen title',
  }),
  CalculationSettings: defineMessage({
    id: 'calculation_settings',
    message: 'Calculation',
    comment: 'screen title',
  }),
  BatteryOptimizationSettings: defineMessage({
    id: 'battery_optimization_settings',
    message: 'Battery Optimization',
    comment: 'screen title',
  }),
  WidgetSettings: defineMessage({
    id: 'widget_settings',
    message: 'Widget Settings',
    comment: 'screen title',
  }),
  RemindersSettings: defineMessage({
    id: 'reminders_settings',
    message: 'Reminders',
    comment: 'screen title',
  }),
  AboutSettings: defineMessage({
    id: 'about_settings',
    message: 'About',
    comment: 'screen title',
  }),
} as Record<string, MessageDescriptor>;

export function translateRoute(name: string) {
  return i18n._(routeTranslations[name]);
}
