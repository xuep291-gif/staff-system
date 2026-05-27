import {
	globalConfig
} from '@/config.js'
import _ from 'lodash'
import qs from 'qs'
import commonStore from '@/store/common.js'
export const Base64 = {
	// private property
	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

	// public method for encoding
	,
	encode(input) {
		let output = "";
		let chr1;
		let chr2;
		let chr3;
		let enc1;
		let enc2;
		let enc3;
		let enc4;
		let i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		} // Whend

		return output;
	} // End Function encode


	// public method for decoding
	,
	decode(input) {
		let output = "";
		let chr1;
		let chr2;
		let chr3;
		let enc1;
		let enc2;
		let enc3;
		let enc4;
		let i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output += String.fromCharCode(chr1);

			if (enc3 != 64) {
				output += String.fromCharCode(chr2);
			}

			if (enc4 != 64) {
				output += String.fromCharCode(chr3);
			}

		} // Whend

		output = Base64._utf8_decode(output);

		return output;
	} // End Function decode


	// private method for UTF-8 encoding
	,
	_utf8_encode(string) {
		let utftext = "";
		string = string.replace(/\r\n/g, "\n");

		for (let n = 0; n < string.length; n++) {
			const c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		} // Next n

		return utftext;
	} // End Function _utf8_encode

	// private method for UTF-8 decoding
	,
	_utf8_decode(utftext) {
		let string = "";
		let i = 0;
		let c;
		let c1;
		let c2;
		let c3;
		c = c1 = c2 = 0;

		while (i < utftext.length) {
			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		} // Whend

		return string;
	}
}
//生成随机 GUID 数
export const guid = () => {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
// 设置缓存 获取缓存
export const cache = (key, value, seconds = 3600 * 12) => {
	let nowTime = Date.parse(new Date()) / 1000;

	if (key && value) {

		let expire = nowTime + Number(seconds);

		//判断缓存是否已存在
		const getCurrentValue = uni.getStorageSync(key)
		if (getCurrentValue) {
			let temp = getCurrentValue.indexOf('_|_') != -1 ? getCurrentValue.split('_|_') : getCurrentValue
			if (!temp[1] || temp[1] <= nowTime) {
				uni.removeStorageSync(key)
			} else {
				expire = Number(temp[1])
			}
		}

		uni.setStorageSync(key, JSON.stringify(value) + '_|_' + expire)
		console.log('已经把' + key + '存入缓存,过期时间为' + expire)
	} else if (key && !value) {
		let val = uni.getStorageSync(key);
		if (val) {
			// 缓存存在，判断是否过期
			let temp = val.indexOf('_|_') != -1 ? val.split('_|_') : val
			if (Array.isArray(temp)) {
				if (!temp[1] || Number(temp[1]) <= nowTime) {
					uni.removeStorageSync(key)
					console.log(key + '缓存已失效')
					return '';
				} else {
					return JSON.parse(temp[0]);
				}
			} else {
				return temp
			}
		}
	}
}

export const cacheMap = {
	get(key) {
		return uni.getStorageSync(key)
	},
	set(key, value) {
		uni.setStorageSync(key, value)
	},
	remove(key) {
		uni.removeStorageSync(key)
	},
	clear() {
		uni.clearStorageSync()
	}
}

// 获取默认登录用户信息
export async function getDefaultUser() {
	let userMessage = await new Promise((resolve, reject) => {
		uni.request({
			url: `${globalConfig.formHost}?id=2`,
			method: "GET",
			success(res) {
				let User = JSON.parse(Base64.decode(res.data.data.defaultUser))
				resolve(User)
			}
		})
	})
	return userMessage
}
// 登录默认用户
export async function LoginDefault() {
	let user = await getDefaultUser()
	uni.request({
		url: `${globalConfig.loginEP}/api/sys/oauth/app/login`,
		data: user,
		method: "POST",
		success(res) {
			let token;
			token = res.data.encryptedData
			uni.setStorageSync(globalConfig.tokenStorageKey, token)
			// console.log("设置token成功!")
		}
	})
}

export function login() {
	let auth;
	let authCache = cache("auth")
	if (authCache != null && authCache != undefined && authCache != "") {
		auth = authCache
		// console.log(auth)
	} else {
		uni.login({
			success(res) {
				auth = res.code
				cache("auth", auth, 5 * 60) //设置登录许可为5*60
			},
			fail(err) {
				uni.showModal({
					title: "登录失败",
					showCancel: false,
					confirmColor: "#FC1944",
					success() {
						uni.navigateBack({
							delta: 10
						})
					}
				})
			}
		})
	}
	return auth
}
// 获取用户信息
export function getUserProfile() {
	let iv;
	let encryptedData;
	let rawData;
	let userProfile;
	let profile = cache("profile")
	let that = this
	if (profile != null && profile.iv != null) {
		userProfile = profile
	} else {
		uni.showModal({
			title: "申请",
			content: "正在请求您的个人信息",
			success(User) {
				uni.showLoading({
					title: "正在请求中",
					mask: true
				})
				if (User.confirm) {
					uni.getUserProfile({
						desc: "获取您的昵称、头像、地区及性别",
						success(userProfile) {
							uni.hideLoading()
							iv = userProfile.iv
							encryptedData = userProfile.encryptedData
							let newRawData;
							let jsonRaw = JSON.parse(userProfile.rawData)
							for (let i in jsonRaw) {
								if (i === "nickName") {
									jsonRaw.nickname = jsonRaw.nickName
									delete jsonRaw["nickName"]
								}
							}
							newRawData = JSON.stringify(jsonRaw)
							rawData = newRawData
							let newProfile = {
								"iv": iv,
								"encryptedData": encryptedData,
								"rawData": newRawData
							}
							// console.log(JSON.stringify(newProfile), " ==== newProfile")
							// userProfile = newProfile
							cache("profile", newProfile, 5 * 60) //设置缓存为五分钟
							// that.$reload()
							reload()
						},
						fail(err) {
							uni.hideLoading()
							uni.showToast({
								title: "授权超时！",
								icon: 'none'
							})
							setTimeout(() => {
								return getUserProfile()
							}, 1000)
						}
					})
				} else {
					uni.hideLoading()
					uni.showToast({
						title: "授权超时！",
						icon: 'none'
					})
					setTimeout(() => {
						return getUserProfile()
					}, 1000)
				}
			}
		})
		userProfile = cache("profile")
		if (userProfile != null && userProfile.iv != null) {
			uni.showToast({
				title: "授权超时！",
				icon: 'none'
			})
			setTimeout(() => {
				return getUserProfile()
			}, 1000)
		}
	}
	return userProfile
}
// 重新加载当前页面 (带onload参数)
export function reload() {
	let pages = getCurrentPages()
	let nowPage = pages[pages.length - 1];
	uni.redirectTo({
		url: nowPage.$page.fullPath
	})
}

//订单状态
export const orderStatus = {
	"CREATED_PAY_PENDING": "待支付",
	"CLOSED_PAY_TIMEOUT": "支付超时关闭",
	"CLOSED_CANCELED": "已取消",
	"PAID_CONFIRM_PENDING": "已支付",
	"CONFIRMED_DELIVER_PENDING": "待发货",
	"DELIVERING": "发货中",
	"DELIVERED_CONFIRM_PENDING": "已发货",
	"CANCELED_RETURN_PENDING": "待退货",
	"CLOSED_CONFIRMED": "已确认收货",
	"CANCELED_REFUND_PENDING": "待退款",
	"CLOSED_REFUNDED": "已退款",
	"CONFIRMED_PICK_PENDING": "待取货"
}


// 处理图片数据
export function handleImgUrl(value) {
	if (value && value !== '[]') {
		let imgData = ''
		if (value.indexOf('[') != -1) {
			imgData = JSON.parse(value)[0]
			if (imgData.url) {
				imgData = imgData.url.indexOf('http') != -1 ? imgData.url : `${globalConfig.endpoint}${imgData.url}`
			} else {
				imgData = imgData.indexOf('http') != -1 ? imgData : `${globalConfig.endpoint}${imgData}`
			}
		} else {
			imgData = value.indexOf('http') != -1 ? value : `${globalConfig.endpoint}${value}`
		}
		return imgData
	} else {
		return ''
	}
}

export function updateTabbar(data = {}) {
	if (!data.type) {
		return
	}
	// 首页/房屋/方案／我的
	// 首页/租房/关注/我的
	try {

		uni.setTabBarItem({
			index: 1,
			// text: data.type === 3 ? '房屋' : '租房',
			text: data.type === 3 ? '房屋' : '房屋',
			// pagePath: data.type === 3 ? 'pages/sub/productCategroy/index' : 'pages/sub/rentHouse/index',
			pagePath: data.type === 3 ? 'pages/sub/productCategroy/index' : 'pages/sub/productCategroy/index',
			complete: (res) => {
				// console.log('tab2', res)
			}
		})
		// uni.setTabBarItem({
		// 	index: 2,
		// 	text: data.type === 3 ? '方案' : '关注',
		// 	pagePath: 'pages/messagManage/messagManage',
		// 	complete: (res) => {
		// 		console.log('tab1', res)
		// 	}
		// })
	} catch { }
}

//
// 公共上传方法
export const upload = async (url, file, headerConfig) => {
	uni.showLoading({
		title: '',
		mask: true
	})
	const hc = headerConfig ? headerConfig : {}
	let res = await new Promise(resolve => {
		let token = uni.getStorageSync(`${globalConfig.tokenStorageKey}`)
		// console.log("开始上传",globalConfig.endpoint+url)
		// console.log("文件",file)
		uni.uploadFile({
			url: globalConfig.endpoint + url,
			header: {
				Authorization: `Bearer ${token}`,
				...hc
			},
			filePath: file,
			name: "file",
			complete(webPath) {
				uni.hideLoading()
				// console.log("WEBPATH",webPath)
				let webData = webPath.data
				if (typeof webData === "string") {
					webData = JSON.parse(webPath.data)
				}
				// console.log(webData)
				if (webData.code) {
					if (webData.code == 200) {
						let fileWebPath = webData.data.url
						// console.log("上传成功",fileWebPath)
						resolve(fileWebPath)
					} else {
						uni.showToast({
							icon: "error",
							title: "上传失败"
						})
						resolve(`data:image/png;base64,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`)
					}
				} else {
					uni.showToast({
						icon: "error",
						title: "网络错误"
					})
					resolve(`data:image/png;base64,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`)
				}
			}
		})
	})
	return res
}


export function setRedirectPage() {
	try {
		const pages = getCurrentPages()
		if (pages && pages.length > 0) {
			const page = pages[pages.length - 1]
			// 兼容不同平台的 fullPath 获取
			const currentPage = page ? (_.get(page, '$page.fullPath') || _.get(page, 'route') || _.get(page, '__route__')) : ''
			if (currentPage) {
				const fullPath = currentPage.startsWith('/') ? currentPage : '/' + currentPage
				uni.setStorageSync('loginRedirectPage', fullPath)
			}
		}
	} catch (e) {
		console.error('setRedirectPage error:', e)
	}
}

// 统一处理分享
export function shareLoginJump(query) {
	const queryData = {
		isHandleCommunity: true,  // 是否处理带有社区/小区的分享信息
		isSetRedirectPage: true,  // 是否设置重定向页面
		...query || {}
	}
	const userInfo = cache('userInfo') || {}
	const inviteData = uni.getStorageSync('inviteData') || {}
	// console.log('share inviteData', query, userInfo, queryData, inviteData)
	if (queryData.isSetRedirectPage) {
		setRedirectPage()
	}
	// 分享进来，跳转到社区选择
	if (!_.get(userInfo, 'userId')) {
		if (inviteData.inviteCode && !inviteData.isInvited) {
			commonStore.commit('updateState', {
				isShareIn: true,
				communityData: {}
			})
			uni.removeStorageSync('token')
			uni.removeStorageSync('communityData')
			// 携带了社区/小区数据
			if (queryData.isHandleCommunity && inviteData && inviteData.communityId && inviteData.orgId) {
				uni.redirectTo({
					url: '/pages/login/index'
				})
			} else {
				uni.redirectTo({
					url: '/pages/sub/choicePage/communityType'
				})
			}
		} else {
			uni.redirectTo({
				url: '/pages/login/index'
			})
		}
		return false
	} else {
		if (inviteData.isChangeCommunity) {
			uni.removeStorageSync("userInfo")
			uni.redirectTo({
				url: '/pages/login/index'
			})
			return false
		}
		uni.removeStorageSync('loginRedirectPage')
		return true
	}
}

export function parsePageQuery(params) {
	if (_.isEmpty(params) || !_.isPlainObject(params)) {
		return {}
	}
	for (const key in params) {
		const value = params[key]
		if (_.isString(value)) {
			params[key] = decodeURIComponent(value)
		}
	}
	return params
}

// 移除时间字符串中的秒数部分
// 例如: "2024-01-01 12:30:45" -> "2024-01-01 12:30"
export function removeSeconds(timeString) {
	if (!timeString) {
		return ''
	}

	// 如果时间字符串包含秒数（格式：HH:MM:SS），则移除秒数部分
	if (typeof timeString === 'string') {
		// 匹配 "YYYY-MM-DD HH:MM:SS" 格式并移除秒数
		return timeString.replace(/(\d{2}:\d{2}):\d{2}/, '$1')
	}

	return timeString
}

// 获取或格式化日期
// 支持多种输入格式，返回格式化的日期字符串
export function getDate(date, format = 'YYYY-MM-DD') {
	if (!date) {
		return ''
	}

	let dateObj

	// 如果是字符串，尝试解析
	if (typeof date === 'string') {
		dateObj = new Date(date)
	} else if (date instanceof Date) {
		dateObj = date
	} else if (typeof date === 'number') {
		dateObj = new Date(date)
	} else {
		return ''
	}

	// 检查日期是否有效
	if (isNaN(dateObj.getTime())) {
		return ''
	}

	const year = dateObj.getFullYear()
	const month = String(dateObj.getMonth() + 1).padStart(2, '0')
	const day = String(dateObj.getDate()).padStart(2, '0')
	const hours = String(dateObj.getHours()).padStart(2, '0')
	const minutes = String(dateObj.getMinutes()).padStart(2, '0')
	const seconds = String(dateObj.getSeconds()).padStart(2, '0')

	// 根据格式返回
	return format
		.replace('YYYY', year)
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hours)
		.replace('mm', minutes)
		.replace('ss', seconds)
}

