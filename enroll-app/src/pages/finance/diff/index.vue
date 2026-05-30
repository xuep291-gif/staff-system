<template>
  <view class="page">
    <SNavBar title="宿舍补差退款" :showBack="true" />

    <view class="alert-wrapper">
      <SAlertBar type="info" :message="alertMsg" />
    </view>

    <view class="card">
      <view class="card-header">
        <text class="card-title">补差退款（待处理 {{ pendingCount }} 笔）</text>
      </view>
      <view class="card-body">
        <view
          class="diff-item"
          v-for="(item, idx) in list"
          :key="item.id"
          @click="onItemClick(item)"
        >
          <view class="item-left">
            <view class="item-avatar" :style="{ background: 'var(--pu-bg)' }">
              <text class="avatar-text" :style="{ color: 'var(--pu)' }">{{ item.studentName.slice(-1) }}</text>
            </view>
            <view class="item-info">
              <view class="item-name-row">
                <text class="item-name">{{ item.studentName }}</text>
                <text class="item-no">{{ item.studentNo }}</text>
              </view>
              <text class="item-desc">{{ item.roomFrom }}→{{ item.roomTo }} {{ item.refundType }}</text>
            </view>
          </view>
          <view class="item-right">
            <text class="item-amount">退 ¥{{ item.amount }}</text>
            <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
            <view v-if="item.status === 'pending'" class="confirm-btn" @click.stop="onQuickConfirm(item)">
              <text>确认处理</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <SBottomSheet v-model="showSheet" title="确认退款">
      <view class="sheet-info" v-if="currentItem">
        <view class="sheet-row">
          <text class="sheet-label">学生姓名</text>
          <text class="sheet-value">{{ currentItem.studentName }}</text>
        </view>
        <view class="sheet-row">
          <text class="sheet-label">学号</text>
          <text class="sheet-value">{{ currentItem.studentNo }}</text>
        </view>
        <view class="sheet-row">
          <text class="sheet-label">换房信息</text>
          <text class="sheet-value">{{ currentItem.roomFrom }} → {{ currentItem.roomTo }}</text>
        </view>
        <view class="sheet-row">
          <text class="sheet-label">退款类型</text>
          <text class="sheet-value">{{ currentItem.refundType }}</text>
        </view>
        <view class="sheet-amount-row">
          <text class="sheet-label">退款金额</text>
          <text class="sheet-amount-value">¥{{ currentItem.amount }}</text>
        </view>
      </view>
      <template #footer>
        <view class="sheet-actions">
          <SButton variant="secondary" @click="showSheet = false">取消</SButton>
          <SButton v-if="currentItem && currentItem.status === 'pending'" variant="primary" @click="onConfirm">确认退款</SButton>
        </view>
      </template>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SAlertBar from '@/components/shared/SAlertBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import SButton from '@/components/shared/SButton.vue'
import { confirmDifferenceRefund, getDifferenceRefundList } from '@/utils/businessState.js'

export default {
  name: 'FinanceDiff',
  components: { SNavBar, SAlertBar, SBadge, SBottomSheet, SButton },
  data() {
    return {
      showSheet: false,
      currentItem: null,
      alertMsg: '换房差额 < 0 时，系统自动生成退款工单，由财务确认处理',
      list: []
    }
  },
  computed: {
    pendingCount() {
      return this.list.filter(item => item.status === 'pending').length
    }
  },
  onShow() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.list = getDifferenceRefundList()
      if (this.currentItem) this.currentItem = this.list.find(item => item.id === this.currentItem.id) || this.currentItem
    },
    onItemClick(item) {
      this.currentItem = item
      this.showSheet = true
    },
    onConfirm() {
      if (!this.currentItem || this.currentItem.status !== 'pending') return
      confirmDifferenceRefund(this.currentItem.id)
      this.showSheet = false
      this.refresh()
      uni.showToast({ title: '退款已确认', icon: 'success' })
    },
    onQuickConfirm(item) {
      uni.showModal({
        title: '确认退款',
        content: `确认 ${item.studentName}（${item.studentNo}）的补差退款 ¥${item.amount}？`,
        confirmText: '确认',
        success: (res) => {
          if (res.confirm) {
            confirmDifferenceRefund(item.id)
            this.refresh()
            uni.showToast({ title: '退款已确认', icon: 'success' })
          }
        }
      })
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

.alert-wrapper {
  padding: 24rpx 28rpx 0;
}

/* ── Card ── */
.card {
  background: var(--white);
  border-radius: var(--r-14);
  box-shadow: var(--card-shadow);
  margin: 28rpx;
}

.card-header {
  padding: 28rpx 28rpx 0;
}

.card-title {
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--N900);
}

.card-body {
  padding: 24rpx 28rpx 28rpx;
}

/* ── List Item ── */
.diff-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
}

.diff-item + .diff-item {
  border-top: 1px solid var(--N50);
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.item-left > view + view {
  margin-left: 24rpx;
}

.item-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: var(--fs-15);
  font-weight: 600;
}

.item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-info > view + view {
  margin-top: 8rpx;
}

.item-name-row {
  display: flex;
  align-items: center;
}

.item-name-row > view + view {
  margin-left: 16rpx;
}

.item-name {
  font-size: var(--fs-14);
  font-weight: 600;
  color: var(--N900);
}

.item-no {
  font-size: var(--fs-12);
  color: var(--N500);
}

.item-desc {
  font-size: var(--fs-12);
  color: var(--N500);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Item Right ── */
.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  margin-left: 24rpx;
}

.item-right > view + view {
  margin-top: 8rpx;
}

.item-amount {
  font-size: var(--fs-14);
  font-weight: 600;
  color: var(--ok);
}

.confirm-btn {
  margin-top: 4rpx;
  padding: 6rpx 16rpx;
  background: var(--brand);
  border-radius: var(--r-20);
}
.confirm-btn:active { background: var(--brand-d); }
.confirm-btn text {
  font-size: var(--fs-10);
  color: #fff;
  font-weight: 600;
}

/* ── BottomSheet Info ── */
.sheet-info {
  display: flex;
  flex-direction: column;
}

.sheet-info > view + view {
  margin-top: 24rpx;
}

.sheet-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sheet-label {
  font-size: var(--fs-13);
  color: var(--N500);
}

.sheet-value {
  font-size: var(--fs-14);
  color: var(--N900);
  font-weight: 500;
}

.sheet-amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  border-top: 1px solid var(--N50);
}

.sheet-amount-value {
  font-size: var(--fs-18);
  font-weight: 700;
  color: var(--ok);
}

/* ── BottomSheet Actions ── */
.sheet-actions {
  display: flex;
}

.sheet-actions > view {
  flex: 1;
}

.sheet-actions > view + view {
  margin-left: 24rpx;
}
</style>
