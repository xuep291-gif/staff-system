<template>
  <view class="page">
    <SNavBar title="退费审核" :showBack="true" fallbackUrl="/pages/finance/home/index" />
    <StatusTabs tabGroup="financeRefund" :tabs="tabs" :modelValue="activeTab" @change="onTabClick" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="item in filteredList" :key="filterVersion + '-' + item.uid" @click="openSheet(item)">
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

    <SBottomSheet v-model="showSheet" title="退费审核">
      <view v-if="currentItem" class="sheet-info">
        <SInfoRow label="学生姓名">{{ currentItem.name }}</SInfoRow>
        <SInfoRow label="学号">{{ currentItem.sid }}</SInfoRow>
        <SInfoRow label="班级">{{ currentItem.className }}</SInfoRow>
        <SInfoRow label="退费类型">{{ currentItem.type }}</SInfoRow>
        <SInfoRow label="退费金额"><text class="amount">¥{{ currentItem.amount }}</text></SInfoRow>
        <SInfoRow label="退费原因"><text class="reason">{{ currentItem.reason }}</text></SInfoRow>
        <SInfoRow label="提交时间">{{ currentItem.applyTime }}</SInfoRow>
        <SInfoRow label="审核状态"><SBadge :color="currentItem.badgeColor">{{ currentItem.statusLabel }}</SBadge></SInfoRow>
        <view class="preview-entry" @click="showPreview = true">
          <view class="preview-main">
            <text class="preview-title">佐证材料预览</text>
            <text class="preview-sub">查看学生提交的退费佐证材料</text>
          </view>
          <text class="preview-arrow">›</text>
        </view>
        <view class="opinion-box" v-if="canAudit">
          <text class="field-label">审核意见</text>
          <textarea class="opinion-textarea" v-model="opinion" placeholder="请输入审核意见" />
        </view>
        <view class="log-box" v-if="currentItem.logs && currentItem.logs.length">
          <text class="field-label">审核记录</text>
          <view class="log-item" v-for="log in currentItem.logs" :key="log.time + log.node">
            <text class="log-title">{{ log.node }} · {{ log.result }}</text>
            <text class="log-time">{{ log.time }}</text>
            <text class="log-remark" v-if="log.remark">{{ log.remark }}</text>
          </view>
        </view>
      </view>
      <template #footer>
        <view class="sheet-actions" v-if="canAudit">
          <SButton variant="danger" @click="onReject">驳回</SButton>
          <SButton variant="primary" @click="onApprove">同意退费</SButton>
        </view>
        <view class="sheet-actions single" v-else-if="canPay">
          <SButton variant="primary" block @click="onConfirmPayment">确认打款</SButton>
        </view>
      </template>
    </SBottomSheet>

    <SBottomSheet v-model="showPreview" title="佐证材料预览">
      <view class="material-preview">
        <text class="preview-message">学生提交的退费佐证材料将在此统一预览。</text>
        <view class="material-file">
          <text class="material-name">退费申请材料包</text>
          <SBadge color="in">可预览</SBadge>
        </view>
      </view>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import { getActiveKey, setActiveKey } from '@/utils/tabState.js'
import SBadge from '@/components/shared/SBadge.vue'
import SButton from '@/components/shared/SButton.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { buildRefundTabs, filterRefundByTab, getLastBusinessChange, getRefundItem, getRefundList, getRefundTabIndex, refundStatusMeta, updateRefund, REFUND_STATUS } from '@/utils/businessState.js'
import { refundApi } from '@/common/api/refund.js'

const REFUND_KEY_MAP = ['pending', 'approved', 'completed']

