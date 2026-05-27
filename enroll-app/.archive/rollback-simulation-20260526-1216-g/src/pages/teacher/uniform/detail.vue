<template>
  <view class="page">
    <SNavBar title="尺码详情" :showBack="true" />
    <scroll-view scroll-y class="body" v-if="item">
      <view class="profile-card">
        <view class="avatar">{{ item.name.charAt(0) }}</view>
        <text class="name">{{ item.name }}</text>
        <text class="meta">{{ item.sid }} · {{ item.gender }}</text>
        <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
      </view>
      <SCard title="基础信息" :padding="16">
        <SInfoRow label="姓名">{{ item.name }}</SInfoRow>
        <SInfoRow label="学号">{{ item.sid }}</SInfoRow>
        <SInfoRow label="性别">{{ item.gender }}</SInfoRow>
        <SInfoRow label="联系电话">{{ item.phone }}</SInfoRow>
      </SCard>
      <SCard title="军训信息" :padding="16">
        <SInfoRow label="衣服尺码">{{ item.clothing || '未填写' }}</SInfoRow>
        <SInfoRow label="鞋码">{{ item.shoe || '未填写' }}</SInfoRow>
      </SCard>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SBadge from '@/components/shared/SBadge.vue'
import { getSizeList } from '@/utils/businessState.js'

export default {
  name: 'TeacherUniformDetail',
  components: { SNavBar, SCard, SInfoRow, SBadge },
  data() {
    return { item: null }
  },
  onLoad(options) {
    this.item = getSizeList().find(i => i.sid === options.sid) || getSizeList()[0]
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 48rpx; }
.profile-card { margin: 28rpx; padding: 36rpx 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); display: flex; flex-direction: column; align-items: center; }
.avatar { width: 112rpx; height: 112rpx; border-radius: 50%; background: var(--brand-t); color: var(--brand); display: flex; align-items: center; justify-content: center; font-size: var(--fs-22); font-weight: 700; }
.name { margin-top: 20rpx; font-size: var(--fs-18); color: var(--N900); font-weight: 700; }
.meta { margin: 8rpx 0 18rpx; font-size: var(--fs-12); color: var(--N500); }
</style>
