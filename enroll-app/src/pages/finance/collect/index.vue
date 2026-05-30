<template>
  <view class="page">
    <SNavBar title="线下收款确认" :showBack="true" fallbackUrl="/pages/finance/home/index" />

    <!-- 搜索筛选栏 — 始终在顶部 -->
    <view class="filter-bar">
      <input class="search-input" v-model.trim="filters.keyword" placeholder="姓名 / 学号" />
      <picker :range="paymentMethods" :value="paymentMethodIndex" @change="onPaymentFilterChange">
        <view class="filter-picker">
          <text>{{ filters.method }}</text>
          <text class="select-arrow">›</text>
        </view>
      </picker>
    </view>

    <StatusTabs tabGroup="financeCollect" :tabs="tabs" :modelValue="activeTab" @change="onTabClick" />

    <!-- Tab 待确认 -->
    <view class="list-section" v-if="activeTab === 'pending'">
      <SEmpty v-if="!filteredPending.length" text="当前暂无待确认线下收款" />
      <view
        class="list-item"
        v-for="item in filteredPending"
        :key="item.id"
        @click="goDetail(item)"
      >
        <view class="item-left">
          <view class="avatar avatar-pending">{{ item.avatar }}</view>
          <view class="item-info">
            <view class="item-row">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-no">{{ item.studentNo }}</text>
            </view>
            <view class="item-row">
              <text class="item-meta">{{ item.method }} · {{ item.location }} · 凭证可预览</text>
            </view>
          </view>
        </view>
        <view class="item-right">
          <text class="item-time">{{ item.time }}</text>
          <text class="item-amount">¥{{ formatAmount(item.amount) }}</text>
          <SBadge color="wa">待确认</SBadge>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- Tab 已确认 -->
    <view class="list-section" v-if="activeTab === 'confirmed'">
      <SEmpty v-if="!filteredConfirmed.length" text="当前暂无已确认线下收款" />
      <view
        class="list-item"
        v-for="item in filteredConfirmed"
        :key="item.id"
        @click="goDetail(item)"
      >
        <view class="item-left">
          <view class="avatar avatar-confirmed">{{ item.avatar }}</view>
          <view class="item-info">
            <view class="item-row">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-no">{{ item.studentNo }}</text>
            </view>
            <view class="item-row">
              <text class="item-meta">{{ item.confirmPayMethod || item.collectionType }} · {{ item.confirmOperator || item.confirmedBy }} · {{ item.confirmTime }}</text>
            </view>
            <view class="item-row" v-if="item.receiptNo">
              <text class="item-receipt">收据号：{{ item.receiptNo }}</text>
            </view>
          </view>
        </view>
        <view class="item-right">
          <text class="item-amount item-amount-ok">¥{{ formatAmount(item.amount) }}</text>
          <SBadge color="ok">已确认</SBadge>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import { getActiveKey, setActiveKey } from '@/utils/tabState.js'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { getOfflineCollectionList } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'FinanceCollect',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return {
      activeTab: 'pending',
      list: [],
      paymentMethods: ['全部方式', '现金', '银行转账', 'POS机', '微信', '支付宝', '其他'],
      filters: { keyword: '', method: '全部方式' }
    }
  },
  computed: {
    tabs() {
      return [
        { key: 'pending', label: '待确认', count: this.filteredPending.length },
        { key: 'confirmed', label: '已确认', count: this.filteredConfirmed.length }
      ]
    },
    pendingList() { return this.list.filter(item => item.status === 'pending') },
    confirmedList() { return this.list.filter(item => item.status === 'confirmed') },
    filteredPending() { return applyFilter(this.pendingList, this.filters) },
    filteredConfirmed() { return applyFilter(this.confirmedList, this.filters) },
    paymentMethodIndex() { const i = this.paymentMethods.indexOf(this.filters.method); return i >= 0 ? i : 0 }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => { if (collection === 'offlineCollections') this.refresh() }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  onShow() {
    this.activeTab = 'pending'
    setActiveKey('financeCollect', 'pending')
    this.filters = { keyword: '', method: '全部方式' }
    try { uni.removeStorageSync('staff_back_target') } catch (e) { /* ignore */ }
    this.refresh()
  },
  methods: {
    refresh() { this.list = getOfflineCollectionList() },
    onTabClick(key) { this.activeTab = key },
    onPaymentFilterChange(event) { this.filters.method = this.paymentMethods[Number(event.detail.value)] || '全部方式' },
    goDetail(item) {
      rememberStaffBackTarget('/pages/finance/collect/index')
      uni.navigateTo({ url: '/pages/finance/collect-detail/index?id=' + item.id })
    },
    formatAmount(amount) { return Number(amount).toLocaleString() }
  }
}

