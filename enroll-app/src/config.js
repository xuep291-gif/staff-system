// 是否是开发环境
// 开发环境中的api需要在manifest.json中的源码视图>h5>devServer>proxy中添加路径即可

const staffApiEndpoint = import.meta.env.VITE_STAFF_API_BASE_URL ?? 'http://localhost:3100'
const useMockApi = import.meta.env.VITE_USE_MOCK === 'true'

// H5 环境可通过 VITE_STAFF_API_BASE_URL 与 VITE_USE_MOCK 切换接口来源。
export const globalConfig = {
	cachePolicy: 1, // 頁面緩存的時間 默認緩存一天 以天爲單位 爲0不緩存
	formHost: "https://static.smallsaas.cn/form",
	dataHost: "https://static.smallsaas.cn/data",
	staticEndpoint: "https://static.smallsaas.cn",
	endpoint: staffApiEndpoint,
	tokenStorageKey: "token",
	appId: 1,
	useMock: useMockApi
}

// 调试配置
// 小程序环境：hardcode 为 false，老用户登录不进入社区选择流程
// H5环境：保留为 true，方便测试新用户流程
// #ifdef H5
export const debugConfig = {
	// 模拟新用户：设置为 true 时，强制清除社区信息，弹出社区选择界面
	// 设置为 false 时，使用后端返回的正常用户信息
	simulateNewUser: false
}
// #endif

// #ifndef H5
export const debugConfig = {
	// 模拟新用户：设置为 true 时，强制清除社区信息，弹出社区选择界面
	// 设置为 false 时，使用后端返回的正常用户信息
	simulateNewUser: false  // 小程序环境：false（生产环境必须为false）
}
// #endif
