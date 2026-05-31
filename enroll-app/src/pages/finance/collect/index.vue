<template>
  <view class="page">
    <SNavBar title="线下收款确认" :showBack="true" />

    <STabs v-model="currentTab" :tabs="tabs" storage-key="finance-offline-collection" />

    <!-- Tab 0: 待确认 -->
    <view class="list-section" v-if="currentTab === 0">
      <SEmpty v-if="!pendingList.length" text="当前暂无待确认线下收款" />
      <view
        class="list-item"
        v-for="item in pendingList"
        :key="item.id"
        @click="onItemClick(item)"
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
          <view class="confirm-mini-btn" @click.stop="onItemClick(item)">财务确认</view>
        </view>
      </view>
      <view class="more-link" v-if="pendingMoreCount > 0" @click="onViewMore">
        <text>还有 {{ pendingMoreCount }} 笔待确认</text>
        <text class="more-arrow">›</text>
      </view>
    </view>

    <!-- Tab 1: 已确认 -->
    <view class="list-section" v-if="currentTab === 1">
      <SEmpty v-if="!confirmedList.length" text="当前暂无已确认线下收款" />
      <view
        class="list-item"
        v-for="item in confirmedList"
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
              <text class="item-meta">{{ item.collectionType }} · {{ item.confirmTime }}</text>
            </view>
          </view>
        </view>
        <view class="item-right">
          <text class="item-amount item-amount-ok">¥{{ formatAmount(item.amount) }}</text>
          <SBadge color="ok">已确认</SBadge>
        </view>
      </view>
    </view>

    <!-- Tab 2: 收款记录查询 -->
    <view class="list-section" v-if="currentTab === 2">
      <view class="filter-card">
        <input class="search-input" v-model.trim="filters.keyword" placeholder="姓名 / 学号 / 学院 / 时间" />
        <picker :range="paymentMethods" :value="paymentMethodIndex" @change="onPaymentFilterChange">
          <view class="filter-picker">
            <text>{{ filters.method }}</text>
            <text class="select-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="section-header">
        <text class="section-header-text">查询到 {{ recordList.length }} 笔收款记录</text>
      </view>
      <SEmpty v-if="!recordList.length" text="未找到符合条件的收款记录" />
      <view
        class="list-item"
        v-for="item in recordList"
        :key="item.id"
        @click="item.status === 'pending' ? onItemClick(item) : null"
      >
        <view class="item-left">
          <view
            class="avatar"
            :class="item.status === 'pending' ? 'avatar-pending' : 'avatar-confirmed'"
          >{{ item.avatar }}</view>
          <view class="item-info">
            <view class="item-row">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-no">{{ item.studentNo }}</text>
            </view>
            <view class="item-row">
              <text class="item-meta">{{ item.college }} · {{ item.status === 'confirmed' ? item.collectionType : item.method }}</text>
              <text v-if="item.status === 'confirmed'" class="item-meta">确认人 {{ item.confirmedBy }} · {{ item.confirmTime }}</text>
              <text v-else class="item-meta">{{ item.location }} · {{ item.time }}</text>
            </view>
          </view>
        </view>
        <view class="item-right">
          <text class="item-time" v-if="item.time">{{ item.time }}</text>
          <text
            class="item-amount"
            :class="{ 'item-amount-ok': item.status === 'confirmed' }"
          >¥{{ formatAmount(item.amount) }}</text>
          <SBadge :color="item.status === 'pending' ? 'wa' : 'ok'">
            {{ item.status === 'pending' ? '待确认' : '已确认' }}
          </SBadge>
          <view v-if="item.status === 'pending'" class="confirm-mini-btn" @click.stop="onItemClick(item)">财务确认</view>
        </view>
      </view>
    </view>

    <!-- BottomSheet -->
    <SBottomSheet v-model="showSheet" title="线下收款确认">
      <view class="sheet-body" v-if="currentItem">
        <SInfoRow label="学生姓名">{{ currentItem.name }}</SInfoRow>
        <SInfoRow label="学号">{{ currentItem.studentNo }}</SInfoRow>
        <SInfoRow label="缴费金额">
          <text class="sheet-amount">¥{{ formatAmount(currentItem.amount) }}</text>
        </SInfoRow>
        <SInfoRow label="凭证预览"><text class="preview-link">查看现场收款凭证</text></SInfoRow>
        <view class="field">
          <text class="field-label">收款类型 <text class="required">*</text></text>
          <picker :range="collectionTypes" :value="collectionTypeIndex" @change="onCollectionTypeChange">
            <view class="select-field" :class="{ placeholder: !form.collectionType }">
              <text>{{ form.collectionType || '请选择收款类型' }}</text>
              <text class="select-arrow">›</text>
            </view>
          </picker>
        </view>
        <view class="field">
          <text class="field-label">收款备注</text>
          <textarea class="remark-textarea" v-model="form.remark" maxlength="100" placeholder="可填写票据号或现场说明" />
        </view>
      </view>
      <template #footer>
        <view class="sheet-actions">
          <SButton variant="secondary" size="md" block @click="onCancel">取消</SButton>
          <SButton variant="primary" size="md" block @click="onConfirmSubmit">确认提交</SButton>
        </view>
      </template>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import STabs from '@/components/shared/STabs.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import SButton from '@/components/shared/SButton.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { confirmOfflineCollection, getOfflineCollectionList } from '@/utils/businessState.js'
