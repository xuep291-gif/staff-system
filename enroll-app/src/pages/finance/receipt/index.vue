<template>
  <view class="page">
    <SNavBar title="票据管理" :showBack="true" fallbackUrl="/pages/finance/home/index" />

    <!-- Search Bar -->
    <view class="search-bar">
      <input
        class="search-input"
        v-model.trim="keyword"
        placeholder="学号 / 票据编号 / 姓名"
        confirm-type="search"
      />
      <view class="search-clear" v-if="keyword" @click="keyword = ''">
        <text>✕</text>
      </view>
    </view>

    <!-- Tabs -->
    <StatusTabs tabGroup="financeReceipt" :tabs="tabs" :modelValue="activeTab" @change="onTabClick" />

    <scroll-view scroll-y class="body">
      <SEmpty v-if="!filteredList.length" :text="emptyText" />

      <view class="receipt-list" v-for="item in filteredList" :key="activeTab + '-' + filterVersion + '-' + item.id">
        <view class="receipt-card" @tap="goDetail(item)">
          <view class="card-top">
            <view class="avatar" :style="{ background: avatarBg(item) }">
              <text :style="{ color: avatarColor(item) }">{{ item.name.charAt(0) }}</text>
            </view>
            <view class="card-info">
              <view class="info-top-row">
                <text class="info-name">{{ item.name }}</text>
                <text class="info-no">{{ item.studentNo }}</text>
              </view>
              <text class="info-receipt-no">票据号：{{ item.receiptNo }}</text>
              <text class="info-meta">{{ item.receiptType }} · ¥{{ fmt(item.amount) }}</text>
            </view>
            <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
          </view>
          <view class="card-bottom" v-if="item.status !== 'pending'">
            <text class="bottom-text">{{ item.status === 'voided' ? '作废于 ' + item.voidTime : '补打于 ' + item.reprintTime }}</text>
            <text class="bottom-count" v-if="item.status === 'reprinted'">已补打 {{ item.reprintCount }}/{{ item.maxReprint }} 次</text>
          </view>
        </view>
      </view>
      <view class="body-foot" />
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { getReceiptList } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

const TABS = [
  { key: 'pending', label: '待处理' },
  { key: 'reprinted', label: '已补打' },
  { key: 'voided', label: '已作废' }
]

export default {
  name: 'FinanceReceipt',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return { activeTab: 'pending', filterVersion: 0, keyword: '', list: [] }
  },
  computed: {
    tabs() {
      const counts = {}
      this.list.forEach(item => { counts[item.status] = (counts[item.status] || 0) + 1 })
      return TABS.map(t => ({ key: t.key, label: t.label, count: counts[t.key] || 0 }))
    },
    filteredList() {
      let items = this.list.filter(item => item.status === this.activeTab)
      if (this.keyword) {
        const kw = this.keyword.trim().toLowerCase()
        items = items.filter(item =>
          String(item.studentNo || '').toLowerCase().includes(kw) ||
          String(item.receiptNo || '').toLowerCase().includes(kw) ||
          String(item.name || '').toLowerCase().includes(kw)
        )
      }
      return items
    },
    emptyText() {
      const map = { pending: '当前暂无待处理票据', reprinted: '暂无已补打票据', voided: '暂无已作废票据' }
      return map[this.activeTab] || '暂无票据记录'
    }
  },
  onShow() { this.filterVersion++; this.refresh() },
  methods: {
    refresh() { this.list = getReceiptList() },
    fmt(v) { const n = Number(v); return isNaN(n) ? '0' : n.toLocaleString() },
    avatarBg(item) {
      const map = { pending: 'var(--wa-bg)', reprinted: 'var(--ok-bg)', voided: 'var(--er-bg)' }
      return map[item.status] || 'var(--in-bg)'
    },
    avatarColor(item) {
      const map = { pending: 'var(--wa)', reprinted: 'var(--ok)', voided: 'var(--er)' }
      return map[item.status] || 'var(--in)'
    },
    onTabClick(key) { if (this.activeTab === key) return; this.activeTab = key; this.filterVersion++ },
    goDetail(item) {
      rememberStaffBackTarget('/pages/finance/receipt/index')
      uni.navigateTo({ url: '/pages/finance/receipt-detail/index?id=' + item.id })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
  display: flex;
  flex-direction: column;
}

/* ── Search ── */
.search-bar {
  padding: 16rpx 28rpx;
  position: relative;
  flex-shrink: 0;
}
.search-input {
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: var(--r-8);
  background: var(--white);
  font-size: var(--fs-13);
  color: var(--N900);
  box-shadow: var(--card-shadow-low);
}
.search-input::placeholder { color: var(--N400); }
.search-clear {
  position: absolute;
  right: 44rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  border-radius: var(--r-full);
  background: var(--N200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-11);
  color: var(--N600);
}

/* ── Body ── */
.body { flex: 1; min-height: 0; }
.body-foot { height: 48rpx; }
.receipt-list { padding: 0 28rpx; }

/* ── Card ── */
.receipt-card {
  background: var(--white);
  border-radius: var(--r-12);
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: var(--card-shadow-low);
}
.receipt-card:active { background: var(--N25); }
.card-top {
  display: flex;
  align-items: center;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-20);
  font-weight: 700;
  flex-shrink: 0;
  margin-right: 20rpx;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.info-top-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.info-name {
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--N900);
}
.info-no {
  font-size: var(--fs-12);
  color: var(--N500);
}
.info-receipt-no {
  font-size: var(--fs-10);
  color: var(--N400);
  font-family: monospace;
  display: block;
  margin-top: 4rpx;
}
.info-meta {
  font-size: var(--fs-11);
  color: var(--N500);
  display: block;
  margin-top: 4rpx;
}
.card-bottom {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid var(--N50);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bottom-text {
  font-size: var(--fs-10);
  color: var(--N400);
}
.bottom-count {
  font-size: var(--fs-10);
  color: var(--in);
  font-weight: 600;
}
</style>
