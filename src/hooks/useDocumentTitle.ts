import { useEffect } from 'react';

export const useDocumentTitle = (title: string, overwriteCompletely = false) => {
  useEffect(() => {
    const originalTitle = document.title;
    const newTitle = overwriteCompletely
      ? title
      : [title, ...originalTitle.split(' | ').slice(1)].join(' | ');
    document.title = newTitle;
    return () => {
      document.title = originalTitle;
    };
  }, [title, overwriteCompletely]);
};
