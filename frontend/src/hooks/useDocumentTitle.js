import { useEffect } from 'react';
import { siteConfig } from '../config/site.js';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  }, [title]);
}
