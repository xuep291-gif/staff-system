/**
 * 平台检测工具模块
 * 提供统一的平台检测和跨平台兼容方法
 */

/**
 * 判断是否为H5环境
 * @returns {boolean}
 */
export function isH5() {
	// #ifdef H5
	return true
	// #endif
	// #ifndef H5
	return false
	// #endif
}

/**
 * 判断是否为微信小程序环境
 * @returns {boolean}
 */
export function isMPWeixin() {
	// #ifdef MP-WEIXIN
	return true
	// #endif
	// #ifndef MP-WEIXIN
	return false
	// #endif
}

/**
 * 判断是否为App环境
 * @returns {boolean}
 */
export function isApp() {
	// #ifdef APP-PLUS
	return true
	// #endif
	// #ifndef APP-PLUS
	return false
	// #endif
}

/**
 * 获取当前平台标识
 * @returns {string} 平台标识: 'H5', 'MP-WEIXIN', 'APP', 'UNKNOWN'
 */
export function getPlatform() {
	// #ifdef H5
	return 'H5'
	// #endif
	// #ifdef MP-WEIXIN
	return 'MP-WEIXIN'
	// #endif
	// #ifdef APP-PLUS
	return 'APP'
	// #endif
	return 'UNKNOWN'
}

/**
 * 获取URL参数
 * H5环境使用URLSearchParams，小程序使用uni.getLaunchOptionsSync
 * @returns {Object|URLSearchParams} H5返回URLSearchParams对象，其他环境返回Object
 */
export function getUrlParams() {
	// #ifdef H5
	return new URLSearchParams(window.location.search)
	// #endif
	// #ifndef H5
	const options = uni.getLaunchOptionsSync()
	return options.query || {}
	// #endif
}

/**
 * 获取指定URL参数值
 * @param {string} name 参数名
 * @returns {string|null} 参数值
 */
export function getUrlParam(name) {
	const params = getUrlParams()
	// #ifdef H5
	return params.get(name)
	// #endif
	// #ifndef H5
	return params[name] || null
	// #endif
}

/**
 * 页面重载/刷新
 * H5环境使用location.reload()，小程序使用uni.reLaunch跳转到登录页
 * @param {string} url 重载后跳转的URL（小程序环境使用，默认为登录页）
 */
export function reloadPage(url = '/pages/login/index') {
	// #ifdef H5
	location.reload()
	// #endif
	// #ifdef MP-WEIXIN
	uni.reLaunch({ url })
	// #endif
	// #ifndef H5
	// #ifndef MP-WEIXIN
	// 其他App平台使用reLaunch
	uni.reLaunch({ url })
	// #endif
	// #endif
}

/**
 * 显示Toast提示
 * 统一的Toast提示方法
 * @param {string} title 提示内容
 * @param {string} icon 图标类型 success/error/loading/none
 * @param {number} duration 持续时间（毫秒）
 */
export function showToast(title, icon = 'none', duration = 2000) {
	uni.showToast({
		title,
		icon,
		duration
	})
}

/**
 * 清除登录状态
 * 清除存储的用户信息和缓存
 */
export function clearAuthState() {
	try {
		uni.removeStorageSync('userInfo')
		uni.removeStorageSync('token')
		// 清除其他可能的用户相关缓存
		const keys = ['userId', 'userProfile', 'authToken']
		keys.forEach(key => {
			uni.removeStorageSync(key)
		})
	} catch (e) {
		console.error('[platform] 清除认证状态失败', e)
	}
}

/**
 * Base64编码
 * 跨平台的Base64编码方法
 * @param {string} str 需要编码的字符串
 * @returns {string} Base64编码后的字符串
 */
export function base64Encode(str) {
	// #ifdef H5
	return btoa(str)
	// #endif
	// #ifndef H5
	// 小程序环境手动实现Base64编码
	const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
	let result = ''
	let i = 0

	do {
		const a = str.charCodeAt(i++)
		const b = str.charCodeAt(i++)
		const c = str.charCodeAt(i++)

		const a2 = a >> 2
		const b2 = ((a & 3) << 4) | (b >> 4)
		const c2 = ((b & 15) << 2) | (c >> 6)
		const d2 = c & 63

		if (isNaN(b)) {
			result += base64Chars.charAt(a2) + base64Chars.charAt(b2) + '=='
		} else if (isNaN(c)) {
			result += base64Chars.charAt(a2) + base64Chars.charAt(b2) + base64Chars.charAt(c2) + '='
		} else {
			result += base64Chars.charAt(a2) + base64Chars.charAt(b2) + base64Chars.charAt(c2) + base64Chars.charAt(d2)
		}
	} while (i < str.length)

	return result
	// #endif
}

/**
 * 获取系统信息
 * @returns {Object} 系统信息对象
 */
export function getSystemInfo() {
	try {
		return uni.getSystemInfoSync()
	} catch (e) {
		console.error('[platform] 获取系统信息失败', e)
		return {}
	}
}

/**
 * 获取状态栏高度
 * @returns {number} 状态栏高度（px）
 */
export function getStatusBarHeight() {
	const systemInfo = getSystemInfo()
	return systemInfo.statusBarHeight || 0
}

/**
 * 获取安全区域
 * @returns {Object} 安全区域信息 {top, bottom, left, right}
 */
export function getSafeArea() {
	const systemInfo = getSystemInfo()
	return systemInfo.safeArea || { top: 0, bottom: 0, left: 0, right: 0 }
}