/**
 * 清理过期的页面缓存
 * 使用异步方式执行，避免阻塞主线程
 * @returns {Promise<{cleaned: number, total: number}>} 返回清理结果
 */
export async function cleanExpiredPageCache() {
	return new Promise((resolve) => {
		// 使用 setTimeout 模拟子线程/异步执行
		setTimeout(() => {
			try {
				const nowTime = Date.parse(new Date()) / 1000
				const pageCacheList = uni.getStorageSync('pageCacheList') || []
				let cleanedCount = 0
				const validCacheList = []

				console.log('[cleanExpiredPageCache] 开始检查缓存', {
					total: pageCacheList.length,
					nowTime
				})

				pageCacheList.forEach(cacheKey => {
					try {
						const cachedValue = uni.getStorageSync(cacheKey)
						if (cachedValue) {
							// 检查缓存格式和过期时间
							if (typeof cachedValue === 'string' && cachedValue.includes('_|_')) {
								const parts = cachedValue.split('_|_')
								if (parts.length >= 2) {
									const expireTime = Number(parts[1])
									if (!isNaN(expireTime) && expireTime <= nowTime) {
										// 缓存已过期，删除
										uni.removeStorageSync(cacheKey)
										cleanedCount++
										console.log(`[cleanExpiredPageCache] 删除过期缓存: ${cacheKey}, 过期时间: ${expireTime}, 当前时间: ${nowTime}`)
									} else {
										// 缓存未过期，保留
										validCacheList.push(cacheKey)
									}
								}
							}
						} else {
							// 缓存不存在，从列表中移除
							console.log(`[cleanExpiredPageCache] 缓存不存在: ${cacheKey}`)
						}
					} catch (err) {
						console.error(`[cleanExpiredPageCache] 处理缓存失败: ${cacheKey}`, err)
					}
				})

				// 更新缓存列表
				uni.setStorageSync('pageCacheList', validCacheList)

				const result = {
					cleaned: cleanedCount,
					total: pageCacheList.length,
					remaining: validCacheList.length
				}

				console.log('[cleanExpiredPageCache] 清理完成', result)
				resolve(result)
			} catch (err) {
				console.error('[cleanExpiredPageCache] 清理过程出错', err)
				resolve({ cleaned: 0, total: 0, remaining: 0, error: err.message })
			}
		}, 0) // 立即异步执行
	})
}

