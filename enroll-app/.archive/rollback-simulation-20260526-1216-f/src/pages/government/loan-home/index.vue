<template>
  <view class="page">
    <SNavBar title="助学贷款复审" :showBack="true" />
    <STabs :tabs="tabs" :model-value="activeTab" storage-key="government-loan-review" @change="selectTab" />
    <scroll-view scroll-y class="body">
      <view class="list" v-if="filteredList.length">
        <SListItem v-for="item in filteredList" :key="item.uid" clickable @click="goReview(item.uid)">
          <template #avatar><view class="avatar">{{ item.avatar || item.name.charAt(0) }}</view></template>
          <view class="row-main">
            <view class="row-top">
              <text class="name">{{ item.name }}</text>
              <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
            </view>
            <text class="meta">{{ item.sid }} · {{ item.className || '2026级1班' }}</text>
            <text class="amount">申请金额 ¥{{ item.amount }}</text>
          </view>
        </SListItem>
      </view>
      <SEmpty v-else text="当前状态暂无贷款申请" />
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import STabs from '@/components/shared/STabs.vue'
import SListItem from '@/components/shared/SListItem.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { buildReviewTabs, filterReviewByTab, getLastBusinessChange, getReviewList, getReviewTabIndex } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'GovernmentLoanHome',
  components: { SNavBar, STabs, SListItem, SBadge, SEmpty },
  data() {
    return { activeTab: 0, list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return buildReviewTabs(this.list, 'government')
    },
    filteredList() {
      return filterReviewByTab(this.list, 'government', this.activeTab)
    }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'loans') this.refresh(true)
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  async onShow() {
    this.refresh(true)
  },
  methods: {
    selectTab(index) {
      this.activeTab = Number(index) || 0
    },
    refresh(syncChangedTab = false) {
      this.list = getReviewList('loans')
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('loans')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const item = this.list.find(i => i.uid === change.uid) || change
      this.activeTab = getReviewTabIndex(item, 'government')
    },
    goReview(uid) {
      rememberStaffBackTarget('/pages/government/loan-home/index')
      uni.navigateTo({ url: `/pages/government/loan-review/index?uid=${uid}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.list { padding: 24rpx 28rpx 48rpx; display: flex; flex-direction: column; }
.list > * + * { margin-top: 20rpx; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--wa-bg); color: var(--wa); display: flex; align-items: center; justify-content: center; font-size: var(--fs-15); font-weight: 600; }
.row-main { flex: 1; min-width: 0; }
.row-top { display: flex; align-items: center; justify-content: space-between; }
.row-top > * + * { margin-left: 16rpx; }
.name { font-size: var(--fs-15); font-weight: 600; color: var(--N900); }
.meta, .amount { display: block; margin-top: 8rpx; font-size: var(--fs-12); color: var(--N500); }
.amount { color: var(--wa); font-weight: 600; }
</style>
