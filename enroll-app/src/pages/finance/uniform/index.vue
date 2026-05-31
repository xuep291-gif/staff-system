<template>
  <view class="page">
    <SNavBar title="军训服尺码" :showBack="true" />
    <scroll-view scroll-y class="body">
      <view class="fc">
        <text class="fc-label">全校军训服尺码汇总</text>
        <view class="stats-row">
          <view class="stat" v-for="s in sizes" :key="s.label">
            <text class="snum">{{ s.count }}</text>
            <text class="slbl">{{ s.label }}</text>
          </view>
        </view>
      </view>
      <view class="sc">
        <view class="card">
          <view class="card-hd"><text class="card-ttl">按学院统计</text></view>
          <view class="card-bd">
            <view class="li" v-for="(c, i) in colleges" :key="i">
              <text class="li-name">{{ c.name }}</text>
              <text class="li-total">共 {{ c.total }} 人</text>
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
export default {
  name: 'FinanceUniform',
  components: { SNavBar },
  data() {
    return {
      sizes: [
        { label: 'S', count: 45 }, { label: 'M', count: 128 }, { label: 'L', count: 156 }, { label: 'XL', count: 82 }, { label: 'XXL', count: 23 }
      ],
      colleges: [
        { name: '计算机学院', total: 423 },
        { name: '电子信息学院', total: 312 },
        { name: '机械工程学院', total: 289 },
        { name: '外国语学院', total: 210 }
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.fc { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); margin: 28rpx; padding: 32rpx; }
.fc-label { font-size: var(--fs-12); color: var(--N400); display: block; margin-bottom: 16rpx; }
.stats-row { display: flex; }
.stat { flex: 1; text-align: center; padding: 8rpx 0; border-right: 1px solid var(--N200); }
.stat:last-child { border-right: none; }
.snum { font-size: var(--fs-22); font-weight: 700; color: var(--brand); line-height: 1.2; display: block; }
.slbl { font-size: var(--fs-10); color: var(--N400); margin-top: 4rpx; display: block; }
.sc { padding: 0 28rpx 28rpx; }
.card { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden; }
.card-hd { padding: var(--card-header-padding); border-bottom: 1px solid var(--N50); }
.card-ttl { font-size: var(--fs-15); font-weight: 600; color: var(--N900); }
.card-bd { padding: var(--card-body-padding); }
.li { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1px solid var(--N50); }
.li:last-child { border-bottom: none; }
.li > * + * { margin-left: 16rpx; }
.li-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); }
.li-total { font-size: var(--fs-11); color: var(--N500); flex: 1; }
.li-arrow { font-size: 28rpx; color: var(--N400); }
</style>
