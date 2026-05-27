<template>
	<view class="msg-sys">
		
		<!-- <view :class="[`${pictureList.length > 2 ? 'flex_col' : 'flex_row'}`]"> -->
		<view :class="[`${checkImgListSize}`]">
			<view class="msg-sys-title">
				<view class="msg-sys-text">
					<text class="mag-sys-tag" v-if="item.tag">
						{{item.tag}}
					</text>
					{{item.title||'-'}}
				</view>
				
				<view class="msg-sys-footer" v-if="item.createTimeStr">
					<view class="msg-sysy-subTitle">{{item.createTimeStr}}</view>
					<view class="msg_sys_icon_play">
						<image :src="view" :style="{width:'35rpx',height:'35rpx'}" />
						<text class="star">{{_get(item,'viewNumber') || 0}}</text>
					</view>
				</view>
			</view>
			
			<!-- tmp1 -->
			<view v-if="pictureList.length >= 2  && themeType === 1" class="grid_content" id="grid_content">
				<image v-for="(item, index) in pictureList" :key="index" :style="{height:`${gridItemSize}px`}" :src="handlePictureUrl(item)" mode="" v-if="index < 3" />
				<!-- <image :style="{height:`${gridItemSize}px`}" :src="handlePictureUrl(pictureList[1])" mode="" />
				<image :style="{height:`${gridItemSize}px`}" :src="handlePictureUrl(pictureList[2])" mode="" /> -->
			</view>
			<!-- tmp2 -->
			<view v-else-if="pictureList.length > 2 && themeType === 2" class="flex_row">
				<view style="flex: 2;margin: 0px 3px 0px 0px;">
					<image class="big_img" :src="handlePictureUrl(pictureList[0])" mode="scaleToFill" />
				</view>
				<view class="flex_col" style="flex: 1;">
					<image class="small_img" style="margin-bottom: 3px;" :src="handlePictureUrl(pictureList[1])" mode="widthFix" />
					<image class="small_img" :src="handlePictureUrl(pictureList[2])" mode="widthFix" />
				</view>
			</view>
			<!-- default -->
			<view v-else-if="pictureList.length > 0" class="msg-sys-img">
				<image :src="handlePictureUrl(pictureList)" />
			</view>
			
		</view>
		
		<view class="tags" v-if="item.tags">
			<view class="tag-item" v-for="(tagItem, tagIndex) in convertTags(item.tags)" :key="tagIndex">
				{{tagItem}}
			</view>
		</view>
		
	</view>
</template>

<script>
	import _ from 'lodash'
	export default {
		name:"messageItem",
		props:{
			item:Object,
		},
		data(){
			return {
				imgPath:'',
				view: `${this.$config.staticEndpoint}/house/2022/image/home/view.svg`,
				pictureList:[],
				themeType: 1, //pictureList三张图片排列风格 
				gridItemSize: 0
			}
		},
		computed:{
			init(){
				if([undefined, null].includes(this.item.themeType)){
					this.themeType = 1
				}else{
					this.themeType = this.item.themeType
				}
			},
			checkImgListSize(){
				if(this.item.pictureUrl){
					const pList = JSON.parse(this.item.pictureUrl)
					if(pList.length > 0){
						if(this.item.pictureUrl.indexOf('url')!= -1){
							this.pictureList = pList.map(item => {
								return item = item.url
							})
						}else{
							this.pictureList = pList
						}
						
						if(pList.length >= 2 && this.themeType > 0){
							return 'flex_col'
						}else{
							return 'flex_row'
						}
					} 
				}
				return 'flex_row'
			}
		},
		mounted() {				
			this.getImgListTotalWith()
		},
		methods:{
			// 获取对象中的属性
			_get(data, field, defaultValue) {
				return _.get(data, field, defaultValue) || ''
			},
			handlePictureUrl(url){
				if(!url || url.length < 0 ){
					return ''
				}
				let imgUrl = url
				if(Array.isArray(url)){
					imgUrl = url[0]
				}
				return `${this.$config.endpoint}${imgUrl}`
			},
			getImgListTotalWith(){
				this.getElementData(`#grid_content`, (data)=> {
						
					if(data && data.length){
						this.gridItemSize = Number((data[0].width-8)/3)
					}
				})
			},
			getElementData(el, callback){
				uni.createSelectorQuery().in(this).selectAll(el).boundingClientRect().exec((data) => {
					callback(data[0]);
				});
			},
			convertTags(listString){
				if(listString){
					if(listString.indexOf(',') != -1){
						const ls = []
						listString.split(',').map(item => {
							ls.push(item)
						})
						return ls
					}else{
						return [listString]
					}
				}else{
					return []
				}
			}
		}
	}
