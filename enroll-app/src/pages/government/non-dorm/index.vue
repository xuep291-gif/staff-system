<template>
  <view class="page">
    <SNavBar title="校外住宿审核" :showBack="true" />
    <STabs v-model="activeTab" :tabs="tabs" storage-key="government-non-dorm" @change="selectTab" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="item.uid" @click="goReview(item)">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.address }}</text>
              </view>
              <SBadge :color="item.listBadgeColor">{{ item.listStatusLabel }}</SBadge>
              <text class="li-arrow">&#8250;</text>
            </view>
          </view>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="当前状态暂无校外住宿申请" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import STabs from '@/components/shared/STabs.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { buildDormReviewTabs, filterDormReviewByTab, getDormReviewList, getLastBusinessChange } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

function getTabIndex(item) {
  const status = item.status || item.filterKey
  if (status === 'approved') return 1
  if (status === 'rejected') return 2
  return 0
}

export default {
  name: 'GovernmentNonDorm',
  components: { SNavBar, STabs, SBadge, SEmpty },
  data() {
    return { activeTab: 0, list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return buildDormReviewTabs(this.list)
    },
    filteredList() {
      return filterDormReviewByTab(this.list, this.activeTab)
    }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'nonDorm') this.refresh(true)
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
      this.list = getDormReviewList('nonDorm')
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('nonDorm')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const item = this.list.find(i => i.uid === change.uid) || change
      this.activeTab = getTabIndex(item)
    },
    goReview(item) {
      rememberStaffBackTarget('/pages/government/non-dorm/index')
      uni.navigateTo({ url: '/pages/government/non-dorm-review/index?uid=' + item.uid })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.sc { padding: 28rpx; display: flex; flex-direction: column; }
.sc > * + * { margin-top: 20rpx; }
.card { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden; }
.card-bd { padding: var(--card-body-padding); }
.li { display: flex; align-items: center; }
.li > * + * { margin-left: 20rpx; }
.li-ico { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--ac-t); color: var(--ac); display: flex; align-items: center; justify-content: center; font-size: var(--fs-16); font-weight: 600; flex-shrink: 0; }
.li-info { flex: 1; min-width: 0; }
.li-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.li-meta { font-size: var(--fs-11); color: var(--N500); display: block; margin-top: 4rpx; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