import { getStaffProfile, guardStaffFeature } from '@/utils/staffAccess.js'

export default {
  name: 'FinanceCollect',
  components: { SNavBar, STabs, SBadge, SBottomSheet, SButton, SInfoRow, SEmpty },
  data() {
    return {
      currentTab: 0,
      showSheet: false,
      currentItem: null,
      list: [],
      submitting: false,
      collectionTypes: ['现金', '银行转账', 'POS机', '微信', '支付宝', '其他'],
      form: {
        collectionType: '',
        remark: ''
      },
      paymentMethods: ['全部方式', '现金', '银行转账', 'POS机', '微信', '支付宝', '其他'],
      filters: { keyword: '', method: '全部方式' }
    }
  },
  computed: {
    tabs() {
      return [
        { label: '待确认', count: this.pendingList.length, color: 'brand' },
        { label: '已确认', count: this.confirmedList.length, color: 'ok' },
        { label: '记录查询', count: this.recordList.length }
      ]
    },
    pendingList() {
      return this.list.filter(item => item.status === 'pending')
    },
    confirmedList() {
      return this.list.filter(item => item.status === 'confirmed')
    },
    allList() {
      return [...this.pendingList, ...this.confirmedList]
    },
    recordList() {
      const keyword = this.filters.keyword.trim()
      return this.allList.filter(item => {
        const methodMatch = this.filters.method === '全部方式' ||
          String(item.collectionType || item.method || '').includes(this.filters.method)
        const keywordMatch = !keyword || [
          item.name, item.studentNo, item.college, item.className, item.time, item.confirmTime
        ].some(value => String(value || '').includes(keyword))
        return methodMatch && keywordMatch
      })
    },
    pendingMoreCount() {
      return Math.max(0, this.pendingList.length - 3)
    },
    totalCount() {
      return this.allList.length
    },
    collectionTypeIndex() {
      const index = this.collectionTypes.indexOf(this.form.collectionType)
      return index >= 0 ? index : 0
    },
    paymentMethodIndex() {
      const index = this.paymentMethods.indexOf(this.filters.method)
      return index >= 0 ? index : 0
    }
  },
  onLoad() {
    if (!guardStaffFeature('collect')) return
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'offlineCollections') this.refresh()
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  async onShow() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.list = getOfflineCollectionList()
      if (this.currentItem) {
        this.currentItem = this.list.find(item => item.id === this.currentItem.id) || this.currentItem
      }
    },
    onItemClick(item) {
      if (item.status === 'confirmed') return
      this.currentItem = item
      this.form = { collectionType: '', remark: '' }
      this.showSheet = true
    },
    onCancel() {
      this.showSheet = false
    },
    onCollectionTypeChange(event) {
      const index = Number(event.detail.value)
      this.form.collectionType = this.collectionTypes[index] || ''
    },
    onPaymentFilterChange(event) {
      const index = Number(event.detail.value)
      this.filters.method = this.paymentMethods[index] || '全部方式'
    },
    onConfirmSubmit() {
      if (this.submitting || !this.currentItem || this.currentItem.status === 'confirmed') return
      if (!this.form.collectionType) {
        uni.showToast({ title: '请选择收款类型', icon: 'none' })
        return
      }
      this.submitting = true
      confirmOfflineCollection(this.currentItem.id, {
        collectionType: this.form.collectionType,
        remark: this.form.remark.trim(),
        confirmedBy: getStaffProfile().name
      })
      this.showSheet = false
      this.refresh()
      this.currentTab = 1
      this.currentItem = null
      this.submitting = false
      uni.showToast({ title: '线下收款已确认', icon: 'success' })
    },
    onViewMore() {
      // Navigate or load more pending items
    },
    formatAmount(amount) {
      return Number(amount).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
  padding-bottom: 48rpx;
}