</script>

<style lang='scss'>
	
	.msg-sys{
		display: flex;
		flex-direction: column;
		border-radius: 16rpx;
		/* background-color: rgba(230, 230, 230, 0.4); */
		padding: 12rpx;
		/* margin-bottom: 20rpx; */
		
		
		.grid_content{
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-column-gap: 4px;
			image{
				background-color: #ffffff;
				width: 100%;
				/* height: 75px; */
			}
		}
		
		.flex_row {
			display: flex;
			flex-direction: row;
		}
		
		.flex_col{
			display: flex;
			flex-direction: column;
		}
		
		.msg-sys-text {
			flex:1;
			min-height: 50px;
			font-size: 32rpx;
			color: rgba(39, 40, 50, 1);
			/* padding: 18rpx; */
			overflow: hidden;
			display: -webkit-box; 
			text-overflow: ellipsis;
			word-break:break-all; 
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
		}
		
		.mag-sys-tag {
			min-width: 22px;
			height: 15px;
			padding: 2px 7px;
			border-radius: 3px;
			background-color: #56C0F6;
			color: #ffffff;
			font-size: 22rpx;
			margin-right: 5px;
		}
		
		.msg-sys-title {
			flex: 1;
			display: flex;
			padding: 0rpx 12rpx 0rpx 8rpx;
			flex-direction: column
		}
		
		.msg-sysy-subTitle {
			color: #a5a5a5;
			font-size: 28rpx;
			padding: 10rpx;
		}
		
		.msg_sys_icon_play {
			display: flex;
			flex-direction: row;
			align-items: center;
		}
		
		.star {
			display: inline-block;
			padding-left: 8rpx;
			margin-left: 2px; 
			color:#a5a5a5; 
			font-size: 28rpx;
		}
		
		.big_img{
			width: 100%;
			height: 100%;
			background-color: #ffffff;
		}
		
		.small_img{
			flex: 1;
			width: auto;
			height: 32px;
			background-color: #ffffff;
		}
		
		.msg-sys-img{
			/* width: 40%; */
			image{
				width: 150rpx;
				height: 150rpx;
				border-radius: 16rpx;
			}
		}
		
		.msg-sys-img-list{
			display: flex;
			flex-direction: column;
			image{
				flex: 1;
				width: 100%;
			}
		}
		
		.msg-sys-content {
			display: flex; 
			flex-direction: column; 
			margin-bottom: 20rpx;
			
			.content-item {
				display: flex; 
				flex-direction: row; 
				padding: 6rpx 24rpx;
			}
			
			/* .content-label {
				font-size: 28rpx;
				color: rgba(39, 40, 50, 0.8);
				padding-right: 8rpx;
			} */
			
			.content-text {
				font-size: 28rpx;
				color: rgba(39, 40, 50,0.8);
				font-weight: 550 ;
			}
		}
		
		.msg-sys-footer{
			display: flex;
			flex-direction: row;
			justify-content: space-between;
		}
		
		.tags {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			padding: 6px 0px;
			
			.tag-item {
				padding: 4px 8px;
				border: 2px solid #CED4D9;
				border-radius: 20px;
				color: #788896;
				margin-right: 6px;
				font-size: 13px;
				font-weight: bold;
			}
			
		}
	}
</style>