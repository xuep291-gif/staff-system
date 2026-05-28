<template>
  <view class="page">
    <SNavBar title="线下收款确认" :showBack="true" fallbackUrl="/pages/finance/home/index" />

    <!-- 搜索筛选栏 — 始终在顶部 -->
    <view class="filter-bar">
      <input class="search-input" v-model.trim="filters.keyword" placeholder="姓名 / 学号 / 学院" />
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
          <view class="confirm-mini-btn" hover-class="confirm-mini-btn-hover" @tap.stop="onItemClick(item)">
            <text>财务确认</text>
          </view>
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
          <view v-if="canVoid" class="void-mini-btn" @tap.stop="onVoidClick(item)">
            <text>作废</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 确认收款弹窗 -->
    <view class="confirm-overlay" v-if="showSheet" @tap="onOverlayClose">
      <view class="confirm-panel" @tap="onPanelTap">
        <view class="confirm-handle"></view>
        <view class="confirm-header">
          <text class="confirm-title">线下收款确认</text>
        </view>
        <scroll-view scroll-y class="confirm-body" v-if="currentItem">
          <view class="cf-row"><text class="cf-label">学生姓名</text><text class="cf-value">{{ currentItem.name }}</text></view>
          <view class="cf-row"><text class="cf-label">学号</text><text class="cf-value">{{ currentItem.studentNo }}</text></view>
          <view class="cf-row"><text class="cf-label">缴费金额</text><text class="cf-value cf-amount">¥{{ formatAmount(currentItem.amount) }}</text></view>
          <view class="cf-row"><text class="cf-label">当前收款方式</text><text class="cf-value">{{ currentItem.method }}</text></view>
          <view class="cf-row"><text class="cf-label">凭证预览</text><text class="cf-link">查看现场收款凭证</text></view>
          <view class="cf-field">
            <text class="cf-field-label">财务确认收款方式 <text class="required">*</text></text>
            <view class="select-field" :class="{ placeholder: !form.collectionType }" @tap="onPickMethod">
              <text>{{ form.collectionType || '请选择收款方式' }}</text>
              <text class="select-arrow">›</text>
            </view>
          </view>
          <view class="cf-field">
            <text class="cf-field-label">收款备注</text>
            <textarea class="remark-textarea" v-model="form.remark" maxlength="100" placeholder="可填写票据号或现场说明" />
          </view>
        </scroll-view>
        <view class="confirm-footer">
          <view class="sheet-actions">
            <view class="sbtn sbtn-secondary sbtn-md sbtn-block" :class="{ 'sbtn-disabled': submitting }" @tap="onSheetCancel"><text>取消</text></view>
            <view class="sbtn sbtn-primary sbtn-md sbtn-block" :class="{ 'sbtn-disabled': submitting || !form.collectionType }" @tap="onConfirmSubmit"><text>{{ submitting ? '提交中…' : '确认提交' }}</text></view>
          </view>
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
import { confirmOfflineCollection, voidOfflineCollection, getOfflineCollectionList, getStudentBill, generateReceiptNumber } from '@/utils/businessState.js'
import { hasPermission } from '@/utils/permissions.js'