function applyFilter(list, filters) {
  const kw = filters.keyword.trim()
  const mm = item => filters.method === '全部方式' || String(item.collectionType || item.method || '').includes(filters.method)
  const score = item => {
    if (!kw) return 0
    const vals = [
      { v: item.name, w: 10 },
      { v: item.studentNo, w: 8 },
      { v: item.className, w: 3 },
      { v: item.time, w: 1 },
      { v: item.confirmTime, w: 1 }
    ]
    return vals.reduce((s, { v, w }) => {
      const sv = String(v || '')
      if (sv === kw) return s + w * 10
      if (sv.startsWith(kw)) return s + w * 5
      if (sv.includes(kw)) return s + w
      return s
    }, 0)
  }
  return list
    .filter(item => mm(item) && (!kw || score(item) > 0))
    .sort((a, b) => score(b) - score(a))
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); padding-bottom: 48rpx; }

/* ── Filter Bar ── */
.filter-bar { padding: 16rpx 28rpx; display: flex; align-items: center; }
.filter-bar > view + view { margin-left: 16rpx; }
.search-input { flex: 1; min-width: 0; height: 72rpx; padding: 0 18rpx; border-radius: var(--r-8); background: var(--white); font-size: var(--fs-12); color: var(--N900); box-sizing: border-box; box-shadow: var(--card-shadow); }
.filter-picker { min-width: 156rpx; height: 72rpx; padding: 0 16rpx; border-radius: var(--r-8); background: var(--white); color: var(--N700); font-size: var(--fs-11); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--card-shadow); }
.select-arrow { font-size: 32rpx; color: var(--N400); }

/* ── Section ── */
.list-section { padding: 0 28rpx; }
.list-section > view + view { margin-top: 16rpx; }

.list-item { display: flex; align-items: center; justify-content: space-between; background: var(--white); border-radius: var(--r-12); padding: 24rpx; box-shadow: var(--card-shadow); }
.list-item:active { background: var(--N25); }
.item-left { display: flex; align-items: center; flex: 1; min-width: 0; }
.item-left > view + view { margin-left: 20rpx; }
.item-info { flex: 1; min-width: 0; }
.item-info > view + view { margin-top: 6rpx; }
.item-row { display: flex; align-items: center; flex-wrap: wrap; }
.item-row > view + view { margin-left: 12rpx; }

.avatar { width: 80rpx; height: 80rpx; border-radius: var(--r-full); display: flex; align-items: center; justify-content: center; font-size: var(--fs-16); font-weight: 700; color: var(--N700); flex-shrink: 0; }
.avatar-pending { background: var(--fc-t); }
.avatar-confirmed { background: var(--ok-bg); }

.item-name { font-size: var(--fs-15); font-weight: 600; color: var(--N900); }
.item-no { font-size: var(--fs-12); color: var(--N500); }
.item-meta { font-size: var(--fs-11); color: var(--N400); }
.item-right { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; margin-left: 20rpx; }
.item-right > view + view { margin-top: 8rpx; }
.item-time { font-size: var(--fs-10); color: var(--N400); }
.item-amount { font-size: 28rpx; font-weight: 600; color: var(--er); }
.item-amount-ok { color: var(--ok); }
.item-receipt { font-size: var(--fs-10); color: var(--N400); font-family: monospace; }
.item-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
