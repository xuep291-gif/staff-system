<template>
  <view class="page">
    <SNavBar title="收款记录查询" :showBack="true" fallbackUrl="/pages/finance/home/index" />

    <!-- Filter Bar -->
    <view class="filter-bar">
      <input
        class="search-input"
        v-model.trim="filters.keyword"
        placeholder="姓名 / 学号"
        confirm-type="search"
      />
      <picker :range="methodOptions" :value="methodIdx" @change="onMethodChange">
        <view class="filter-picker">
          <text>{{ methodOptions[methodIdx] }}</text>
          <text class="select-arrow">›</text>
        </view>
      </picker>
    </view>
    <view class="filter-row">
      <picker mode="date" :value="filters.dateFrom" @change="onDateFromChange">
        <view class="date-chip" :class="{ 'date-chip--set': !!filters.dateFrom }">
          <text>{{ filters.dateFrom || '开始日期' }}</text>
        </view>
      </picker>
      <text class="date-sep">至</text>
      <picker mode="date" :value="filters.dateTo" @change="onDateToChange">
        <view class="date-chip" :class="{ 'date-chip--set': !!filters.dateTo }">
          <text>{{ filters.dateTo || '结束日期' }}</text>
        </view>
      </picker>
      <picker :range="collegeOptions" :value="collegeIdx" @change="onCollegeChange">
        <view class="filter-chip" :class="{ 'filter-chip--on': collegeIdx > 0 }">
          <text>{{ collegeOptions[collegeIdx] }}</text>
        </view>
      </picker>
    </view>

    <!-- Stats Summary -->
    <view class="summary-bar">
      <view class="summary-item">
        <text class="summary-val">{{ filteredList.length }}</text>
        <text class="summary-lbl">记录数</text>
      </view>
      <view class="summary-item">
        <text class="summary-val ok">¥{{ fmt(totalAmount) }}</text>
        <text class="summary-lbl">收款总额</text>
      </view>
    </view>

    <StatusTabs tabGroup="financeRecords" :tabs="tabs" :modelValue="activeTab" @change="onTabClick" />

    <!-- List -->
    <scroll-view scroll-y class="body" :style="{ height: scrollH + 'px' }">
      <SEmpty v-if="!filteredList.length" text="暂无匹配收款记录" />
      <view class="card-list">
        <view
          class="record-item"
          v-for="item in filteredList"
          :key="activeTab + '-' + filterVersion + '-' + item.id"
          @click="openDetail(item)"
        >
          <view class="item-left">
            <view class="avatar" :style="{ background: avatarBg(item) }">
              <text :style="{ color: avatarColor(item) }">{{ item.studentName.charAt(0) }}</text>
            </view>
            <view class="item-info">
              <view class="info-top">
                <text class="info-name">{{ item.studentName }}</text>
                <text class="info-no">{{ item.studentNo }}</text>
              </view>
              <text class="info-meta">{{ item.college }} · {{ item.className }}</text>
              <text class="info-bill">账单：{{ item.billId }}</text>
            </view>
          </view>
          <view class="item-right">
            <text class="item-amount">¥{{ fmt(item.amount) }}</text>
            <view class="item-method">{{ item.method }} · {{ item.channel }}</view>
            <SBadge :color="item.badgeColor" customStyle="font-size: var(--fs-10); padding: 2rpx 12rpx">{{ item.statusLabel }}</SBadge>
            <text class="item-time">{{ fmtTime(item.paidAt) }}</text>
            <view v-if="item.status === 'paid'" class="confirm-pay-btn" @click.stop="onConfirmPayment(item)">
              <text>确认收款</text>
            </view>
          </view>
        </view>
      </view>
      <view class="body-foot" />
    </scroll-view>

    <!-- Detail Sheet -->
    <SBottomSheet v-model="showDetail" title="收款详情">
      <view v-if="detail" class="detail-body">
        <SInfoRow label="学生姓名">{{ detail.studentName }}</SInfoRow>
        <SInfoRow label="学号">{{ detail.studentNo }}</SInfoRow>
        <SInfoRow label="学院">{{ detail.college }}</SInfoRow>
        <SInfoRow label="班级">{{ detail.className }}</SInfoRow>
        <SInfoRow label="账单编号">{{ detail.billId }}</SInfoRow>
        <SInfoRow label="缴费金额">
          <text class="detail-amount">¥{{ fmt(detail.amount) }}</text>
        </SInfoRow>
        <SInfoRow label="支付方式">{{ detail.method }}</SInfoRow>
        <SInfoRow label="支付渠道">{{ detail.channel }}</SInfoRow>
        <SInfoRow label="支付时间">{{ detail.paidAt }}</SInfoRow>
        <SInfoRow label="操作人">{{ detail.operator }}</SInfoRow>
        <SInfoRow label="收款状态">
          <SBadge :color="detail.badgeColor">{{ detail.statusLabel }}</SBadge>
        </SInfoRow>
      </view>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import { confirmPaymentRecord, getPaymentRecordList, getStudents } from '@/utils/businessState.js'

