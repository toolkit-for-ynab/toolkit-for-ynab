import React, { ReactNode } from 'react';
import './styles.scss';

export const AdditionalReportSettings = ({ children }: { children: ReactNode }) => {
  return <div className="tk-additional-report-settings">{children}</div>;
};
