/**
 * 动态页面白屏调试器
 * 用于调试动态页面白屏问题，通过插入 HTML 的方式在页面上显示调试信息
 * 仅在 H5 环境下有效
 */

class WhiteScreenDebugger {
	constructor() {
		this.isEnabled = false
		this.logs = []
		this.startTime = Date.now()
		this.containerId = 'white-screen-debugger'
		this.#checkEnvironment()
	}

	/**
	 * 检查运行环境，仅在 H5 且开启调试模式时启用
	 */
	#checkEnvironment() {
		// #ifdef H5
		// 从 URL 参数或 localStorage 读取调试开关
		const urlParams = new URLSearchParams(window.location.search)
		const debugParam = urlParams.get('debug')
		const debugStorage = localStorage.getItem('whiteScreenDebug')

		this.isEnabled = debugParam === 'true' || debugStorage === 'true'
		// #endif
	}

	/**
	 * 初始化调试器容器
	 */
	#initContainer() {
		// #ifdef H5
		if (!this.isEnabled || typeof document === 'undefined') return

		let container = document.getElementById(this.containerId)
		if (!container) {
			container = document.createElement('div')
			container.id = this.containerId
			container.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: rgba(0, 0, 0, 0.9);
				color: #00ff00;
				font-family: 'Courier New', monospace;
				font-size: 12px;
				z-index: 999999;
				padding: 20px;
				overflow: auto;
				line-height: 1.6;
			`
			document.body.appendChild(container)
		}
		return container
		// #endif
	}

	/**
	 * 添加日志
	 */
	log(step, data, level = 'info') {
		if (!this.isEnabled) return

		const timestamp = Date.now() - this.startTime
		const logEntry = {
			timestamp,
			step,
			data: this.#safeStringify(data),
			level,
			time: new Date().toISOString()
		}
		this.logs.push(logEntry)
		this.#render()
	}

	/**
	 * 安全地将对象转换为字符串
	 */
	#safeStringify(data) {
		try {
			if (data === null) return 'null'
			if (data === undefined) return 'undefined'
			if (typeof data === 'string') return data
			if (typeof data === 'object') {
				return JSON.stringify(data, null, 2)
			}
			return String(data)
		} catch (e) {
			return `[Cannot stringify: ${e.message}]`
		}
	}

	/**
	 * 渲染调试信息
	 */
	#render() {
		// #ifdef H5
		const container = this.#initContainer()
		if (!container) return

		let html = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #00ff00; padding-bottom: 10px;">
				<h2 style="margin: 0; color: #00ff00;">🐛 动态页面白屏调试器</h2>
				<button onclick="document.getElementById('${this.containerId}').remove()" style="background: #ff4444; color: white; border: none; padding: 5px 15px; cursor: pointer; border-radius: 3px;">关闭</button>
			</div>
			<div style="margin-bottom: 15px; color: #ffff00;">
				<strong>运行时间:</strong> ${(Date.now() - this.startTime) / 1000}s |
				<strong>日志条数:</strong> ${this.logs.length} |
				<strong>环境:</strong> H5
			</div>
			<div style="max-height: calc(100vh - 150px); overflow-y: auto;">
		`

		this.logs.forEach((log, index) => {
			const color = {
				'info': '#00ff00',
				'warn': '#ffff00',
				'error': '#ff4444',
				'success': '#00ffff'
			}[log.level] || '#00ff00'

			html += `
				<div style="margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-left: 3px solid ${color}; border-radius: 3px;">
					<div style="color: ${color}; font-weight: bold; margin-bottom: 5px;">
						[${index + 1}] ${log.step} (+${log.timestamp}ms)
					</div>
					<div style="color: #cccccc; font-size: 11px; margin-bottom: 5px;">${log.time}</div>
					<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; color: #ffffff; font-size: 11px; max-height: 200px; overflow-y: auto;">${this.#escapeHtml(log.data)}</pre>
				</div>
			`
		})

		html += '</div>'
		container.innerHTML = html
		// #endif
	}

	/**
	 * 转义 HTML 特殊字符
	 */
	#escapeHtml(text) {
		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		}
		return text.replace(/[&<>"']/g, m => map[m])
	}

	/**
	 * 快捷方法
	 */
	info(step, data) { this.log(step, data, 'info') }
	warn(step, data) { this.log(step, data, 'warn') }
	error(step, data) { this.log(step, data, 'error') }
	success(step, data) { this.log(step, data, 'success') }

	/**
	 * 显示诊断报告
	 */
	showDiagnosis(report) {
		// #ifdef H5
		if (!this.isEnabled) return
		const container = this.#initContainer()
		if (!container) return

		let html = `
			<div style="background: rgba(255, 68, 68, 0.2); border: 2px solid #ff4444; padding: 15px; margin-top: 20px; border-radius: 5px;">
				<h3 style="color: #ff4444; margin-top: 0;">⚠️ 白屏诊断报告</h3>
		`

		for (const [key, value] of Object.entries(report)) {
			html += `
				<div style="margin-bottom: 10px;">
					<strong style="color: #ffff00;">${key}:</strong>
					<span style="color: #ffffff;">${value}</span>
				</div>
			`
		}

		html += '</div>'
		container.innerHTML += html
		// #endif
	}

	/**
	 * 清空日志
	 */
	clear() {
		this.logs = []
		this.startTime = Date.now()
		this.#render()
	}

	/**
	 * 导出日志
	 */
	export() {
		return {
			startTime: new Date(this.startTime).toISOString(),
			endTime: new Date().toISOString(),
			duration: Date.now() - this.startTime,
			logs: this.logs
		}
	}
}

// 创建全局单例
const debuggerInstance = new WhiteScreenDebugger()

/**
 * 检查是否启用调试
 */
export const isDebugEnabled = () => {
	// #ifdef H5
	const urlParams = new URLSearchParams(window.location.search)
	return urlParams.get('debug') === 'true' || localStorage.getItem('whiteScreenDebug') === 'true'
	// #endif
	// #ifndef H5
	return false
	// #endif
}

/**
 * 启用调试模式
 */
export const enableDebug = () => {
	// #ifdef H5
	localStorage.setItem('whiteScreenDebug', 'true')
	console.log('🐛 白屏调试器已启用，刷新页面生效')
	// #endif
}

/**
 * 禁用调试模式
 */
export const disableDebug = () => {
	// #ifdef H5
	localStorage.removeItem('whiteScreenDebug')
	console.log('白屏调试器已禁用，刷新页面生效')
	// #endif
}

export default debuggerInstance