/**
 * 复制URL到剪贴板
 * 支持 H5/Web 和小程序平台
 * @param {string} url 要复制的URL
 * @returns {Promise<boolean>} 复制是否成功
 */
export function copyUrlToClipboard(url) {
	return new Promise((resolve) => {
		// #ifdef H5
		// H5环境使用 Clipboard API 或 execCommand
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(url)
				.then(() => {
					uni.showToast({
						title: '链接已复制',
						icon: 'success',
						duration: 2000
					})
					resolve(true)
				})
				.catch((err) => {
					console.error('复制失败:', err)
					// 降级到 execCommand
					fallbackCopyTextToClipboard(url, resolve)
				})
		} else {
			// 使用 execCommand 作为降级方案
			fallbackCopyTextToClipboard(url, resolve)
		}
		// #endif
		
		// #ifndef H5
		// 小程序环境使用 uni.setClipboardData
		uni.setClipboardData({
			data: url,
			success: () => {
				uni.showToast({
					title: '链接已复制',
					icon: 'success',
					duration: 2000
				})
				resolve(true)
			},
			fail: (err) => {
				console.error('复制失败:', err)
				uni.showToast({
					title: '复制失败',
					icon: 'none',
					duration: 2000
				})
				resolve(false)
			}
		})
		// #endif
	})
}

/**
 * H5降级复制方法（使用 execCommand）
 * @param {string} text 要复制的文本
 * @param {Function} resolve Promise resolve 回调
 */
function fallbackCopyTextToClipboard(text, resolve) {
	// #ifdef H5
	const textArea = document.createElement('textarea')
	textArea.value = text
	textArea.style.position = 'fixed'
	textArea.style.top = '0'
	textArea.style.left = '0'
	textArea.style.opacity = '0'
	document.body.appendChild(textArea)
	textArea.focus()
	textArea.select()
	
	try {
		const successful = document.execCommand('copy')
		if (successful) {
			uni.showToast({
				title: '链接已复制',
				icon: 'success',
				duration: 2000
			})
			resolve(true)
		} else {
			uni.showToast({
				title: '复制失败',
				icon: 'none',
				duration: 2000
			})
			resolve(false)
		}
	} catch (err) {
		console.error('execCommand 复制失败:', err)
		uni.showToast({
			title: '复制失败',
			icon: 'none',
			duration: 2000
		})
		resolve(false)
	}
	
	document.body.removeChild(textArea)
	// #endif
}
