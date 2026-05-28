<template>
  <view class="page">
    <SNavBar title="助学贷款" :showBack="true" fallbackUrl="/pages/teacher/home/index" />
    <StatusTabs tabGroup="teacherLoanHome" :tabs="tabs" @change="onTabClick" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="filterVersion + '-' + item.uid" @click="goDetail(item)">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico" :style="{ background: item.bg, color: item.iconColor }">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.college }}</text>
                <text class="li-amount">申请金额：¥{{ item.amount }}</text>
              </view>
              <SBadge :color="item.listBadgeColor">{{ item.listStatusLabel }}</SBadge>
              <text class="li-arrow">›</text>
            </view>
          </view>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="暂无贷款申请" />
      </view>
    </scroll-view>
  </view>
</template>
<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import { getActiveKey, setActiveKey } from '@/utils/tabState.js'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { buildReviewTabs, filterReviewByTab, getLastBusinessChange, getReviewList, getReviewTabIndex, statusMeta as reviewStatusMeta } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

const REVIEW_KEY_MAP = ['pending', 'processing', 'completed']

export default {
  name: 'TeacherLoanHome',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return {
      activeTab: 'pending',
      filterVersion: 0,
      list: [],
      lastSyncedChange: ''
    }
  },
  computed: {
    tabs() {
      return buildReviewTabs(this.list, 'teacher').map((tab, i) => ({
        ...tab,
        key: REVIEW_KEY_MAP[i] || `tab-${i}`
      }))
    },
    filteredList() {
      const idx = REVIEW_KEY_MAP.indexOf(this.activeTab)
      return filterReviewByTab(this.list, 'teacher', idx >= 0 ? idx : 0)
    }
  },
  watch: {
    activeTab() { this.filterVersion++ }
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
    this.filterVersion++
    try { uni.removeStorageSync('staff_back_target') } catch (e) { /* optional */ }
    this.refresh(true)
    this.activeTab = getActiveKey('teacherLoanHome', 'pending')
  },
  methods: {
    onTabClick(key) {
      console.log('[loan-home] onTabClick key=', key)
      this.activeTab = key
      setActiveKey('teacherLoanHome', key)
    },
    refresh(syncChangedTab = false) {
      const rows = getReviewList('loans')
      this.list = rows.map(item => ({
        ...item,
        badgeColor: reviewStatusMeta[item.status]?.color || item.badgeColor,
        bg: `var(--${reviewStatusMeta[item.status]?.color || 'wa'}-bg)`,
        iconColor: `var(--${reviewStatusMeta[item.status]?.color || 'wa'})`
      }))
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('loans')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const item = this.list.find(i => i.uid === change.uid) || change
      const idx = getReviewTabIndex(item, 'teacher')
      setActiveKey('teacherLoanHome', REVIEW_KEY_MAP[idx] || 'pending')
    },
    goDetail(item) {
      rememberStaffBackTarget('/pages/teacher/loan-home/index')
      uni.navigateTo({ url: '/pages/teacher/loan-review/index?uid=' + item.uid })
    }
  }
}
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }

.sc { padding: 20rpx 28rpx 28rpx; display: flex; flex-direction: column; }
.sc > * + * { margin-top: 20rpx; }
.card { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden; }
.card-bd { padding: var(--card-body-padding); }
.li { display: flex; align-items: center; }
.li > * + * { margin-left: 20rpx; }
.li-ico { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: var(--fs-16); font-weight: 600; flex-shrink: 0; }
.li-info { flex: 1; min-width: 0; }
.li-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.li-meta { font-size: var(--fs-11); color: var(--N500); display: block; margin-top: 4rpx; }
.li-amount { font-size: var(--fs-11); color: var(--brand); display: block; margin-top: 4rpx; font-weight: 500; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
