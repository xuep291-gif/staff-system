<template>
  <view class="page">
    <SNavBar title="助学金审核" :showBack="true" fallbackUrl="/pages/finance/home/index" />
    <StatusTabs tabGroup="financePayoutAid" :tabs="tabs" :modelValue="activeTab" @change="onTabClick" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="activeTab + '-' + filterVersion + '-' + item.uid" @click="goDetail(item.uid)">
          <view class="card-bd">
            <view class="li">
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.college }}</text>
                <text class="li-amount">¥{{ item.amount }} · {{ item.type }}</text>
              </view>
              <text class="li-arrow">›</text>
            </view>
          </view>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="暂无补助打款任务" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import { getActiveKey, setActiveKey } from '@/utils/tabState.js'
import SEmpty from '@/components/shared/SEmpty.vue'
import { FINANCE_AID_TAB_GROUPS, getLastBusinessChange, getReviewList, matchesStatusGroup, statusMeta as reviewStatusMeta } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

const REVIEW_KEY_MAP = ['pending', 'processing', 'completed']

export default {
  name: 'FinancePayoutAid',
  components: { SNavBar, StatusTabs, SEmpty },
  data() {
    return { activeTab: 'pending', filterVersion: 0, list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return FINANCE_AID_TAB_GROUPS.map((group, i) => ({
        label: group.label,
        count: this.list.filter(item => matchesStatusGroup(item, group.statuses)).length,
        color: group.color,
        key: REVIEW_KEY_MAP[i] || `tab-${i}`
      }))
    },
    filteredList() {
      const idx = REVIEW_KEY_MAP.indexOf(this.activeTab)
      const group = FINANCE_AID_TAB_GROUPS[idx] || FINANCE_AID_TAB_GROUPS[0]
      return this.list.filter(item => matchesStatusGroup(item, group.statuses))
    }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'aids') this.refresh(true)
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
    this.activeTab = getActiveKey('financePayoutAid', 'pending')
  },
  methods: {
    onTabClick(key) { if (this.activeTab === key) return; this.activeTab = key; this.filterVersion++; setActiveKey('financePayoutAid', key) },
    refresh(syncChangedTab = false) {
      const rows = getReviewList('aids')
      this.list = rows.map(item => ({
        ...item,
        badgeColor: reviewStatusMeta[item.status]?.color || item.badgeColor
      }))
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('aids')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const status = change.status
      let key = 'pending'
      if (status === 'payment_pending') key = 'pending'
      else if (['first_pass', 'review_pass', 'final_pass'].includes(status)) key = 'processing'
      else key = 'completed'
      this.activeTab = key
      setActiveKey('financePayoutAid', key)
    },
    goDetail(uid) {
      rememberStaffBackTarget('/pages/finance/payout-aid/index')
      uni.navigateTo({ url: `/pages/finance/aid-review/index?uid=${uid}` })
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
.li-info { flex: 1; min-width: 0; }
.li-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.li-meta { font-size: var(--fs-11); color: var(--N500); display: block; margin-top: 4rpx; }
.li-amount { font-size: var(--fs-11); color: var(--brand); display: block; margin-top: 4rpx; font-weight: 500; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
