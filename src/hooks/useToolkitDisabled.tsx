import * as React from 'react';
import { localToolkitStorage } from 'toolkit/core/common/storage';

export function useToolkitDisabled() {
  const [isToolkitDisabled, setIsToolkitDisabled] = React.useState(false);

  const handleToolkitDisabledChanged = React.useCallback(
    (_: unknown, isDisabled: boolean) => setIsToolkitDisabled(isDisabled),
    []
  );

  React.useEffect(() => {
    localToolkitStorage.getFeatureSetting('DisableToolkit').then((isToolkitDisabled) => {
      setIsToolkitDisabled(isToolkitDisabled);
    });

    localToolkitStorage.onToolkitDisabledChanged(handleToolkitDisabledChanged);

    return () => localToolkitStorage.offToolkitDisabledChanged(handleToolkitDisabledChanged);
  }, []);

  return isToolkitDisabled;
}
