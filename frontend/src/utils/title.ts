/**
 * Utility functions for managing page titles
 */

const BASE_TITLE = 'Zero to Hundred'

/**
 * Sets the page title with an optional route-specific title
 * @param pageTitle - The route-specific title to append
 */
export function setPageTitle(pageTitle?: string): void {
  if (pageTitle) {
    document.title = `${pageTitle} | ${BASE_TITLE}`
  } else {
    document.title = BASE_TITLE
  }
}

/**
 * Get a formatted title with the base title
 * @param pageTitle - The route-specific title to append
 * @returns The formatted title
 */
export function getPageTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE
} 