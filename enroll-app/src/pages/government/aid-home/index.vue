<template>
  <view class="page">
    <SNavBar title="助学金复审" :showBack="true" fallbackUrl="/pages/government/home/index" />
    <StatusTabs tabGroup="govAidHome" :tabs="tabs" @change="onTabClick" />
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
        <SEmpty v-if="filteredList.length === 0" text="暂无补助记录" />
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

const REVIEW_KEY_MAP = ['first_pass', 'review_pass', 'completed']

export default {
  name: 'GovernmentAidHome',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return { activeTab: 'first_pass', filterVersion: 0, list: [], lastSyncedChange: '' }
  },
  computed: {
    tabs() {
      return [
        { key: 'first_pass', label: '待学院复审', count: this.list.filter(i => i.status === REVIEW_STATUS.FIRST_PASS).length },
        { key: 'review_pass', label: '待学工处审批', count: this.list.filter(i => i.status === REVIEW_STATUS.REVIEW_PASS).length },
        { key: 'completed', label: '已完结', count: this.list.filter(i => [REVIEW_STATUS.FINAL_PASS, REVIEW_STATUS.PAYMENT_PENDING, REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED, REVIEW_STATUS.REJECTED].includes(i.status)).length }
      ]
    },
    filteredList() {
      if (this.activeTab === 'first_pass') return this.list.filter(i => i.status === REVIEW_STATUS.FIRST_PASS)
      if (this.activeTab === 'review_pass') return this.list.filter(i => i.status === REVIEW_STATUS.REVIEW_PASS)
      return this.list.filter(i => [REVIEW_STATUS.FINAL_PASS, REVIEW_STATUS.PAYMENT_PENDING, REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED, REVIEW_STATUS.REJECTED].includes(i.status))
    }
  },
  watch: {
    activeTab() { this.filterVersion++ }
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
    this.activeTab = getActiveKey('govAidHome', 'first_pass')
  },
  methods: {
    onTabClick(key) {
      this.activeTab = key
      setActiveKey('govAidHome', key)
    },
    refresh(syncChangedTab = false) {
      const rows = getReviewList('aids')
      this.list = rows.map(item => ({
        ...item,
        badgeColor: reviewStatusMeta[item.status]?.color || item.badgeColor,
        bg: `var(--${reviewStatusMeta[item.status]?.color || 'wa'}-bg)`,
        iconColor: `var(--${reviewStatusMeta[item.status]?.color || 'wa'})`
      }))
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('aids')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const item = this.list.find(i => i.uid === change.uid) || change
      const key = item.status === REVIEW_STATUS.FIRST_PASS ? 'first_pass' : item.status === REVIEW_STATUS.REVIEW_PASS ? 'review_pass' : 'completed'
      setActiveKey('govAidHome', key)
    },
    goReview(item) {
      rememberStaffBackTarget('/pages/government/aid-home/index')
      // 双重校验：item.status 必须匹配当前 tab
      if (this.activeTab === 'first_pass' && item.status !== REVIEW_STATUS.FIRST_PASS) return
      if (this.activeTab === 'review_pass' && item.status !== REVIEW_STATUS.REVIEW_PASS) return
      const page = this.activeTab === 'review_pass' ? 'aid-final-review' : 'aid-review'
      uni.navigateTo({ url: `/pages/government/${page}/index?uid=` + item.uid })
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