export default {
  name: 'FinanceRefund',
  components: { SNavBar, StatusTabs, SBadge, SButton, SBottomSheet, SInfoRow, SEmpty },
  data() {
    return {
      REFUND_STATUS,

      activeTab: 'pending',
      filterVersion: 0,
      list: [],
      showSheet: false,
      showPreview: false,
      currentItem: null,
      opinion: '审核通过，转入财务打款。',
      lastSyncedChange: '',
      submitting: false
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
    canAudit() {
      return this.currentItem && this.currentItem.status === REFUND_STATUS.PENDING
    },
    canPay() {
      return this.currentItem && this.currentItem.status === REFUND_STATUS.APPROVED
    }
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
    openSheet(item) {
      this.currentItem = item
      this.opinion = item.status === REFUND_STATUS.PENDING ? '审核通过，转入财务打款。' : ''
      this.showSheet = true
    },
    async onApprove() {
      if (this.submitting || !this.currentItem) return
      this.submitting = true
      await refundApi.approveRefund(this.currentItem.uid || this.currentItem.refundId, {
        opinion: this.opinion,
        approvedAmount: this.currentItem.amount
      })
      updateRefund(this.currentItem.uid, REFUND_STATUS.APPROVED, {
        node: '财务退费审核',
        result: '审核通过，待财务确认打款',
        remark: this.opinion
      })
      this.refresh(true)
      this.currentItem = getRefundItem(this.currentItem.uid)
      this.submitting = false
      uni.showToast({ title: '已进入待打款', icon: 'success' })
    },
    async onConfirmPayment() {
      if (this.submitting || !this.currentItem) return
      this.submitting = true
      await refundApi.executeRefund(this.currentItem.uid || this.currentItem.refundId)
      updateRefund(this.currentItem.uid, REFUND_STATUS.REFUNDED, {
        node: '财务确认打款',
        result: '退费已完结'
      })
      this.showSheet = false
      this.currentItem = null
      this.refresh(true)
      this.submitting = false
      uni.showToast({ title: '退费已完成', icon: 'success' })
    },
    async onReject() {
      if (this.submitting || !this.currentItem) return
      this.submitting = true
      await refundApi.rejectRefund(this.currentItem.uid || this.currentItem.refundId, { rejectReason: this.opinion || '财务审核驳回' })
      updateRefund(this.currentItem.uid, REFUND_STATUS.REJECTED, {
        node: '财务退费审核',
        result: '已驳回',
        remark: this.opinion || '财务审核驳回'
      })
      this.showSheet = false
      this.showPreview = false
      this.currentItem = null
      this.refresh(true)
      this.submitting = false
      uni.showToast({ title: '已驳回', icon: 'none' })
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
.li-desc { font-size: var(--fs-11); color: var(--N600); display: block; margin-top: 4rpx; line-height: 1.4; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
.sheet-info > * + * { margin-top: 18rpx; }
.preview-entry { min-height: 92rpx; padding: 20rpx 24rpx; border-radius: var(--r-12); background: var(--N25); display: flex; align-items: center; }
.preview-main { flex: 1; min-width: 0; }
.preview-title { display: block; color: var(--N900); font-size: var(--fs-13); font-weight: 600; }
.preview-sub { display: block; margin-top: 6rpx; color: var(--N500); font-size: var(--fs-11); }
.preview-arrow { color: var(--N400); font-size: 32rpx; margin-left: 16rpx; }
.field-label { display: block; margin-bottom: 12rpx; font-size: var(--fs-13); font-weight: 600; color: var(--N700); }
.opinion-textarea { width: 100%; min-height: 150rpx; padding: 20rpx 24rpx; border: 1.5px solid var(--N200); border-radius: 24rpx; font-size: var(--fs-13); color: var(--N900); background: var(--white); box-sizing: border-box; }
.log-item { padding: 16rpx 0; border-bottom: 1px solid var(--N50); }
.log-item:last-child { border-bottom: none; }
.log-title { display: block; font-size: var(--fs-12); font-weight: 600; color: var(--N900); }
.log-time, .log-remark { display: block; margin-top: 6rpx; font-size: var(--fs-11); color: var(--N500); line-height: 1.5; }
.sheet-actions { display: flex; }
.sheet-actions > * + * { margin-left: 20rpx; }
.sheet-actions > * { flex: 1; }
.sheet-actions.single { display: block; }
.material-preview { padding: 4rpx 0 24rpx; }
.preview-message { display: block; font-size: var(--fs-12); color: var(--N500); line-height: 1.6; }
.material-file { margin-top: 24rpx; padding: 20rpx 24rpx; border-radius: var(--r-12); background: var(--N25); display: flex; align-items: center; justify-content: space-between; }
.material-name { font-size: var(--fs-13); font-weight: 600; color: var(--N900); }
</style>
