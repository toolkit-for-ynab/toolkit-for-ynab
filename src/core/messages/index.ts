import type { YNABToolkitObject } from 'toolkit/types/toolkit';
import type { FeatureSetting } from 'toolkit/types/toolkit/features';

export const TOOLKIT_MESSAGE_CHANNEL = 'ynab-toolkit-channel' as const;

type ToolkitMessageEnvelope<TPayload> = TPayload & {
  channel: typeof TOOLKIT_MESSAGE_CHANNEL;
};

export enum InboundMessageType {
  Bootstrap = 'tk-bootstrap',
  SettingChanged = 'tk-setting-changed',
}

export type BootstrapMessage = MessageEvent<
  ToolkitMessageEnvelope<{
    type: InboundMessageType.Bootstrap;
    ynabToolKit: Pick<
      YNABToolkitObject,
      'assets' | 'environment' | 'extensionId' | 'name' | 'options' | 'version'
    >;
  }>
>;

export type SettingChangedMessage = MessageEvent<
  ToolkitMessageEnvelope<{
    type: InboundMessageType.SettingChanged;
    setting: {
      name: FeatureName;
      value: FeatureSetting;
    };
  }>
>;

export type InboundMessage = BootstrapMessage | SettingChangedMessage;

export enum OutboundMessageType {
  ToolkitLoaded = 'tk-loaded',
  ToolkitError = 'ynab-toolkit-error',
}
