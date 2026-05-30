<template>
  <view class="page">
    <SNavBar title="退费审核" :showBack="true" fallbackUrl="/pages/finance/home/index" />
    <StatusTabs tabGroup="financeRefund" :tabs="tabs" :modelValue="activeTab" @change="onTabClick" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="activeTab + '-' + filterVersion + '-' + item.uid" @click="goDetail(item)">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico" :style="{ background: item.bg, color: item.iconColor }">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.sid }} · {{ item.className }} · {{ item.type }}</text>
                <text class="li-desc">{{ item.reason }}</text>
              </view>
              <SBadge :color="item.listBadgeColor">{{ item.listStatusLabel }}</SBadge>
              <text class="li-arrow">›</text>
            </view>
          </view>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="暂无退费申请" />
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
import { buildRefundTabs, filterRefundByTab, getLastBusinessChange, getRefundList, getRefundTabIndex, refundStatusMeta } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

const REFUND_KEY_MAP = ['pending', 'processing', 'completed']

export default {
  name: 'FinanceRefund',
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
      return buildRefundTabs(this.list).map((tab, i) => ({
        ...tab,
        key: REFUND_KEY_MAP[i] || `tab-${i}`
      }))
    },
    filteredList() {
      const idx = REFUND_KEY_MAP.indexOf(this.activeTab)
      return filterRefundByTab(this.list, idx >= 0 ? idx : 0)
    },
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'refunds') this.refresh(true)
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  async onShow() {
    this.filterVersion++
    try { uni.removeStorageSync('staff_back_target') } catch (e) { /* ignore */ }
    this.refresh(true)
    this.activeTab = getActiveKey('financeRefund', 'pending')
  },
  methods: {
    onTabClick(key) {
      if (this.activeTab === key) return
      this.activeTab = key
      this.filterVersion++
      setActiveKey('financeRefund', key)
    },
    refresh(syncChangedTab = false) {
      this.list = getRefundList().map(item => {
        const meta = refundStatusMeta[item.status] || {}
        return {
          ...item,
          bg: `var(--${meta.color || 'wa'}-bg)`,
          iconColor: `var(--${meta.color || 'wa'})`
        }
      })
      if (syncChangedTab) this.syncActiveTabFromLastChange()
    },
    syncActiveTabFromLastChange() {
      const change = getLastBusinessChange('refunds')
      const token = change ? `${change.uid}-${change.status}-${change.time}` : ''
      if (!change || token === this.lastSyncedChange) return
      this.lastSyncedChange = token
      const item = this.list.find(i => i.uid === change.uid) || change
      const idx = getRefundTabIndex(item)
      const key = REFUND_KEY_MAP[idx] || 'pending'
      this.activeTab = key
      setActiveKey('financeRefund', key)
    },
    goDetail(item) {
      rememberStaffBackTarget('/pages/finance/refund/index')
      uni.navigateTo({ url: `/pages/finance/refund-review/index?uid=${item.uid}` })
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
.li-desc { font-size: var(--fs-11); color: var(--N600); display: block; margin-top: 4rpx; line-height: 1.4; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
