import React from 'react';

export const WarningMessage = ({ message }: { message: string }) => {
  return <div className="tk-flex tk-justify-content-center tk-align-items-center">{message}</div>;
};
