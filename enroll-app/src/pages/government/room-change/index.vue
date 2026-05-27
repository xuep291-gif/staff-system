<template>
  <view class="page">
    <SNavBar title="换房审批" :showBack="true" />
    <StatusTabs v-model="activeTab" :tabs="tabs" @change="onTabChange" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="item.uid" @click="goReview(item)">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico" :style="{ background: item.bg, color: item.iconColor }">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.from }} → {{ item.to }}</text>
              </view>
              <SBadge :color="item.listBadgeColor">{{ item.listStatusLabel }}</SBadge>
              <text class="li-arrow">›</text>
            </view>
          </view>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="当前状态暂无换房申请" />
      </view>
    </scroll-view>
  </view>
</template>
<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { buildDormReviewTabs, filterDormReviewByTab, getDormReviewList, getLastBusinessChange } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

const DORM_KEY_MAP = ['pending', 'approved', 'rejected']

export default {
  name: 'GovernmentRoomChange',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return { activeTab: 'pending', list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return buildDormReviewTabs(this.list).map((tab, i) => ({
        ...tab,
        key: DORM_KEY_MAP[i] || `tab-${i}`
      }))
    },
    filteredList() {
      const idx = DORM_KEY_MAP.indexOf(this.activeTab)
      return filterDormReviewByTab(this.list, idx >= 0 ? idx : 0)
    }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'roomChanges') this.refresh(true)
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  onShow() {
    this.refresh(true)
  },
  methods: {
    onTabChange(key) {
      console.log('政务换宿切换:', key)
    },
    refresh(syncChangedTab = false) {
      this.list = getDormReviewList('roomChanges').map(item => ({
        ...item,
        from: item.oldDorm,
        to: item.targetDorm,
        bg: `var(--${item.badgeColor}-bg)`,
        iconColor: `var(--${item.badgeColor})`
      }))
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('roomChanges')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const item = this.list.find(i => i.uid === change.uid) || change
      const index = item.status === 'approved' ? 1 : item.status === 'rejected' ? 2 : 0
      this.activeTab = DORM_KEY_MAP[index] || 'pending'
    },
    goReview(item) {
      rememberStaffBackTarget('/pages/government/room-change/index')
      uni.navigateTo({ url: `/pages/government/dorm-review/index?uid=${item.uid}&apiId=${item.applicationId || item.uid}` })
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
.li-ico { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: var(--fs-16); font-weight: 600; flex-shrink: 0; }
.li-info { flex: 1; min-width: 0; }
.li-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.li-meta { font-size: var(--fs-11); color: var(--N500); display: block; margin-top: 4rpx; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
