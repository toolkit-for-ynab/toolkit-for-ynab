import { YNABToolkit } from 'toolkit/types/window';

export enum InboundMessageType {
  Bootstrap = 'tk-bootstrap',
  SettingChanged = 'tk-setting-changed',
}

export type BootstrapMessage = MessageEvent<{
  type: InboundMessageType.Bootstrap;
  ynabToolKit: YNABToolkit;
}>;

export type SettingChangedMessage = MessageEvent<{
  type: InboundMessageType.SettingChanged;
  setting: {
    name: string;
    value: FeatureSetting;
  };
}>;

export type InboundMessage = BootstrapMessage | SettingChangedMessage;

export enum OutboundMessageType {
  ToolkitLoaded = 'tk-loaded',
}
