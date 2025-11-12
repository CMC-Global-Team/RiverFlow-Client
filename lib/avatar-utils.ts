/**
 * Utility functions for handling avatar URLs
 */

/**
 * Convert avatar URL to absolute URL
 * Handles different URL formats:
 * - Full URL (http/https): returns as-is
 * - Path starting with /api: removes /api from baseURL and appends path
 * - Relative path: appends to baseURL
 */
export function getAvatarUrl(avatarPath: string | undefined | null): string | undefined {
  if (!avatarPath) {
    return undefined;
  }

  // If already a full URL, return as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (!baseURL) {
    console.warn('NEXT_PUBLIC_API_URL is not set');
    return avatarPath;
  }

  // If path starts with /api, remove /api from baseURL and append path
  if (avatarPath.startsWith('/api')) {
    const baseWithoutApi = baseURL.replace(/\/api$/, '');
    return `${baseWithoutApi}${avatarPath}`;
  }

  // For relative paths, append to baseURL
  // Ensure path starts with /
  const normalizedPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  return `${baseURL}${normalizedPath}`;
}