const STATUS_TABS = [
  { key: 'all', label: '全部', color: 'brand' },
  { key: 'paid', label: '已支付', color: 'ok' },
  { key: 'confirmed', label: '已确认', color: 'ok' },
  { key: 'voided', label: '已作废', color: 'er' }
]

export default {
  name: 'FinanceRecords',
  components: { SNavBar, StatusTabs, SBadge, SEmpty, SBottomSheet, SInfoRow },
  data() {
    return {
      activeTab: 'all',
      filterVersion: 0,
      list: [],
      filters: { keyword: '', dateFrom: '', dateTo: '' },
      methodIdx: 0,
      collegeIdx: 0,
      showDetail: false,
      detail: null,
      scrollH: 400
    }
  },
  computed: {
    methodOptions() { return ['全部方式', '在线支付', '线下收款', '银行批扣', '预缴抵扣'] },
    collegeOptions() {
      const set = new Set()
      this.list.forEach(item => { if (item.college) set.add(item.college) })
      return ['全部学院', ...Array.from(set).sort()]
    },
    tabs() {
      const counts = {}
      this.filteredBase.forEach(item => {
        counts[item.status] = (counts[item.status] || 0) + 1
      })
      counts.all = this.filteredBase.length
      return STATUS_TABS.map(t => ({ key: t.key, label: t.label, count: counts[t.key] || 0, color: t.color }))
    },
    filteredBase() {
      return applyBaseFilter(this.list, this.filters, this.methodOptions[this.methodIdx], this.collegeOptions[this.collegeIdx])
    },
    filteredList() {
      if (this.activeTab === 'all') return this.filteredBase
      return this.filteredBase.filter(item => item.status === this.activeTab)
    },
    totalAmount() {
      return this.filteredList.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    }
  },
  onLoad() {
    try {
      const sys = uni.getSystemInfoSync()
      this.scrollH = sys.windowHeight - 420
    } catch (e) { this.scrollH = 500 }
    this.onBusinessStateChange = () => { this.refresh() }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  onShow() { this.filterVersion++; this.refresh() },
  methods: {
    refresh() {
      this.list = getPaymentRecordList()
      // Ensure all colleges are available
      const students = getStudents()
      this.list = this.list.map(item => {
        if (!item.college || item.college === '未知学院') {
          const s = students.find(st => st.sid === item.sid)
          if (s) {
            item.college = s.college || '计算机学院'
            item.className = s.className || '2026级1班'
          }
        }
        return item
      })
    },
    fmt(v) {
      const n = Number(v)
      return isNaN(n) ? '0' : n.toLocaleString()
    },
    fmtTime(t) {
      if (!t) return ''
      return t.length > 10 ? t.slice(5, 16) : t.slice(5)
    },
    avatarBg(item) {
      const m = item.method
      if (m === '在线支付') return 'var(--in-bg)'
      if (m === '线下收款') return 'var(--wa-bg)'
      if (m === '银行批扣') return 'var(--pu-bg)'
      if (m === '预缴抵扣') return 'var(--ok-bg)'
      return 'var(--brand-t)'
    },
    avatarColor(item) {
      const m = item.method
      if (m === '在线支付') return 'var(--in)'
      if (m === '线下收款') return 'var(--wa)'
      if (m === '银行批扣') return 'var(--pu)'
      if (m === '预缴抵扣') return 'var(--ok)'
      return 'var(--brand)'
    },
    onTabClick(key) { if (this.activeTab === key) return; this.activeTab = key; this.filterVersion++ },
    onMethodChange(e) { this.methodIdx = Number(e.detail.value) },
    onCollegeChange(e) { this.collegeIdx = Number(e.detail.value) },
    onDateFromChange(e) { this.filters.dateFrom = e.detail.value },
    onDateToChange(e) { this.filters.dateTo = e.detail.value },
    openDetail(item) {
      this.detail = { ...item }
      this.showDetail = true
    },
    onConfirmPayment(item) {
      uni.showModal({
        title: '确认收款',
        content: `确认收到 ${item.studentName}（${item.studentNo}）的 ¥${this.fmt(item.amount)} 款项？`,
        confirmText: '确认',
        success: (res) => {
          if (res.confirm) {
            confirmPaymentRecord(item.id)
            this.refresh()
            this.filterVersion++
            uni.showToast({ title: '已确认收款', icon: 'success' })
          }
        }
      })
    }
  }
}

function applyBaseFilter(list, filters, method, college) {
  const kw = filters.keyword.trim().toLowerCase()
  const from = filters.dateFrom || ''
  const to = filters.dateTo || ''
  return list.filter(item => {
    if (method !== '全部方式' && item.method !== method) return false
    if (college !== '全部学院' && item.college !== college) return false
    if (kw) {
      const matchName = String(item.studentName || '').toLowerCase().includes(kw)
      const matchNo = String(item.studentNo || '').toLowerCase().includes(kw)
      if (!matchName && !matchNo) return false
    }
    if (from && item.paidAt && item.paidAt.slice(0, 10) < from) return false
    if (to && item.paidAt && item.paidAt.slice(0, 10) > to) return false
    return true
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
  display: flex;
  flex-direction: column;
}

/* ── Filter Bar ── */
.filter-bar {
  padding: 16rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: var(--r-8);
  background: var(--white);
  font-size: var(--fs-13);
  color: var(--N900);
  box-sizing: border-box;
  box-shadow: var(--card-shadow-low);
}
.search-input::placeholder {
  color: var(--N400);
}
.filter-picker {
  min-width: 156rpx;
  height: 72rpx;
  padding: 0 16rpx;
  border-radius: var(--r-8);
  background: var(--white);
  color: var(--N700);
  font-size: var(--fs-11);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--card-shadow-low);
}
.select-arrow {
  font-size: 32rpx;
  color: var(--N400);
  margin-left: 8rpx;
}

/* ── Second filter row ── */
.filter-row {
  padding: 0 28rpx 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}
.date-chip {
  min-width: 140rpx;
  height: 60rpx;
  padding: 0 18rpx;
  border-radius: var(--r-20);
  background: var(--white);
  color: var(--N400);
  font-size: var(--fs-11);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--card-shadow-low);
}
.date-chip--set {
  color: var(--brand);
  background: var(--brand-t);
}
.date-sep {
  font-size: var(--fs-11);
  color: var(--N400);
}
.filter-chip {
  min-width: 120rpx;
  height: 60rpx;
  padding: 0 18rpx;
  border-radius: var(--r-20);
  background: var(--white);
  color: var(--N600);
  font-size: var(--fs-11);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--card-shadow-low);
}
.filter-chip--on {
  color: var(--brand);
  background: var(--brand-t);
}

