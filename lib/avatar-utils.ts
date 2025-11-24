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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://riverflow-server.onrender.com/api";

export function getAvatarUrl(avatarPath: string | undefined | null): string | undefined {
  if (!avatarPath) {
    return undefined;
  }

  // If already a full URL, return as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  // API_BASE_URL always has a sensible default. If env missing, falls back to Render backend.

  // If path starts with /api, remove /api from baseURL and append path
  if (avatarPath.startsWith('/api')) {
    const baseWithoutApi = API_BASE_URL.replace(/\/api$/, '');
    return `${baseWithoutApi}${avatarPath}`;
  }

  // For relative paths, append to baseURL
  // Ensure path starts with /
  const normalizedPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

