<template>
  <view class="page">
    <SNavBar title="申请处理" :showBack="true" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="(item, i) in list" :key="i">
          <view class="card-bd">
            <view class="li">
              <view class="li-bar" :style="{ background: item.barColor }" />
              <view class="li-info">
                <text class="li-name">{{ item.title }}</text>
                <text class="li-meta">{{ item.desc }}</text>
              </view>
              <SBadge :color="item.badgeColor">{{ item.count }}</SBadge>
              <text class="li-arrow">›</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
export default {
  name: 'GovernmentAppProcess',
  components: { SNavBar, SBadge },
  data() {
    return {
      list: [
        { title: '宿舍报修申请', desc: '3 条待处理申请', barColor: 'var(--wa)', badgeColor: 'wa', count: 3 },
        { title: '调换宿舍申请', desc: '2 条待处理申请', barColor: 'var(--er)', badgeColor: 'er', count: 2 },
        { title: '特殊事项申请', desc: '1 条待处理申请', barColor: 'var(--in)', badgeColor: 'in', count: 1 }
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.sc { padding: 28rpx; display: flex; flex-direction: column; }
.sc > view + view { margin-top: 20rpx; }
.card { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden; }
.card-bd { padding: var(--card-body-padding); }
.li { display: flex; align-items: center; padding: 12rpx 0; }
.li > view + view { margin-left: 20rpx; }
.li-bar { width: 6rpx; height: 64rpx; border-radius: var(--r-3); flex-shrink: 0; }
.li-info { flex: 1; min-width: 0; }
.li-name { font-size: var(--fs-13); font-weight: 600; color: var(--N900); display: block; }
.li-meta { font-size: var(--fs-11); color: var(--N500); display: block; margin-top: 2rpx; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