export default {
  name: 'FinanceCollect',
  components: { SNavBar, StatusTabs, SBadge, SEmpty },
  data() {
    return {
      activeTab: 'pending',
      showSheet: false,
      currentItem: null,
      list: [],
      submitting: false,
      pickerOpen: false,
      collectionTypes: ['现金', '银行转账', 'POS机', '微信', '支付宝', '其他'],
      form: { collectionType: '', remark: '' },
      paymentMethods: ['全部方式', '现金', '银行转账', 'POS机', '微信', '支付宝', '其他'],
      filters: { keyword: '', method: '全部方式' }
    }
  },
  computed: {
    canVoid() { return hasPermission('finance:void') || hasPermission('finance:admin') },
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
    refresh() {
      this.list = getOfflineCollectionList()
      if (this.currentItem && this.currentItem.id) {
        const updated = this.list.find(item => item.id === this.currentItem.id)
        if (updated) this.currentItem = { ...updated }
      }
    },
    onTabClick(key) { this.activeTab = key },
    onItemClick(item) {
      if (!item) return
      if (item.status !== 'pending') { uni.showToast({ title: '该记录已确认或已作废', icon: 'none' }); return }
      this.currentItem = { ...item }
      this.form = { collectionType: '', remark: '' }
      this.submitting = false
      this.showSheet = true
    },
    onSheetCancel() { this.showSheet = false; this.currentItem = null; this.form = { collectionType: '', remark: '' }; this.submitting = false },
    onOverlayClose() {
      if (this.pickerOpen) { this.pickerOpen = false; return }
      this.showSheet = false; this.currentItem = null; this.form = { collectionType: '', remark: '' }; this.submitting = false
    },
    onPanelTap() {},
    onPickMethod() {
      this.pickerOpen = true
      uni.showActionSheet({ itemList: this.collectionTypes, success: (res) => { this.pickerOpen = false; this.form.collectionType = this.collectionTypes[res.tapIndex] || '' }, fail: () => { this.pickerOpen = false }, complete: () => { this.pickerOpen = false } })
    },
    onPaymentFilterChange(event) { this.filters.method = this.paymentMethods[Number(event.detail.value)] || '全部方式' },
    onConfirmSubmit() {
      if (this.submitting) return
      if (!this.currentItem || this.currentItem.status !== 'pending') { uni.showToast({ title: '数据异常，请重新选择', icon: 'none' }); return }
      if (!this.form.collectionType) { uni.showToast({ title: '请选择收款方式', icon: 'none' }); return }
      try {
        const bill = getStudentBill(this.currentItem.studentNo)
        if (bill && bill.unpaidAmount > 0 && this.currentItem.amount > bill.unpaidAmount) { uni.showToast({ title: `收款金额不能大于未缴金额 ¥${Number(bill.unpaidAmount).toLocaleString()}`, icon: 'none' }); return }
      } catch (e) { /* proceed */ }
      this.submitting = true
      try {
        const result = confirmOfflineCollection(this.currentItem.id, { collectionType: this.form.collectionType, remark: this.form.remark.trim(), confirmedBy: '陈美玲' })
        if (!result) { uni.showToast({ title: '确认失败，请重试', icon: 'none' }); this.submitting = false; return }
        this.showSheet = false; this.currentItem = null; this.form = { collectionType: '', remark: '' }
        this.refresh()
        uni.showToast({ title: '线下收款已确认', icon: 'success' })
        this.$nextTick(() => { this.activeTab = 'confirmed'; setActiveKey('financeCollect', 'confirmed') })
      } catch (e) { uni.showToast({ title: '确认失败，请重试', icon: 'none' }) }
      finally { this.submitting = false }
    },
    onVoidClick(item) {
      if (!this.canVoid) { uni.showToast({ title: '无作废权限', icon: 'none' }); return }
      uni.showModal({
        title: '确认作废', confirmText: '确认作废', confirmColor: '#D14343',
        content: `确定要作废 ${item.name}（${item.studentNo}）的收款记录吗？\n\n收款金额：¥${this.formatAmount(item.amount)}\n收据编号：${item.receiptNo || '—'}\n\n作废后将回退账单已缴金额，此操作不可撤销。`,
        success: (res) => {
          if (res.confirm) {
            const r = voidOfflineCollection(item.id)
            if (r.success) { this.refresh(); uni.showToast({ title: '单据已作废，金额已回退', icon: 'success' }) }
            else { uni.showToast({ title: r.message || '作废失败', icon: 'none' }) }
          }
        }
      })
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
      { v: item.college, w: 3 },
      { v: item.className, w: 2 },
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
.filter-bar > * + * { margin-left: 16rpx; }
.search-input { flex: 1; min-width: 0; height: 72rpx; padding: 0 18rpx; border-radius: var(--r-8); background: var(--white); font-size: var(--fs-12); color: var(--N900); box-sizing: border-box; box-shadow: var(--card-shadow); }
.filter-picker { min-width: 156rpx; height: 72rpx; padding: 0 16rpx; border-radius: var(--r-8); background: var(--white); color: var(--N700); font-size: var(--fs-11); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--card-shadow); }
.select-arrow { font-size: 32rpx; color: var(--N400); }

/* ── Section ── */
.list-section { padding: 0 28rpx; }
.list-section > * + * { margin-top: 16rpx; }

.list-item { display: flex; align-items: center; justify-content: space-between; background: var(--white); border-radius: var(--r-12); padding: 24rpx; box-shadow: var(--card-shadow); }
.list-item:active { background: var(--N25); }
.item-left { display: flex; align-items: center; flex: 1; min-width: 0; }
.item-left > * + * { margin-left: 20rpx; }
.item-info { flex: 1; min-width: 0; }
.item-info > * + * { margin-top: 6rpx; }
.item-row { display: flex; align-items: center; flex-wrap: wrap; }
.item-row > * + * { margin-left: 12rpx; }

.avatar { width: 80rpx; height: 80rpx; border-radius: var(--r-full); display: flex; align-items: center; justify-content: center; font-size: var(--fs-16); font-weight: 700; color: var(--N700); flex-shrink: 0; }
.avatar-pending { background: var(--fc-t); }
.avatar-confirmed { background: var(--ok-bg); }

.item-name { font-size: var(--fs-15); font-weight: 600; color: var(--N900); }
.item-no { font-size: var(--fs-12); color: var(--N500); }
.item-meta { font-size: var(--fs-11); color: var(--N400); }
.item-right { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; margin-left: 20rpx; }
.item-right > * + * { margin-top: 8rpx; }
.item-time { font-size: var(--fs-10); color: var(--N400); }
.item-amount { font-size: 28rpx; font-weight: 600; color: var(--er); }
.item-amount-ok { color: var(--ok); }
.item-receipt { font-size: var(--fs-10); color: var(--N400); font-family: monospace; }

.confirm-mini-btn { min-height: 44rpx; padding: 0 18rpx; border-radius: var(--r-full); background: var(--brand); color: var(--white); font-size: var(--fs-11); font-weight: 600; line-height: 44rpx; display: flex; align-items: center; justify-content: center; }
.confirm-mini-btn:active, .confirm-mini-btn-hover { background: var(--brand-d); }
.void-mini-btn { min-height: 44rpx; padding: 0 18rpx; border-radius: var(--r-full); background: var(--white); border: 1px solid var(--er); color: var(--er); font-size: var(--fs-11); font-weight: 600; line-height: 44rpx; display: flex; align-items: center; justify-content: center; }
.void-mini-btn:active { background: var(--er-bg); }

/* ── Popup ── */
.confirm-overlay { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 1000; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; justify-content: center; }
.confirm-panel { width: 100%; max-height: 70vh; background: var(--white); border-radius: 32rpx 32rpx 0 0; padding-bottom: env(safe-area-inset-bottom); display: flex; flex-direction: column; overflow: hidden; }
.confirm-handle { width: 72rpx; height: 8rpx; background: var(--N200); border-radius: 4rpx; margin: 20rpx auto 0; flex-shrink: 0; }
.confirm-header { padding: 28rpx 32rpx 24rpx; border-bottom: 1px solid var(--N50); flex-shrink: 0; }
.confirm-title { font-size: var(--fs-16); font-weight: 600; color: var(--N900); }
.confirm-body { padding: 32rpx; max-height: 50vh; flex-shrink: 1; }
.cf-row { display: flex; align-items: flex-start; padding: 20rpx 0; font-size: var(--fs-14); line-height: 1.5; }
.cf-label { flex-shrink: 0; color: var(--N500); min-width: 160rpx; margin-right: 16rpx; }
.cf-value { flex: 1; color: var(--N900); font-weight: 500; }
.cf-amount { font-size: 28rpx; font-weight: 600; color: var(--er); }
.cf-link { color: var(--brand); font-size: var(--fs-13); font-weight: 600; }
.cf-field { margin-top: 24rpx; }
.cf-field-label { display: block; margin-bottom: 12rpx; font-size: var(--fs-13); font-weight: 600; color: var(--N700); }
.required { color: var(--er); }
.select-field { min-height: 88rpx; padding: 0 24rpx; border: 1px solid var(--N200); border-radius: var(--r-12); background: var(--N25); font-size: var(--fs-13); color: var(--N900); display: flex; align-items: center; justify-content: space-between; }
.select-field.placeholder { color: var(--N400); }
.remark-textarea { width: 100%; min-height: 120rpx; padding: 20rpx 24rpx; border: 1px solid var(--N200); border-radius: var(--r-12); background: var(--N25); color: var(--N900); font-size: var(--fs-13); line-height: 1.5; box-sizing: border-box; }
.confirm-footer { padding: 24rpx 32rpx; border-top: 1px solid var(--N50); flex-shrink: 0; }
.sheet-actions { display: flex; width: 100%; }
.sheet-actions > * + * { margin-left: 20rpx; }
.sheet-actions > * { flex: 1; }
.sbtn { display: flex; align-items: center; justify-content: center; border: none; border-radius: var(--r-8); font-size: var(--btn-font-size, 28rpx); font-weight: var(--btn-font-weight, 600); line-height: 1; box-sizing: border-box; }
.sbtn-block { width: 100%; }
.sbtn-md { padding: 20rpx 40rpx; min-height: 88rpx; }
.sbtn-primary { background: var(--brand); color: var(--white); }
.sbtn-primary:active { background: var(--brand-d); }
.sbtn-secondary { background: var(--N50); color: var(--N700); }
.sbtn-secondary:active { background: var(--N100); color: var(--N900); }
.sbtn-disabled { opacity: 0.4; pointer-events: none; }
</style>