/* ── Summary Bar ── */
.summary-bar {
  display: flex;
  margin: 0 28rpx 12rpx;
  background: var(--white);
  border-radius: var(--r-12);
  padding: 20rpx 32rpx;
  box-shadow: var(--card-shadow-low);
}
.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.summary-val {
  font-size: var(--fs-18);
  font-weight: 700;
  color: var(--N900);
  line-height: var(--lh-1-2);
}
.summary-val.ok {
  color: var(--ok);
}
.summary-lbl {
  font-size: var(--fs-10);
  color: var(--N500);
  margin-top: 4rpx;
}

/* ── Body ── */
.body {
  flex: 1;
  min-height: 0;
}
.card-list {
  padding: 0 28rpx;
}
.body-foot {
  height: 48rpx;
}

/* ── Record Item ── */
.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--white);
  border-radius: var(--r-12);
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: var(--card-shadow-low);
}
.record-item:active {
  background: var(--N25);
}
.item-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
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
.item-info {
  flex: 1;
  min-width: 0;
}
.info-top {
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
.info-meta {
  font-size: var(--fs-11);
  color: var(--N400);
  margin-top: 4rpx;
  display: block;
}
.info-bill {
  font-size: var(--fs-10);
  color: var(--N400);
  font-family: monospace;
  margin-top: 2rpx;
  display: block;
}
.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  margin-left: 20rpx;
  gap: 6rpx;
}
.item-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--N900);
}
.item-method {
  font-size: var(--fs-10);
  color: var(--N500);
}
.item-time {
  font-size: var(--fs-9);
  color: var(--N400);
}

.confirm-pay-btn {
  margin-top: 4rpx;
  padding: 6rpx 16rpx;
  background: var(--brand);
  border-radius: var(--r-20);
}
.confirm-pay-btn:active { background: var(--brand-d); }
.confirm-pay-btn text {
  font-size: var(--fs-10);
  color: #fff;
  font-weight: 600;
}

/* ── Detail ── */
.detail-body {
  padding: 8rpx 0;
}
.detail-amount {
  font-size: var(--fs-18);
  font-weight: 700;
  color: var(--brand);
}
</style>
