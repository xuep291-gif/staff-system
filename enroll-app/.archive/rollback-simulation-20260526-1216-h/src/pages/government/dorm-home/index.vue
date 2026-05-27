<template>
  <view class="page">
    <SNavBar title="换房审批" :showBack="true" />
    <STabs v-model="activeTab" :tabs="tabs" />
    <scroll-view scroll-y class="body">
      <view class="list">
        <view class="item" v-for="item in filteredList" :key="item.uid" @click="goReview(item)">
          <view class="avatar">{{ item.avatar || item.name.charAt(0) }}</view>
          <view class="main">
            <view class="top">
              <text class="name">{{ item.name }}</text>
              <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
            </view>
            <text class="meta">{{ item.id }} · {{ item.from }} -> {{ item.to }}</text>
            <text class="reason">{{ item.reason }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="当前状态暂无换房申请" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import STabs from '@/components/shared/STabs.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { buildDormReviewTabs, filterDormReviewByTab, getDormReviewList } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'GovernmentDormHome',
  components: { SNavBar, STabs, SBadge, SEmpty },
  data() {
    return { activeTab: 0, list: [] }
  },
  computed: {
    tabs() {
      return buildDormReviewTabs(this.list)
    },
    filteredList() {
      return filterDormReviewByTab(this.list, this.activeTab)
    }
  },
  onShow() {
    const source = getDormReviewList('roomChanges')
    this.list = source.map(item => ({
      ...item,
      from: item.oldDorm || item.from,
      to: item.targetDorm || item.to
    }))
  },
  methods: {
    goReview(item) {
      rememberStaffBackTarget('/pages/government/dorm-home/index')
      uni.navigateTo({ url: `/pages/government/dorm-review/index?uid=${item.uid}&apiId=${item.applicationId || item.uid}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.list { padding: 28rpx; display: flex; flex-direction: column; }
.list > * + * { margin-top: 20rpx; }
.item { display: flex; align-items: center; padding: 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); }
.avatar { width: 80rpx; height: 80rpx; border-radius: var(--r-full); background: var(--brand-t); color: var(--brand-d); display: flex; align-items: center; justify-content: center; font-size: var(--fs-14); font-weight: 600; flex-shrink: 0; }
.main { flex: 1; min-width: 0; margin-left: 24rpx; }
.top { display: flex; align-items: center; justify-content: space-between; }
.name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); }
.meta, .reason { display: block; font-size: var(--fs-12); color: var(--N500); margin-top: 8rpx; }
.reason { color: var(--N400); }
.arrow { font-size: var(--fs-18); color: var(--N400); margin-left: 16rpx; flex-shrink: 0; }
</style>