/* ── Section ── */
.list-section {
  padding: 0 28rpx;
}

.list-section > * + * {
  margin-top: 16rpx;
}

.section-header {
  padding: 28rpx 0 12rpx;
}

.section-header-text {
  font-size: var(--fs-13);
  font-weight: 500;
  color: var(--N500);
}
.filter-card {
  margin-top: 20rpx;
  padding: 20rpx;
  background: var(--white);
  border-radius: var(--r-12);
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
}
.filter-card > * + * { margin-left: 16rpx; }
.search-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  padding: 0 18rpx;
  border-radius: var(--r-8);
  background: var(--N50);
  font-size: var(--fs-12);
  color: var(--N900);
}
.filter-picker {
  min-width: 156rpx;
  height: 72rpx;
  padding: 0 16rpx;
  border-radius: var(--r-8);
  background: var(--N50);
  color: var(--N700);
  font-size: var(--fs-11);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ── List Item ── */
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--white);
  border-radius: var(--r-12);
  padding: 24rpx;
  box-shadow: var(--card-shadow);
}

.list-item:active {
  background: var(--N25);
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.item-left > * + * {
  margin-left: 20rpx;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info > * + * {
  margin-top: 6rpx;
}

.item-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.item-row > * + * {
  margin-left: 12rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-16);
  font-weight: 700;
  color: var(--N700);
  flex-shrink: 0;
}

.avatar-pending {
  background: var(--fc-t);
}

.avatar-confirmed {
  background: var(--ok-bg);
}

.item-name {
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--N900);
}

.item-no {
  font-size: var(--fs-12);
  color: var(--N500);
}

.item-meta {
  font-size: var(--fs-11);
  color: var(--N400);
}

/* ── Right Side ── */
.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  margin-left: 20rpx;
}

.item-right > * + * {
  margin-top: 8rpx;
}

.item-time {
  font-size: var(--fs-10);
  color: var(--N400);
}

.item-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--er);
}

.item-amount-ok {
  color: var(--ok);
}
.confirm-mini-btn {
  min-height: 44rpx;
  padding: 0 18rpx;
  border-radius: var(--r-full);
  background: var(--brand);
  color: var(--white);
  font-size: var(--fs-11);
  font-weight: 600;
  line-height: 44rpx;
}
.confirm-mini-btn:active {
  background: var(--brand-d);
}

/* ── More Link ── */
.more-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28rpx 0;
  font-size: var(--fs-13);
  color: var(--brand);
}

.more-link > * + * {
  margin-left: 8rpx;
}

.more-link:active {
  opacity: 0.7;
}

.more-arrow {
  font-size: var(--fs-16);
}

/* ── Bottom Sheet ── */
.sheet-body {
  padding: 0;
}

.sheet-body > * + * {
  margin-top: 0;
}

.sheet-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--er);
}
.preview-link { color: var(--brand); font-size: var(--fs-13); font-weight: 600; }

.field {
  margin-top: 24rpx;
}

.field-label {
  display: block;
  margin-bottom: 12rpx;
  font-size: var(--fs-13);
  font-weight: 600;
  color: var(--N700);
}

.required {
  color: var(--er);
}

.select-field {
  min-height: 88rpx;
  padding: 0 24rpx;
  border: 1px solid var(--N200);
  border-radius: var(--r-12);
  background: var(--N25);
  font-size: var(--fs-13);
  color: var(--N900);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-field.placeholder {
  color: var(--N400);
}

.select-arrow {
  font-size: 32rpx;
  color: var(--N400);
}

.remark-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx 24rpx;
  border: 1px solid var(--N200);
  border-radius: var(--r-12);
  background: var(--N25);
  color: var(--N900);
  font-size: var(--fs-13);
  line-height: 1.5;
  box-sizing: border-box;
}

.sheet-actions {
  display: flex;
  width: 100%;
}

.sheet-actions > * + * {
  margin-left: 20rpx;
}

.sheet-actions > * {
  flex: 1;
}
</style>
