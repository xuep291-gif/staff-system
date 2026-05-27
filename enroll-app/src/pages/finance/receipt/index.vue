<template>
  <view class="page">
    <SNavBar title="票据管理" showBack />

    <SCard :title="'待处理（' + pendingList.length + '笔）'">
      <view
        class="receipt-item"
        v-for="item in pendingList"
        :key="item.id"
        @click="onItemClick(item)"
      >
        <view class="receipt-avatar" :style="{ background: 'var(--in-bg)', color: 'var(--in)' }">
          <text>{{ item.name.charAt(0) }}</text>
        </view>
        <view class="receipt-body">
          <view class="receipt-row">
            <text class="receipt-name">{{ item.name }}</text>
            <text class="receipt-sep">·</text>
            <text class="receipt-type">{{ item.receiptType }}</text>
          </view>
          <SAmount :value="item.amount" size="sm" />
          <text class="receipt-reason">{{ item.reason }}</text>
        </view>
        <SBadge color="wa">待处理</SBadge>
      </view>
    </SCard>

    <SCard :title="'已处理（' + doneList.length + '笔）'">
      <view class="receipt-item" v-for="item in doneList" :key="item.id" @click="onItemClick(item)">
        <view class="receipt-avatar" :style="{ background: 'var(--ok-bg)', color: 'var(--ok)' }">
          <text>{{ item.name.charAt(0) }}</text>
        </view>
        <view class="receipt-body">
          <view class="receipt-row">
            <text class="receipt-name">{{ item.name }}</text>
            <text class="receipt-sep">·</text>
            <text class="receipt-type">{{ item.receiptType }}</text>
          </view>
          <SAmount :value="item.amount" size="sm" />
          <text class="receipt-date">{{ item.status === 'voided' ? '作废于 ' + item.voidTime : '补打于 ' + item.reprintTime }}</text>
        </view>
        <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
      </view>
    </SCard>

    <SBottomSheet v-model="showSheet" :title="currentItem.status === 'pending' ? '确认补打' : '票据详情'">
      <view class="sheet-info">
        <view class="sheet-info-row">
          <text class="sheet-label">申请人</text>
          <text class="sheet-value">{{ currentItem.name }}</text>
        </view>
        <view class="sheet-info-row">
          <text class="sheet-label">学号</text>
          <text class="sheet-value">{{ currentItem.studentNo }}</text>
        </view>
        <view class="sheet-info-row">
          <text class="sheet-label">票据类型</text>
          <text class="sheet-value">{{ currentItem.receiptType }}</text>
        </view>
        <view class="sheet-info-row">
          <text class="sheet-label">票据金额</text>
          <text class="sheet-value sheet-amount">¥{{ currentItem.amount }}</text>
        </view>
        <view class="sheet-info-row">
          <text class="sheet-label">申请原因</text>
          <text class="sheet-value">{{ currentItem.reason }}</text>
        </view>
      </view>
      <template #footer>
        <view class="sheet-footer-row">
          <SButton variant="secondary" size="md" @click="showSheet = false">取消</SButton>
          <SButton v-if="currentItem.status === 'pending'" variant="primary" size="md" @click="onConfirm">确认补打</SButton>
          <SButton v-else-if="currentItem.status === 'reprinted'" variant="danger" size="md" @click="onVoid">作废票据</SButton>
        </view>
      </template>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SAmount from '@/components/shared/SAmount.vue'
import SButton from '@/components/shared/SButton.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import { getReceiptList, updateReceipt } from '@/utils/businessState.js'

export default {
  name: 'FinanceReceipt',
  components: { SNavBar, SCard, SBadge, SAmount, SButton, SBottomSheet },
  data() {
    return {
      showSheet: false,
      currentItem: {},
      list: []
    }
  },
  computed: {
    pendingList() {
      return this.list.filter(item => item.status === 'pending')
    },
    doneList() {
      return this.list.filter(item => item.status !== 'pending')
    }
  },
  onShow() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.list = getReceiptList()
      if (this.currentItem.id) this.currentItem = this.list.find(item => item.id === this.currentItem.id) || {}
    },
    onItemClick(item) {
      this.currentItem = item
      this.showSheet = true
    },
    onConfirm() {
      if (this.currentItem.status !== 'pending') return
      updateReceipt(this.currentItem.id, 'reprint')
      this.showSheet = false
      this.refresh()
      uni.showToast({ title: '票据已补打', icon: 'success' })
    },
    onVoid() {
      if (this.currentItem.status !== 'reprinted') return
      updateReceipt(this.currentItem.id, 'void')
      this.showSheet = false
      this.refresh()
      uni.showToast({ title: '票据已作废', icon: 'none' })
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

.receipt-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 0;
}
.receipt-item + .receipt-item {
  border-top: 1px solid var(--N50);
}

.receipt-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.receipt-body {
  flex: 1;
  overflow: hidden;
}

.receipt-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.receipt-name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--N900);
}

.receipt-no {
  font-size: 24rpx;
  color: var(--N500);
  margin-left: 12rpx;
}

.receipt-sep {
  font-size: 24rpx;
  color: var(--N400);
  margin-left: 8rpx;
  margin-right: 8rpx;
}

.receipt-type {
  font-size: 24rpx;
  color: var(--N500);
}

.receipt-reason {
  font-size: 24rpx;
  color: var(--N500);
  margin-top: 12rpx;
}

.receipt-date {
  font-size: 24rpx;
  color: var(--N500);
  margin-top: 12rpx;
}

.sheet-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}
.sheet-info-row + .sheet-info-row {
  border-top: 1px solid var(--N50);
}

.sheet-label {
  font-size: 28rpx;
  color: var(--N500);
}

.sheet-value {
  font-size: 28rpx;
  color: var(--N900);
  font-weight: 500;
}

.sheet-amount {
  font-weight: 700;
  color: var(--brand);
}

.sheet-footer-row {
  display: flex;
}
.sheet-footer-row > * {
  flex: 1;
}
.sheet-footer-row > * + * {
  margin-left: 24rpx;
}
</style>
