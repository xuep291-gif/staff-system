import {
	request,
	upLoad
} from './request'
import {
	globalConfig
} from '../config.js'

// Base64编码辅助函数（用于非H5环境）
// #ifndef H5
function base64Encode(str) {
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
}
// #endif

// 獲取全局配置
export const api = {

	// 获取微信用户手机号
	getPhoneNumber(params) {
		const url = `${globalConfig.endpoint}/api/oauth/wxapp/getPhone`
		return request('POST', url, params)
	},

	// 当前用户 设置用户 类型
	putUserType(params) {
		const url = `${globalConfig.endpoint}/api/u/user/accounts/updateUserInfo`
		return request('PUT', url, params)
	},

	// 公用访问API
	commonAccessApi(api, params, method) {
		const url = `${globalConfig.endpoint}${api}`
		return request(method, url, params)
	},
	// 公用访问页面配置
	commonAccessPageConfig(pageId) {
		const url = `${globalConfig.formHost}?id=${pageId}`
		return request('GET', url)
	},

	// 静态公用访问API
	staticCommonAccessApi(api, params, method) {
		const url = `${globalConfig.staticEndpoint}${api}`
		return request(method, url, params)
	},

	// 提交同意用户协议
	putAgreement(params) {
		const url = `${globalConfig.endpoint}/api/u/endUserApplyRecord/agreement/${globalConfig.appId}`
		return request('PUT', url, params)
	},

	// 获取用户是否同意用户协议
	getAgreement() {
		const url = `${globalConfig.endpoint}/api/u/endUserApplyRecord/agreement/${globalConfig.appId}`
		return request('GET', url)
	},

	// 获取社区信息
	getCommunityList(params) {
		const url = `${globalConfig.endpoint}/api/u/asset/tenant`
		return request('GET', url, params)
	},

	// 获取小区信息
	getCommunityChildrenList(params) {
		const url = `${globalConfig.endpoint}/api/u/asset/community`
		return request('GET', url, params)
	},

	// 设置小区, 修改小区
	postCommunityChildrenType(communityId, params) {
		const url = `${globalConfig.endpoint}/api/u/asset/community/userCommunityStatus?communityId=${communityId}`
		return request('POST', url, params)
	},
	// tabbar
	tabbar(id, params) {
		const url = `${globalConfig.dataHost}?id=${id}`
		return request('GET', url, params)
	},

	//获取评论列表
	message(rssId, commentSize, stockType = 'rss') {
		const url =
			`${globalConfig.staticEndpoint}/api/cms/evaluations?stockType=${stockType}&stockId=${rssId}&pageSize=${commentSize}`
		return request('GET', url)
	},
	//发表评论
	leaveComment(id, params) {
		const url = `${globalConfig.staticEndpoint}/api/cms/evaluations/rss/${id}`
		return request('POST', url, params)
	},

	//点赞评论
	// kudos(id) {
	// 	const url = `${globalConfig.staticEndpoint}/api/cms/evaluations/${id}/star/approval`
	// 	return request('POST', url)
	// },

	kudos(params) {
		const url = `${globalConfig.staticEndpoint}/api/cms/star`
		return request('POST', url, params)
	},

	//点赞回复评论
	// kudosReply(id) {
	// 	const url = `${globalConfig.staticEndpoint}/api/cms/evaluations/${id}/star/approval`
	// 	return request('POST', url)
	// },

	//删除评论
	deComment(id) {
		const url = `${globalConfig.staticEndpoint}/api/cms/evaluations/${id}`
		return request('DELETE', url)
	},

	//获取评论列表
	commentList(stockId, stockType, size) {
		const url =
			`${globalConfig.staticEndpoint}/api/cms/evaluations?stockType=${stockType}&stockId=${stockId}&pageSize=${size}`
		return request('GET', url)
	},
	//发表评论
	sendComment(evaluationsId, evaluationsType, params) {
		const url = `${globalConfig.staticEndpoint}/api/cms/evaluations/${evaluationsType}/${evaluationsId}`
		return request('POST', url, params)
	},

	// 搜索测试
	getSearchPage(params) {
		const url = `${globalConfig.formHost}`
		return request('GET', url)
	},

	// 获取图片资源
	getIcon(params) {
		const url = `${globalConfig.dataHost}?id=9999999`
		return request('GET', url, params)
	},

	// 获取通知消息
	getNoticeList(params) {
		const url = `${globalConfig.staticEndpoint}/api/cms/notice/notices`
		return request('GET', url, params)
	},
	// 获取notice 详情
	getNoticeDetail(id, params) {
		const url = `${globalConfig.staticEndpoint}/api/cms/notice/notices/${id}`
		return request('GET', url, params)
	},

	//获取房号列表
	getHousePropertyUnit(id, params) {
		const url = `${globalConfig.endpoint}/api/u/asset/asset/${id}`
		return request('GET', url, params)
	},

	//删除房号
	deleteAssetById(id, params) {
		const url = `${globalConfig.endpoint}/api/u/asset/user/userAsset/${id}`
		return request('DELETE', url, params)
	},

	deleteAddress(params) {
		// console.log('22322232',params);//undefined
		const url = `${globalConfig.endpoint}/api/u/house/house/housePropertyUnit/userUnit/` + params.id
		return request('DELETE', url, params)
	},


	//新增地址确认按钮
	submits(params) {
		// console.log('我是params：',params);
		const url = `${globalConfig.endpoint}/api/u/house/house/housePropertyUnit/userUnit`
		return request('POST', url, params)
	},

	//获取所有我的房子
	getMyhouse() {
		const url = `${globalConfig.endpoint}/api/u/asset/user/userAsset`
		return request('GET', url)
	},

	//获取我的房子详情
	getMyHouseDetail(id, params) {
		const url = `${globalConfig.endpoint}/api/u/asset/asset/details/${id}`
		return request('GET', url, params)
	},

	//我的房子--新增房子
	submitButtonHouse(params) {
		const url = `${globalConfig.endpoint}/api/u/asset/user/userAsset`

		return request('POST', url, params)
	},

	// 获取楼栋列表
	getBuildingList() {
		const url = `${globalConfig.endpoint}/api/u/asset/building`

		return request("GET", url)
	},

	putUserAsset(params) {
		const url = `${globalConfig.endpoint}/api/u/asset/user/userAsset/${params}`
		return request('PUT', url, params)
	},

	// 删除我的房子
	deleteUserAsset(id) {
		const url = `${globalConfig.endpoint}/api/u/asset/user/userAsset/${id}`
		return request('DELETE', url)
	},

	//查询用户选定小区状态
	queryStatus(params) {
		const url = `${globalConfig.endpoint}/api/u/asset/community/userCommunityStatus`
		return request('GET', url, params)
	},
	defaultArea(params) {

		const url = `${globalConfig.endpoint}/api/u/asset/community/userCommunityStatus`
		return request('POST', url, params)
	},

	//获取商品分类
	getProductCategroy(params) {
		const url = `${globalConfig.endpoint}/api/u/product/productCategory/app/1`
		return request('GET', url, params)
	},

	//根据分类id过滤商品
	getFilterGoodsData(params) {
		const url = `${globalConfig.endpoint}/api/u/product/products`
		return request('GET', url, params)
	},

	//商品详情
	getProductDetail(id, params) {
		const url = `${globalConfig.endpoint}/api/u/product/products/hasChild/${id}`
		return request('GET', url, params)
	},

	//创建商品订单
	createOrder(params) {
		const url = `${globalConfig.endpoint}/api/u/order`
		return request('POST', url, params)
	},

	//获取订单详情
	getOrderDetail(orderNumber, params) {
		const url = `${globalConfig.endpoint}/api/u/order/${orderNumber}`
		return request('GET', url, params)
	},
	
	// 取消订单
	cancelOrder(productId) {
		const url = `${globalConfig.endpoint}/api/u/order/cancel-order/${productId}`
		return request('PUT',url)
	},
	
	// 查看团购状态
	getGroupStatus(id) {
		const url = `${globalConfig.endpoint}/api/u/order/status/bulk/${id}`
		return request('GET', url)
	},
	
	// 获取商品已团数量
	sumQuantity(productId) {
		const url = `${globalConfig.endpoint}/api/u/order/sum-order/${productId}`
		return request('GET',url)
	},

	// 获取户型列表
	getHouseType(params) {
		const url = `${globalConfig.endpoint}/api/u/xxx`
		return request('GET', url, params)
	},

	// 获取VR类型列表
	getVrCatgroyList(params) {
		const url = `${globalConfig.endpoint}/api/u/vr/vrType`
		return request('GET', url, params)
	},

	//获取VR列表
	getVrList(params) {
		const url = `${globalConfig.endpoint}/api/u/vr`
		return request('GET', url, params)
	},

	//获取绿植详情
	getDetail(id) {
		const url = `${globalConfig.endpoint}/api/u/product/products/hasChild/${id}`
		return request('GET', url)
	},
	// 获取用户的装修计划
	getHouseUserDecoratePlans(params) {
		const url = `${globalConfig.endpoint}/api/u/house/houseUserDecoratePlan/houseUserDecoratePlans`
		return request('GET', url, params)
	},

	// 获取装修方案详情
	getdecoratePlanDetails(id, params) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseUserDecoratePlan/houseUserDecoratePlans/userDecorateDetails/${id}`
		return request('GET', url, params)
	},

	//房子添加装修计划
	addRenovationScheme(params, method) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseUserDecoratePlan/houseUserDecoratePlans/userDecoratePlanAddress`
		return request(method, url, params)
	},

	//查看房源详情
	getRentHouseDetail(id, params) {
		const url = `${globalConfig.endpoint}/api/u/asset/user/rent/details/${id}`
		return request('GET', url, params)
	},

	// 方数买卖：设置用户身份：供给方？还是需求方？；设置供给方数/需求方数
	postDealSquare(params) {
		const url = `${globalConfig.endpoint}/api/u/house/houseEquityDemandSupply/houseEquityDemandSupplyies`
		return request('POST', url, params)
	},

	// 方数买卖：获取用户身份
	getUserStatus() {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseEquityDemandSupply/houseEquityDemandSupplyies/userStatus`
		return request('GET', url)
	},

	// 方数买卖：查询所有意向用户
	queryIntentionUser() {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseEquityDemandSupply/houseEquityDemandSupplyies/userDemandSupply`
		return request('GET', url)
	},

	getInventory() {
		const url = `${globalConfig.endpoint}/api/u/order/inventory`
		return request('GET', url)
	},
	//用户反馈
	userFeedback(params, type) {
		const url = `${globalConfig.endpoint}/api/u/user/feedback/${globalConfig.appId}/${type}`
		return request('POST', url, params)
	},

	// 获取VR轮播图
	getBanner(params) {
		// 从缓存获取用户信息
		let userInfo = null
		let orgId = null

		try {
			// 使用 $cache 方法获取用户信息（这个方法会自动处理过期时间）
			// 注意：这里需要通过 Vue 实例来调用，但在 api.js 中无法直接访问
			// 所以我们直接处理存储的格式
			const userInfoStr = uni.getStorageSync('userInfo')

			if (userInfoStr) {
				// 如果已经是对象，直接使用
				if (typeof userInfoStr === 'object') {
					userInfo = userInfoStr
				} else if (typeof userInfoStr === 'string') {
					// 处理 cache 方法存储的格式：JSON_|_timestamp
					if (userInfoStr.includes('_|_')) {
						const parts = userInfoStr.split('_|_')
						const jsonStr = parts[0]
						const expireTime = Number(parts[1])
						const nowTime = Date.parse(new Date()) / 1000

						if (expireTime > nowTime) {
							userInfo = JSON.parse(jsonStr)
						}
					} else {
						// 直接解析 JSON
						userInfo = JSON.parse(userInfoStr)
					}
				}
			}

			// 从用户信息中提取 orgId
			if (userInfo && userInfo.orgId) {
				orgId = userInfo.orgId
			}
		} catch (e) {
			// 获取用户信息失败，orgId 保持为 null
		}

		// 构建 group_name: home:{appid}:{orgId}
		const appid = globalConfig.appId

		// 如果没有有效的 orgId 或 appid，不发送请求
		if (!orgId || !appid) {
			return Promise.reject(new Error('orgId and appid are required'))
		}

		const groupNameRaw = `home:${appid}:${orgId}`

		// Base64编码：兼容H5和小程序环境
		let groupName
		// #ifdef H5
		// H5环境使用浏览器原生 btoa 方法
		groupName = btoa(groupNameRaw)
		// #endif
		// #ifndef H5
		// 小程序环境使用手动Base64编码
		groupName = base64Encode(groupNameRaw)
		// #endif

		const url = `${globalConfig.staticEndpoint}/api/pub/cms/ad/group/${groupName}`

		return request('GET', url, params)
	},

	// 获取主力户型图
	gethouseList(params) {
		const url = `${globalConfig.endpoint}/api/u/house/houseDesignModel/houseDesignModels`
		return request('GET', url, params)
	},
	// 获取观看人数
	getViewNumber(id, params) {
		const url = `${globalConfig.endpoint}/api/u/vr/addVrCount/${id}`
		return request('PUT', url, params)
	},
	// 获取回迁信息
	getfetchMessage(params) {
		const url = `${globalConfig.endpoint}/api/u/statistics/houseOverStatistics`
		return request('GET', url, params)
	},
	// 换房记录
	getChangingHouseRecord() {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/userAllAssetExchangeDemand`
		return request('GET', url)
	},

	//提交装修方案
	postDecorationScheme(id, params) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseUserDecoratePlan/houseUserDecoratePlans/confirmDecoratePlanFurniture/${id}`
		return request('POST', url, params)
	},

	getAreaList(params) {
		const url = `${globalConfig.endpoint}/api/u/statistics/houseTypeOverStatistics`
		return request('GET', url, params)
	},
	// 获取户型数字的信息
	getNumberMsg(houseTypeId, params) {
		const url =
			`${globalConfig.endpoint}/api/u/houseDesignModel/houseDesignModels/houseTypeDetails/${houseTypeId}`
		return request('GET', url, params)
	},
	// 获取可选房号
	getRoomNumber(assetId, buildingId) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/buildingAsset?assetId=${assetId}&buildingId=${buildingId}`
		return request('GET', url)
	},
	// 获取置换房屋的已选择项
	getSelectHouse(assetId, userId) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/userAssetExchangeDemand/${assetId}?userId=${userId}`
		return request('GET', url)
	},
	// 增加置换需求
	postExchangerequests(params) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests`
		return request('POST', url, params)
	},

	//获取地址列表
	getAddressList() {
		const url = `${globalConfig.endpoint}/api/u/asset/user/userAsset`
		return request('GET', url)
	},

	//获取用户类型列表
	getUserTypeList() {
		const url = `${globalConfig.endpoint}/api/u/user/enum/typeSetting`
		return request('GET', url)
	},
	// 删除指定房屋的置换需求
	deleteExchanging(assetId) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/${assetId}`
		return request('DELETE', url)
	},
	// 提出申述
	putAppeal(houseId, params) {
		const url = `${globalConfig.endpoint}/api/u/asset/clash/${houseId}`
		return request('PUT', url, params)
	},
	//更新用户信息
	putUserInfo(params) {
		const url = `${globalConfig.endpoint}/api/u/user/accounts/updateUserInfo`
		return request('PUT', url, params)
	},
	//出租
	HouseForRent(params) {
		const url = `${globalConfig.endpoint}/api/u/house/rent/userRentAsset/userRentAsset`
		return request('POST', url, params)
	},

	//出租  手动上传的数据
	getFillOutRentDetails(params) {
		const url = `${globalConfig.endpoint}/api/u/house/rent/userRentAsset/userRent`
		return request('POST', url, params)
	},
	// 出租列表
	HouseForRentList() {
		const url = `${globalConfig.endpoint}/api/u/house/rent/userRentAsset/UserRentAssetList`
		return request('GET', url)
	},
	//获取出租详情
	getRentOutDetails(assetId) {
		const url = `${globalConfig.endpoint}/api/u/house/rent/userRentAsset/userRentAssetDetails/${assetId}`
		return request('GET', url)
	},
	//获取出租详情 手动上传的数据
	getRentOutidMyDetails(id) {
		const url = `${globalConfig.endpoint}/api/u/house/rent/userRentAsset/userRentAssetDetailsByRentId/${id}`
		return request('GET', url)
	},

	//修改出租详情 手动上传的数据
	putRentOutidMyDetails(id, params) {
		const url = `${globalConfig.endpoint}/api/u/house/rent/userRentAsset/userRent/${id}`
		return request('PUT', url, params)
	},

	//获取配置列表
	getConfigurationList() {
		const url = `${globalConfig.endpoint}/api/u/house/rent/userRentAsset/rent/supportFacilities`
		return request('GET', url)
	},

	// 确认产权验证
	putConfirmCompaint(id, params) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userAssetComplaintEndpoint/clash/confirm/${id}`
		return request('PUT', url, params)
	},

	// 拒绝产权验证
	putRefuseCompaint(id, params) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userAssetComplaintEndpoint/clash/refuse/${id}`
		return request('PUT', url, params)
	},

	// 取消产权验证证明
	putCancelCompaint(id, params) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userAssetComplaintEndpoint/clash/cancel/${id}`
		return request('PUT', url, params)
	},

	//获取申述申请详情
	getComplaintDetail(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userAssetComplaintEndpoint/clash/${id}`
		return request('GET', url)
	},
	//不再出租
	deleteRent(assetId) {
		const url = `${globalConfig.endpoint}/api/u/house/rent/userRentAsset/undercarriage/${assetId}`
		return request('DELETE', url)
	},
	//不再出租  手动上传的数据
	deleteMyRent(id) {
		const url = `${globalConfig.endpoint}/api/u/house/rent/userRentAsset/userRent/${id}`
		return request('DELETE', url)
	},

	// 超级管理员 获取 功能发布状态
	getSuperFunctionIssue() {
		const url = `${globalConfig.endpoint}/api/u/house/administrators/UserFunctionManageEndpoint`
		return request('GET', url)
	},

	// 超级管理员 修改 功能发布
	putSuperFunctionRelease(params) {
		const url = `${globalConfig.endpoint}/api/u/house/administrators/UserFunctionManageEndpoint/updateHouseMenu`
		return request('PUT', url, params)
	},

	// 高级配置 获取 功能发布状态
	getFunctionIssue() {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userFunctionSecondaryManage/getMenuList`
		return request('GET', url)
	},

	// 高级配置 修改 功能发布状态
	putFunctionRelease(params) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userFunctionSecondaryManage/updateHouseMenu`
		return request('PUT', url, params)
	},

	// 普通用户 获取 功能发布状态（已注释，不再使用）
	// getOedinaryFunctionIssue() {
	// 	const url = `${globalConfig.endpoint}/api/u/house/houseMenu/houseMenus`
	// 	return request('GET', url)
	// },

	//新增地址
	getNewAddressItem(assetId, params) {
		console.log(assetId)
		const url = `${globalConfig.endpoint}/api/u/house/houseUserAddress`
		return request('POST', url, params)
	},

	putDoorplateNum(id, params) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/UserUnitManageEndpoint/updateUnitBing/${id}`
		return request('PUT', url, params)
	},
	//删除轮播图
	delBannerItem(id) {
		const url = `${globalConfig.staticEndpoint}/api/cms/manage/ad/${id}`
		return request('DELETE', url)

	},
	// 获取我的房子
	ReturnMyHouse() {
		const url = `${globalConfig.endpoint}/api/u/asset/getMyReturnRoom`
		return request('GET', url)
	},
	// ⬇️⬇️⬇️ 5g超级管理 ⬇️⬇️⬇️
	// 获取所有app
	getAllApp() {
		const url = `${globalConfig.endpoint}/api/u/apps`
		return request('GET', url)
	},
	// 获取对应app下的所有产品
	getAllProduct(appId) {
		const url = `${globalConfig.endpoint}/api/u/accountProduct/${appId}`
		return request('GET', url)
	},
	// ⬆️⬆️⬆️ 5g超级管理 ⬆️⬆️⬆

	//获取运维申请详情
	getApplicationOperationsApplyDetail(id) {
		const url = `${globalConfig.endpoint}/api/u/house/administrators/applicationOperationsManage/${id}`
		return request('GET', url)
	},
	//申请运维--同意
	putApplicationOperationsApplyConfirm(id) {
		const url =
			`${globalConfig.endpoint}/api/u/house/administrators/applicationOperationsManage/status/pass/${id}`
		return request('PUT', url)
	},
	//申请置业顾问--拒绝
	putRefuseApplicationOperationsApply(id, params) {
		const url =
			`${globalConfig.endpoint}/api/u/house/administrators/applicationOperationsManage//status/refuse/${id}`
		return request('PUT', url, params)
	},

	//获取置业顾问申请详情
	getApplyDetail(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userApplicationIntermediary/${id}`
		return request('GET', url)
	},
	//申请置业顾问--同意
	putApplyConfirm(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userApplicationIntermediary/status/pass/${id}`
		return request('PUT', url)
	},
	//申请置业顾问--拒绝
	putRefuseApply(id, params) {
		const url =
			`${globalConfig.endpoint}/api/u/house/operations/userApplicationIntermediary/status/refuse/${id}`
		return request('PUT', url, params)
	},

	//房东认证申请
	putLandlordApplyConfirm(params) {
		const url = `${globalConfig.endpoint}/api/u/user/authentication/verify`
		return request('POST', url, params)
	},

	// 获取当前小区楼栋
	getBuildingCode() {
		const url = `${globalConfig.endpoint}/api/u/house/building/getCurrentCommunityBuilding`
		return request('GET', url)
	},

	// 获取不同楼栋的信息
	getBuildingMsg(id) {
		const url = `${globalConfig.endpoint}/api/u/house/building/${id}`
		return request('GET', url)
	},
	//  获取楼栋不同楼层的门牌号
	getHouseNumber(buildingId, floor) {
		const url =
			`${globalConfig.endpoint}/api/u/house/building/getFloorsHouseNumber?buildingId=${buildingId}&floors=${floor}`
		return request('GET', url)
	},
	// 申请回迁社区运营
	postCommunityOperation(params) {
		const url = `${globalConfig.endpoint}/api/u/house/uerApplicationOperationsEndpoint`
		return request('POST', url, params)
	},
	//VR图上架
	putShelvesVrPicture(id) {
		const url =
			`${globalConfig.endpoint}/api/u/house/operations/userVrManageEndpoint/vrPicture/shelvesVrPicture/${id}`
		return request('PUT', url)
	},
	//VR图下架
	putUnshelvesVrPicture(id) {
		const url =
			`${globalConfig.endpoint}/api/u/house/operations/userVrManageEndpoint/vrPicture/unshelvesVrPicture/${id}`
		return request('PUT', url)
	},
	//删除VR图片
	delVRPictureItem(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userVrManageEndpoint/vrPicture/${id}`
		return request('DELETE', url)
	},
	//户型->获取vrlist
	getVRList(id) {
		const url =
			`${globalConfig.endpoint}/api/u/house/operations/userVrManageEndpoint/getHouseVrTypeListItem?communityId=${id}`
		return request('GET', url)
	},
	//户型绑定VR图
	bindingVRPicture(communityId, params) {
		const url =
			`${globalConfig.endpoint}/api/u/house/operations/userHouseTypeManageEndpoint/bindVr/${communityId}`
		return request('PUT', url, params)
	},
	//删除户型
	delUserHouseById(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userHouseTypeManageEndpoint/${id}`
		return request('DELETE', url)
	},

	//获取当前社区复式房数据
	getDuplexRoomData() {
		const url = `${globalConfig.endpoint}/api/u/userMultipleAsset/getMultipleAssetInfo`
		return request('GET', url)
	},
	// 获取某房屋的换房匹配成功记录
	getHouseMatchRecord(assetId) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/getAssetMatchedInfo?assetId=${assetId}`
		return request('GET', url)
	},

	//复式绑定户型->获取户型列表
	getHouseTypeList(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userHouseTypeManageEndpoint?communityId=${id}`
		return request('GET', url)
	},
	//复式绑定户型
	bindingHouseType(duplexRoomId, params) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/userMultipleAssetEndpoint/bind/${duplexRoomId}`
		return request('PUT', url, params)
	},
	//删除用户数据
	delUserDataById(id) {
		const url = `${globalConfig.endpoint}/api/u/house/administrators/userDataManage/deleteUserData?userId=${id}`
		return request('POST', url)
	},
	// 公告上架 or 下架
	putNotice(noticeId, operate) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/noticeManage/${noticeId}/${operate}`
		return request('PUT', url)
	},
	// 公告删除
	removeNotice(id) {
		const url = `${globalConfig.staticEndpoint}/api/cms/notice/notices/${id}`
		return request('DELETE', url)
	},
	// 房产列表
	// getHousingEstates(pageNum) {
	// 	const url = `${globalConfig.endpoint}/api/u/house/sales/housingEstates?pageNum=${pageNum}`
	// 	return request('GET',url)
	// },
	// 房产列表
	getHousingEstatesSearch(userId, search, pageNum) {
		const url =
			`${globalConfig.endpoint}/api/u/house/sales/housingEstates?pageSize=20&userId=${userId}&search=${search}&pageNum=${pageNum}`
		return request('GET', url)
	},
	postAddNote(params) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/userLandlordNote`
		return request('POST', url, params)
	},
	// 置业顾问列表
	getPropertyConsultant(search) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/intermediaryAgent?search=${search}`
		return request('GET', url)
	},
	// 指定置业顾问
	putDesignatePropertyConsultant(params) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/housingEstates/pointIntermediary`
		return request('put', url, params)
	},
	// 销售主管操作挂盘
	postCreateRentAsset(assetId) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/housingEstates/createRentAsset/${assetId}`
		return request('POST', url)
	},
	// 根据id查询房产列表
	getHousePropertyById(id) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/landlord/landlordAsset/${id}`
		return request('GET', url)
	},
	// 房产设置 - 获取所有小区
	getAllCommunity() {
		const url = `${globalConfig.endpoint}/api/u/house/sales/landlord/allCommunity`
		return request('GET', url)
	},
	// 房产设置 - 获取某小区的所有楼栋
	getAllBuilding(communityId) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/landlord/community/${communityId}`
		return request('GET', url)
	},
	// 房产设置 - 获取某楼栋下的所有房号
	getAllHouseNumber(buildingId) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/landlord/building/${buildingId}`
		return request('GET', url)
	},
	// 房产设置 - 绑定房东
	postBindLandlord(params) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/landlord/bindLandlord`
		return request('POST', url, params)
	},
	// 房产设置 - 获取房东详情
	getLandlordDetails(landlordId) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/landlord/userInfo/${landlordId}`
		return request('GET', url)
	},

	// 获取面积统计
	getUserAreaStatistics() {
		const url = `${globalConfig.endpoint}/api/u/statistics/userAreaStatistics`
		return request('GET', url)
	},

	// 设置房屋为不喜欢
	putHouseDontlike(assetId) {
		const url = `${globalConfig.endpoint}/api/u/asset/unlike/${assetId}`
		return request('PUT', url)
	},
	// 设置不喜欢房屋的备注
	putDontlikeNotes(id, params) {
		const url = `${globalConfig.endpoint}/api/asset/unlike/${id}`
		return request('PUT', url, params)
	},
	// 取消房屋的不喜欢状态
	putCancelHouseDontlike(assetId) {
		const url = `${globalConfig.endpoint}/api/u/asset/like/${assetId}`
		return request('PUT', url)
	},
	// 获取当前小区的不喜欢的房子的列表
	getDontHouseList(pageNum) {
		const url =
			`${globalConfig.endpoint}/api/u/house/sales/landLordExchangeAsset/unlikeList?communityId=1&pageSize=24&pageNum=${pageNum}`
		return request('GET', url)
	},
	// 用全部的房子换别人不喜欢的房子
	postAllHouseExchange(params) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/selectUnlikeAssetList`
		return request('POST', url, params)
	},
	// 取消用全部的房换别人不喜欢的房
	deleteAllHouseExchange(assetId) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/cancelUnlikeLog/${assetId}`
		return request('DELETE', url)
	},
	// 获取想要换我的房子的换房需求
	getExchangeMyHouseList(pageNum) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/optionExchangeRequestList?pageSize=24&pageNum=${pageNum}`
		return request('GET', url)
	},
	// 同意换房请求
	postConsentExchangeHouse(params) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/confirmExchangeAsset`
		return request('POST', url, params)
	},
	// 获取换房截止时间
	getDeadline() {
		const url = `${globalConfig.endpoint}/api/u/house/userCommunity/exchangeDeadline`
		return request('GET', url)
	},
	// 销售帮换房APi
	postHelpExchangeHouse(userId, params) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/landLordExchangeAsset?userId=${userId}`
		return request('POST', url, params)
	},

	// 普通注册
	postDefaultLogin(params) {
		const url = `${globalConfig.endpoint}/api/oauth/wxapp/login`
		return request('POST', url, params)
	},
	// 分享注册
	postShareLogin(params) {
		const url = `${globalConfig.endpoint}/api/u/login`
		return request('POST', url, params)
	},
	// 获取当前请求参数用户id
	getCurrentUserId(params) {
		const url = `${globalConfig.endpoint}/api/u/house/administrators/develops/users/current`
		return request('GET', url)
	},
	// 获取执行语句条数
	getQuerySqlCount(params) {
		const url = `${globalConfig.endpoint}/api/u/house/administrators/develops/getRowCount/${params}`
		return request('GET', url)
	},
	// 执行sql语句
	PostExecuteSql(params) {
		const url = `${globalConfig.endpoint}/api/u/house/administrators/develops/${params}`
		return request('POST', url, params)
	},
	// 用户个人匹配成功记录
	getUserMatchRecord() {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/matchResult?pageSize=200`
		return request('GET', url)
	},
	// 销售查询房东换房成功记录
	getMatchRecordBySalesperson(id) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/landlordExchangeLog/matchResult/${id}`
		return request('GET', url)
	},
	// 供应商列表
	getSupplierList() {
		const url = `${globalConfig.endpoint}/api/u/supplier`
		return request('GET', url)
	},
	// 同意换房
	updateExchangeAgree(id) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/mathReSult/op/agree/${id}`
		return request('PUT', url)
	},
	// 拒绝换房
	updateExchangeRefuse(id) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/mathReSult/op/refuse/${id}`
		return request('PUT', url)
	},


	postRssData(params) {
		const url = `${globalConfig.endpoint}/api/u/rss/master`
		return request('POST', url, params)
	},

	getRssDetail(api, params = {}) {
		const url = `${globalConfig.endpoint}${api}`
		return request('GET', url, params)
	},

	// getRssDetailByName(name){
	// 	const url = `${globalConfig.endpoint}/api/u/rss/master?name=${name}`
	// 	return request('GET',url)
	// },

	putRssData(id, params) {
		const url = `${globalConfig.endpoint}/api/u/rss/master/${id}`
		return request('PUT', url, params)
	},

	//rss-批量添加/修改子项
	updataRssBatch(id, params) {
		const url = `${globalConfig.endpoint}/api/u/rss/componentProp/${id}/batch`
		return request('POST', url, params)
	},

	//rss-删除子项
	deleteRssBatch(id, itemId, params) {
		const url = `${globalConfig.endpoint}/api/u/rss/componentProp/${id}/${itemId}`
		return request('DELETE', url, params)
	},

	// 获取所有公告
	getAllNotice(pageNum) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/noticeManage?pageNum=${pageNum}`
		return request('GET', url)
	},

	// rss-tab组件，修改表格行数据
	updateRow(rssId, rowId, params) {
		const url = `${globalConfig.endpoint}/api/u/rss/componentProp/${rssId}/${rowId}`
		return request('PUT', url, params)
	},
	// rss-tab组件，添加列表行数据
	saveRow(rssId, params) {
		const url = `${globalConfig.endpoint}/api/u/rss/componentProp/${rssId}`
		return request('POST', url, params)
	},
	// rss-tab组件，删除表格行数据
	removeRow(rssId, rowId) {
		const url = `${globalConfig.endpoint}/api/u/rss/componentProp/${rssId}/${rowId}`
		return request('DELETE', url)
	},
	// rss-tab组件，批量修改
	updateTable(rssId, params) {
		const url = `${globalConfig.endpoint}/api/u/rss/componentProp/${rssId}/batch`
		return request('POST', url, params)
	},
	// 换取同方数高楼层
	exchangeHighOrLowFloor(assetId, isUp) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetExchangeRequest/houseAssetExchangeRequests/upAndDownStairs?assetId=${assetId}&isUp=${isUp}`
		return request('POST', url)
	},
	//房源分类统计
	getHouseRentStatistics(rentStatus) {
		const url = `${globalConfig.endpoint}/api/u/house/sales/houseRentStatistics?rentStatus=${rentStatus}`
		return request('GET', url)
	},
	//获取精准查询数据
	getAssetAccurateData() {
		const url = `${globalConfig.endpoint}/api/u/house/rent/agentRentManage/getAccurateFields`
		return request('GET', url)
	},
	// 保存精准查询
	saveAssetAccurateData(params) {
		const url = `${globalConfig.endpoint}/api/u/house/rent/agentRentManage`
		return request('POST', url, params)
	},


	//====================== 动态页面API =======================
	// 获取页面模板类型
	getPageTemplates() {
		const url = `${globalConfig.endpoint}/dev/auto/forms/page/template`
		return request('GET', url)
	},
	//新建页面
	// createPage(id, params){
	// 	const url = `${globalConfig.endpoint}/dev/auto/forms/page/${id}`
	// 	return request('POST', url, params)
	// },
	createPage(id, params) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/1/page/${id}`
		return request('POST', url, params)
	},
	//获取页面配置
	getPageConfig(id) {
		const url = `${globalConfig.endpoint}/dev/auto/preview/form?pageId=${id}`
		return request('GET', url)
	},
	//获取页面配置
	edotPageConfigModuleContainer(id, param) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/${id}/page`
		return request('PUT', url, param)
	},
	//插入组件
	insertModule(pageId, params) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/${pageId}/modules`
		return request('POST', url, params)
	},
	//删除组件
	deleteModule(pageId, params) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/${pageId}/module/op/remove`
		return request('POST', url, params)
	},
	//创建路由
	createNavRoute(pageId, params) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/${pageId}/routes`
		return request('POST', url, params)
	},
	//修改路由
	editNavRoute(pageId, params, itemIndex) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/${pageId}/routes/${itemIndex}`
		return request('PUT', url, params)
	},
	//获取路由列表
	getRouteList(id) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/${id}/routes?currentModule=0`
		return request('GET', url)
	},
	//移除路由
	delNavRoute(pageId, params) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/${pageId}/route/op/remove`
		return request('POST', url, params)
	},
	//变更路由位置
	changePosition(pageId, params) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/${pageId}/route/op/arrange`
		return request('POST', url, params)
	},
	appPageSetPageId(pageId) {
		const url = `${globalConfig.endpoint}/dev/auto/preview/current/${pageId}`
		return request('PUT', url)
	},
	//获取navlist itemModuleName
	getLowAutoComponents(params) {
		const url =
			`${globalConfig.staticEndpoint}/openapi/crud/lc_low_auto_component/lowAutoComponent/lowAutoComponents`
		return request('GET', url, params)
	},
	//修改navlist,autolist itemModuleName
	setItemModuleName(pageId, params) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/${pageId}/route/module`
		return request('POST', url, params)
	},
	getApis(params) {
		const url = `${globalConfig.staticEndpoint}/openapi/lc/apis`
		return request('GET', url, params)
	},
	setLoadApi(pageId, params) {
		const url = `${globalConfig.staticEndpoint}/dev/auto/forms/autoList/${pageId}/loadApi`
		return request('POST', url, params)
	},
	setModuleData(pageId, params) {
		const url = `${globalConfig.endpoint}/dev/auto/forms/common/moduleData/${pageId}`
		return request('POST', url, params)
	},
	getApisCategory(params) {
		const url = `${globalConfig.staticEndpoint}/openapi/lc/apis/autoApiCategory/category`
		return request('GET', url, params)
	},
	//====================== 动态页面API =======================
	// 头像编辑
	postAvatarAndName(filePath, params, name) {
		const url = `${globalConfig.endpoint}/api/oauth/avatarAndName`
		if (filePath) {
			return upLoad(url, filePath, params, name)
		} else {
			return request('POST', url, params, {
				'content-type': 'application/x-www-form-urlencoded'
			})
		}
	},

	//房屋买卖》》》
	// 买卖列表
	getHouseBuySellList(pageNum) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction?pageNum=${pageNum}`
		return request('GET', url)
	},
	// 房屋买卖详情
	getHouseBuySellDetails(id) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction/${id}`
		return request('GET', url)
	},
	// 出售房屋
	postHouseSell(params) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction`
		return request('POST', url, params)
	},
	// 购买意向请求
	postHouseBuy(params) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction`
		return request('POST', url, params)
	},
	// 获取户型
	getNominalHouseTypeList() {
		const url = `${globalConfig.endpoint}/api/u/house/baseInfo/houseType/name`
		return request('GET', url)
	},
	// 获取期数
	getAllIssue() {
		const url = `${globalConfig.endpoint}/api/u/house/baseInfo/issue`
		return request('GET', url)
	},
	// 根据期数获取楼栋号
	getBuildingCodeByIssue(issue) {
		const url = `${globalConfig.endpoint}/api/u/house/baseInfo/building/issue/${issue}`
		return request('GET', url)
	},
	// 根据楼栋获取单元号
	getUnitByBuilding(buildingId) {
		const url = `${globalConfig.endpoint}/api/u/house/baseInfo/unit/${buildingId}`
		return request('GET', url)
	},
	// 增加意向
	postTransactionInrention(transactionId) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransactionIntention/${transactionId}`
		return request('POST', url)
	},
	// 用户取消意向
	cancelIntention(transactionId) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransactionIntention/${transactionId}`
		return request('DELETE',url)
	},
	// 获取全部出售价格
	getPriceList() {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction/priceList`
		return request('GET', url)
	},
	// 获取某个记录下的所有关注用户
	getTransactionUser(transactionId) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransactionIntention/${transactionId}`
		return request('GET', url)
	},
	// 获取我的记录
	getMyRecord() {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction/myTransactions`
		return request('GET', url)
	},
	// 关闭或开启我的某条记录
	postSwitchMyRecord(transacitonId, params) {
		const url =
			`${globalConfig.endpoint}/api/u/house/houseAssetTransaction/updateTransactionDisplay/${transacitonId}`
		return request('POST', url, params)
	},
	// 销售获取所有记录 /api/u/house/houseAssetTransaction/sales
	getHouseBuySellListSales(pageNum) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction/sales?pageNum=${pageNum}`
		return request('GET', url)
	},
	// 销售删除记录
	removeTransaction(id) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction/sale/${id}`
		return request('DELETE',url)
	},
	// 用户自行删除记录
	removeTransactionOfUser(id) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction/${id}`
		return request('DELETE',url)
	},
	// 用户编辑记录
	updateTransaction(id,params) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction/${id}`
		return request('PUT',url,params)
	},
	// 用户刷新记录
	renovateTransaction(id) {
		const url = `${globalConfig.endpoint}/api/u/house/houseAssetTransaction/renovate/${id}`
		return request('PUT',url)
	},
	//《《《《《《《房屋买卖

	//提交房东认证
	postVerifiedData(params) {
		const url = `${globalConfig.endpoint}/api/u/user/authentication/commit`
		return request('POST', url, params)
	},
	//
	getLandlordApplyDetail(id) {
		const url = `${globalConfig.endpoint}/api/u/user/authentication/${id}`
		return request('GET', url)
	},

	// 获取便民服务列表
	getFacilitatepeoples(pageNum, search) {
		const url =
			`${globalConfig.endpoint}/api/u/house/operations/facilitate-people?pageNum=${pageNum}&search=${search}`
		return request('GET', url)
	},
	// 管理员 - 获取便民服务列表
	getManagementFacilitatePeoples(pageNum,search) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people/management?pageNum=${pageNum}&search=${search}`
		return request('GET',url)
	},
	// 管理员 - 添加便民服务
	postSaveFacilitatePeople(params) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people`
		return request('POST',url,params)
	},
	// 管理员 - 关闭指定便民服务
	closeFacilitatePeople(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people/close/${id}`
		return request('PUT',url)
	},
	// 管理员 - 开启指定便民服务
	openfacilitatePeople(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people/open/${id}`
		return request('PUT',url)
	},
	// 管理员 - 更新便民服务
	updateFacilitatePeople(params) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people`
		return request('PUT',url,params)
	},
	// 管理员 - 删除便民服务
	removeFacilitatePeople(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people/${id}`
		return request('DELETE',url)
	},
	// 拨打电话前增加便民服务的拨打次数
	addFacilitatePeoPleDialFrequency(id) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people/addFrequency/${id}`
		return request('PATCH',url)
	},
	// 获取某个便民服务的评论列表
	getCommentList(id,pageNum) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people/comment/${id}?pageNum=${pageNum}`
		return request('GET',url)
	},
	// 发表评论
	publishFacilitatePeopleComment(bodyParam) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people/comment`
		return request('POST', url, bodyParam)
	},
	// 验证会否已经在该便民服务下发布过评论
	publishedComment(facilitatePeopleId) {
		const url = `${globalConfig.endpoint}/api/u/house/operations/facilitate-people/comment/published/${facilitatePeopleId}`
		return request('GET', url)
	},
	
	
	// 供应管理
	getSuppliers(pageNum) {
		const url = `${globalConfig.endpoint}/api/u/house/vender?pageNum=${pageNum}`
		return request('GET',url)
	},
	// 更新供应商信息
	updateSupplier(id,params) {
		const url = `${globalConfig.endpoint}/api/u/house/vender/${id}`
		return request('POST',url,params)
	},
	// "我的回迁房"上移下移api
	moveMyHouse(params) {
		const url = `${globalConfig.endpoint}/api/u/asset/moveHouseAsset`
		return request('PUT',url,params)
	},
	
	// 编辑 "我的回迁房" 的水电编号
	updateMyHouseWaterElectricityNumber(param) {
		const url = `${globalConfig.endpoint}/api/u/asset/house-water-electricity`
		return request('PUT',url,param)
	},
	
	// 小程序配置分组列表
	listHouseConfigGroup() {
		const url = `${globalConfig.endpoint}/api/u/house/house-config/house-config-group`
		return request('GET',url)
	},
	// 更新配置字段值
	updateConfigFieldValue(param) {
		const url = `${globalConfig.endpoint}/api/u/house/house-config/house-config`
		return request('PUT',url,param)
	}
}
