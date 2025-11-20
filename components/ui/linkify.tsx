import linkifyHtml from 'linkify-html';

export const linkify = (html: string): string => {
  if (!html) return '';
  return linkifyHtml(html, {
    defaultProtocol: 'https',
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'text-blue-600 underline hover:text-blue-800',
  });
};