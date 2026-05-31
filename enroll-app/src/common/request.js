import { toPromise } from './toPromise'
import { globalConfig } from '@/config.js'
import { isMockUrl, mockRequest } from '@/mock/server.js'

// 平台客户端类型
// #ifdef MP-WEIXIN
const clientType = 'mp-weixin'
// #endif
// #ifdef H5
const clientType = 'h5'
// #endif

// 封裝請求
export const request = (method, url, params = {}, header = {}, timeout = 15000) => {
  if (isMockUrl(url, globalConfig)) {
    return mockRequest(method, url, params)
  }
	// 显示loaidng弹窗
	uni.showLoading({
		mask: true
	})
  const _request = toPromise(uni.request)
  if (method === 'GET' || method === 'get') {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    if (query) {
      url = `${url}${url.includes('?') ? '&' : '?'}${query}`
    }
  }

  if (Object.keys(header).length === 0) {
    header = {}
  }

  if (!header.Authorization || header.Authorization === 'Bearer ') {
     const token = uni.getStorageSync(`${globalConfig.tokenStorageKey}`) || ''
     header.Authorization = `Bearer ${token}`
  }
  header['Content-Type'] = header['Content-Type'] || 'application/json;charset=UTF-8'
  header['X-App-Id'] = header['X-App-Id'] || String(globalConfig.appId)
  header['X-Client-Type'] = header['X-Client-Type'] || clientType

  // 创建超时 Promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时，请检查网络连接后重试'))
    }, timeout)
  })

  // 创建请求 Promise
  const requestPromise = _request({
    url: url,
    method: method,
    data: params,
    header: header,
    timeout: timeout
  })

  // 使用 Promise.race 实现超时机制
  return Promise.race([requestPromise, timeoutPromise])
    .catch(error => {
      // 隐藏 loading
      // uni.hideLoading() -- handled in finally

      // 处理超时错误
      if (error.message === '请求超时，请检查网络连接后重试') {
        uni.showToast({
          title: error.message,
          icon: 'none',
          duration: 3000
        })
        return { code: 408, message: error.message }
      }

      // 处理其他网络错误
      if (error.errMsg && error.errMsg.includes('timeout')) {
        uni.showToast({
          title: '请求超时，请检查网络连接后重试',
          icon: 'none',
          duration: 3000
        })
        return { code: 408, message: '请求超时' }
      }

      if (error.errMsg && error.errMsg.includes('fail')) {
        uni.showToast({
          title: '网络连接失败，请检查网络后重试',
          icon: 'none',
          duration: 3000
        })
        return { code: 500, message: '网络连接失败' }
      }

      // 其他错误正常抛出
      throw error
    })
    .finally(() => {
      // 确保 loading 被隐藏
      uni.hideLoading()
    })
}

// 上傳文件
export const upLoad = (url, filePath, params, name, timeout = 30000) => {
  if (isMockUrl(url, globalConfig)) {
    return mockRequest('POST', url, { ...(params || {}), filePath, name })
  }
  const _upLoad = toPromise(uni.uploadFile)
  const token = uni.getStorageSync(`${globalConfig.tokenStorageKey}`) || ''

  // 创建超时 Promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('上传超时，请检查网络连接后重试'))
    }, timeout)
  })

  // 创建上传 Promise
  const uploadPromise = _upLoad({
    url: url,
    filePath: filePath,
    formData: params,
    name: name,
    header: {
      Authorization: `Bearer ${token}`,
      'X-App-Id': String(globalConfig.appId),
      'X-Client-Type': clientType
    }
  })

  // 使用 Promise.race 实现超时机制
  return Promise.race([uploadPromise, timeoutPromise])
    .catch(error => {
      // 隐藏 loading
      uni.hideLoading()

      // 处理超时错误
      if (error.message === '上传超时，请检查网络连接后重试') {
        uni.showToast({
          title: error.message,
          icon: 'none',
          duration: 3000
        })
        return { code: 408, message: error.message }
      }

      // 处理其他网络错误
      if (error.errMsg && error.errMsg.includes('timeout')) {
        uni.showToast({
          title: '上传超时，请检查网络连接后重试',
          icon: 'none',
          duration: 3000
        })
        return { code: 408, message: '上传超时' }
      }

      if (error.errMsg && error.errMsg.includes('fail')) {
        uni.showToast({
          title: '网络连接失败，请检查网络后重试',
          icon: 'none',
          duration: 3000
        })
        return { code: 500, message: '网络连接失败' }
      }

      // 其他错误正常抛出
      throw error
    })
    .finally(() => {
      // 确保 loading 被隐藏
      uni.hideLoading()
    })
}


// 已经在文件开头使用 export 导出了，这里不需要重复导出
// export { request, upLoad } // 已在顶部导出
