import { globalConfig as defaultConfig } from '@/config.js'

const GLOBAL_CONFIG_CACHE_KEY = 'globalConfig'
const GLOBAL_CONFIG_FORM_ID = 1

/**
 * 全局配置管理器
 * 负责获取、缓存和管理全局配置
 */
export class GlobalConfigManager {
	constructor() {
		this.config = null
		this.cacheExpireTime = 0
	}

	/**
	 * 获取全局配置（每次都请求 API）
	 * 1. 先返回缓存数据（如果有），保证页面快速渲染
	 * 2. 同时请求 /form?id=1 获取最新配置
	 * 3. 请求成功后更新缓存
	 */
	async fetchGlobalConfig() {
		// 先读取缓存（如果有），立即返回用于页面渲染
		const cached = uni.getStorageSync(GLOBAL_CONFIG_CACHE_KEY)
		if (cached) {
			this.config = cached.data
		}

		// 每次都请求最新配置
		try {
			const res = await new Promise((resolve, reject) => {
				uni.request({
					url: `${defaultConfig.formHost}?id=${GLOBAL_CONFIG_FORM_ID}`,
					method: 'GET',
					success: (res) => resolve(res),
					fail: (err) => reject(err)
				})
			})

			if (res?.data?.code === 200) {
				const data = res.data.data
				const cacheDuration = (data.cachePolicy || defaultConfig.cachePolicy) * 24 * 60 * 60

				this.config = data
				this.cacheExpireTime = Date.now() + cacheDuration * 1000

				// 更新缓存
				uni.setStorageSync(GLOBAL_CONFIG_CACHE_KEY, {
					data: data,
					expireTime: this.cacheExpireTime
				})

				console.log('[全局配置] 获取成功:', data)
				return data
			}
		} catch (error) {
			console.error('[全局配置] 获取失败:', error)
			// 如果有缓存，返回缓存
			if (cached) {
				console.log('[全局配置] 使用缓存配置')
				return cached.data
			}
		}

		// 返回默认配置
		const defaultData = { cachePolicy: defaultConfig.cachePolicy, communities: {} }
		this.config = defaultData
		return defaultData
	}

	/**
	 * 清除全局配置缓存
	 */
	clearCache() {
		try {
			uni.removeStorageSync(GLOBAL_CONFIG_CACHE_KEY)
			this.config = null
		} catch (error) {
			console.error('[全局配置] 清除缓存失败:', error)
		}
	}

	/**
	 * 获取缓存策略（全局配置优先）
	 * @returns {number} 缓存天数
	 */
	getCachePolicy() {
		if (this.config?.cachePolicy !== undefined) {
			return this.config.cachePolicy
		}
		return defaultConfig.cachePolicy
	}

	/**
	 * 获取社区配置
	 * @param {string} communityCode - 社区代码
	 * @returns {object} 社区配置对象
	 */
	getCommunityConfig(communityCode) {
		if (!communityCode) {
			return {}
		}
		const config = this.config?.communities?.[communityCode]
		return config || {}
	}

	/**
	 * 检查是否显示 welcome 弹窗
	 * @param {string} communityCode - 社区代码
	 * @returns {boolean} 是否启用欢迎弹窗
	 */
	isWelcomeEnabled(communityCode) {
		const communityConfig = this.getCommunityConfig(communityCode)
		const welcomeEnabledValue = communityConfig?.home?.welcomeEnabled
		// 支持数字 1 和字符串 "1"
		return welcomeEnabledValue === 1 || welcomeEnabledValue === '1'
	}
}

// 单例
export const globalConfigManager = new GlobalConfigManager()
