const BACK_TARGET_KEY = 'staff_back_target'

export function rememberStaffBackTarget(url) {
  try {
    uni.setStorageSync(BACK_TARGET_KEY, url)
  } catch (e) {
    // Storage is optional in non-browser render environments.
  }
}

export function resolveStaffBackTarget(fallback = '') {
  try {
    return uni.getStorageSync(BACK_TARGET_KEY) || fallback
  } catch (e) {
    return fallback
  }
}
