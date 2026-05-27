
// 封装Promise
export const toPromise = (fn) => {
  return (obj = {}) => {
    return new Promise((resolve, reject) => {
		obj.success = (res) => {
		uni.hideLoading() //关闭loading弹窗
		  res = res.data ? res.data : res
		  // resolve(res)
		  handleSuccess(res, resolve)
		}
		obj.fail = (res) => {
			
			// reject(res)
			handleError(res, reject)
		  // // console.log('reject==', res)
		}
		fn(obj)
    })
  }
}

const handleSuccess = (res,resolve) => {
	if(res.code === 401){
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
		resolve(res)
	}
}

const handleError = (res, reject) => {
	if(res.code === 401){
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
		reject(res)
	}
}

// 已经在文件开头使用 export 导出了，这里不需要重复导出
// export { toPromise } // 已在顶部导出
