<template>
  <view class="page">
    <SNavBar title="学工处贷款审批" :showBack="true" fallbackUrl="/pages/government/home/index" />
    <StatusTabs tabGroup="govLoanFinalHome" :tabs="tabs" @change="onTabClick" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="filterVersion + '-' + item.uid" @click="goReview(item)">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico" :style="{ background: item.bg, color: item.iconColor }">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.college }}</text>
                <text class="li-amount">¥{{ item.amount }} · {{ item.type }}</text>
              </view>
              <SBadge :color="item.listBadgeColor">{{ item.listStatusLabel }}</SBadge>
              <text class="li-arrow">›</text>
            </view>
          </view>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="暂无贷款记录" />
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
import { getLastBusinessChange, getReviewList, REVIEW_STATUS, statusMeta as reviewStatusMeta } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'GovernmentLoanFinalHome',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return { activeTab: 'pending', filterVersion: 0, list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return [
        { key: 'pending', label: '待审批', count: this.list.filter(i => i.status === REVIEW_STATUS.REVIEW_PASS).length },
        { key: 'processing', label: '审批中', count: this.list.filter(i => i.status === REVIEW_STATUS.FINAL_PASS).length },
        { key: 'completed', label: '已完结', count: this.list.filter(i => [REVIEW_STATUS.PAYMENT_PENDING, REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED, REVIEW_STATUS.REJECTED].includes(i.status)).length }
      ]
    },
    filteredList() {
      const labelMap = {
        pending: ['待审批', 'wa'],
        processing: ['审批中', 'in'],
        completed: ['已完结', 'ok']
      }
      const [label, color] = labelMap[this.activeTab] || ['', 'wa']
      let rows
      if (this.activeTab === 'pending') rows = this.list.filter(i => i.status === REVIEW_STATUS.REVIEW_PASS)
      else if (this.activeTab === 'processing') rows = this.list.filter(i => i.status === REVIEW_STATUS.FINAL_PASS)
      else rows = this.list.filter(i => [REVIEW_STATUS.PAYMENT_PENDING, REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED, REVIEW_STATUS.REJECTED].includes(i.status))
      return rows.map(item => ({ ...item, listStatusLabel: label, listBadgeColor: color }))
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
    this.activeTab = getActiveKey('govLoanFinalHome', 'pending')
  },
  methods: {
    onTabClick(key) {
      this.activeTab = key
      setActiveKey('govLoanFinalHome', key)
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
      const key = item.status === REVIEW_STATUS.REVIEW_PASS ? 'pending' : item.status === REVIEW_STATUS.FINAL_PASS ? 'processing' : 'completed'
      setActiveKey('govLoanFinalHome', key)
    },
    goReview(item) {
      rememberStaffBackTarget('/pages/government/loan-final-home/index')
      if (this.activeTab === 'pending' && item.status !== REVIEW_STATUS.REVIEW_PASS) return
      uni.navigateTo({ url: '/pages/government/loan-final-review/index?uid=' + item.uid + '&status=' + item.status })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }

.sc { padding: 20rpx 28rpx 28rpx; display: flex; flex-direction: column; }
.sc > view + view { margin-top: 20rpx; }
.card { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden; }
.card-bd { padding: var(--card-body-padding); }
.li { display: flex; align-items: center; }
.li > view + view { margin-left: 20rpx; }
.li-ico { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: var(--fs-16); font-weight: 600; flex-shrink: 0; }
.li-info { flex: 1; min-width: 0; }
.li-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.li-meta { font-size: var(--fs-11); color: var(--N500); display: block; margin-top: 4rpx; }
.li-amount { font-size: var(--fs-11); color: var(--brand); display: block; margin-top: 4rpx; font-weight: 500; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
