/**
 * Cookie utility functions
 */

/**
 * Set cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Expiration in days (default: 7)
 */
export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

/**
 * Get cookie value
 * @param name - Cookie name
 * @returns Cookie value or null
 */
export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
};

/**
 * Delete cookie
 * @param name - Cookie name
 */
export const deleteCookie = (name: string): void => {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Clear all cookies
 */
export const clearAllCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    deleteCookie(name);
  }
};

