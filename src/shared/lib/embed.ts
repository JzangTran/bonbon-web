const KEY = 'bonbon.embed'

/**
 * True when the page is shown inside the bonbon app (a web view opened with `?embed=app`, e.g. the help center under the app's own
 * header): the site header and footer are left out. Remembered for the tab, so links inside the web view stay embedded.
 */
export function isEmbedded(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('embed') === 'app') sessionStorage.setItem(KEY, '1')
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return new URLSearchParams(window.location.search).get('embed') === 'app'
  }
}
