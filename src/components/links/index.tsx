import * as React from 'react';

export const DiscordLink = ({ children }: { children: React.ReactNode }) => (
  <a target="_blank" rel="noreferrer noopener" href="https://discord.gg/jFKzZR2">
    {children}
  </a>
);

export const GitHubLink = ({ children }: { children: React.ReactNode }) => (
  <a
    target="_blank"
    rel="noreferrer noopener"
    href="https://github.com/toolkit-for-ynab/toolkit-for-ynab/issues"
  >
    {children}
  </a>
);
