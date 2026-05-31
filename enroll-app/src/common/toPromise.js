
// 封装Promise
export const toPromise = (fn) => {
  return (obj = {}) => {
    return new Promise((resolve, reject) => {
				obj.success = (res) => {
				  let raw = res.data ? res.data : res
				  // H5 mode: uni.request may return data as unparsed string
				  if (typeof raw === 'string') {
				    try { raw = JSON.parse(raw) } catch(e) {}
				  }
				  handleSuccess(raw, resolve)
				}
				obj.fail = (res) => {
					handleError(res, reject)
				}
				fn(obj)
		    })
		  }
		}

const clone = (obj) => {
  try { return JSON.parse(JSON.stringify(obj)) } catch(e) { return obj }
}

const handleSuccess = (res,resolve) => {
		if(res.code === 401 || res.code === 40100){
			uni.removeStorageSync("auth")
			uni.removeStorageSync("profile")
			uni.removeStorageSync('userInfo')
			uni.removeStorageSync('token')
			setTimeout(() => {
				uni.navigateTo({
					url: '/pages/login/index'
				})
			}, 200)

		}else{
			// 深拷贝解除 uni-app H5 环境下的只读冻结，避免 Vue 3 slot 更新时报错
			resolve(clone(res))
		}
	}

const handleError = (res, reject) => {
		// Extract response body from uni error object (fail callback gets raw error, not parsed)
		let body = res.data
		if (typeof body === 'string') { try { body = JSON.parse(body) } catch(e) {} }
		if (body && body.code) {
			// Pass through API error codes — don't reject, resolve so caller can handle
			if (body.code === 401 || body.code === 40100) {
				uni.removeStorageSync("auth")
				uni.removeStorageSync("profile")
				uni.removeStorageSync('userInfo')
				uni.removeStorageSync('token')
				setTimeout(() => { uni.navigateTo({ url: '/pages/login/index' }) }, 200)
			}
			// Resolve with body so the caller sees the error code
			handleSuccess(clone(body), reject)
			return
		}
		reject(res)
	}
