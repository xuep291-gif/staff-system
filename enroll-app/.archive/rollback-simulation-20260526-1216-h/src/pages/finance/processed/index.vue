<template>
  <view class="page">
    <SNavBar title="已处理记录" :showBack="true" />
    <scroll-view scroll-y class="body">
      <view v-if="records.length" class="list">
        <view class="record" v-for="item in records" :key="item.key">
          <view class="avatar">{{ item.name.charAt(0) }}</view>
          <view class="main">
            <view class="top">
              <text class="name">{{ item.name }}</text>
              <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
            </view>
            <text class="meta">{{ item.project }} · {{ item.sid }}</text>
            <text class="amount">¥{{ item.amount }}</text>
          </view>
        </view>
      </view>
      <SEmpty v-else text="暂无已处理记录" />
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { getReviewList, getRefundList, REVIEW_STATUS, REFUND_STATUS } from '@/utils/businessState.js'
import { guardStaffFeature } from '@/utils/staffAccess.js'
import { scholarshipApi } from '@/common/api/scholarship.js'
import { refundApi } from '@/common/api/refund.js'

export default {
  name: 'FinanceProcessed',
  components: { SNavBar, SBadge, SEmpty },
  data() {
    return { records: [] }
  },
  onLoad() {
    guardStaffFeature('processed')
  },
  async onShow() {
    const [aidRes, loanRes, refundRes] = await Promise.all([
      scholarshipApi.getScholarshipList({ role: 'finance', tab: 'done', pageSize: 100 }),
      scholarshipApi.getLoanList({ role: 'finance', tab: 'done', pageSize: 100 }),
      refundApi.getRefundList({ pageSize: 100 })
    ])
    const aidRows = aidRes?.data?.code === 0 ? aidRes.data.data.list : getReviewList('aids')
    const loanRows = loanRes?.data?.code === 0 ? loanRes.data.data.list : getReviewList('loans')
    const refundRows = refundRes?.data?.code === 0 ? (refundRes.data.data.list || []) : getRefundList()
    const aids = aidRows
      .filter(i => [REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED, REVIEW_STATUS.REJECTED].includes(i.status))
      .map(i => ({ ...i, key: `aid-${i.uid}`, project: '助学金' }))
    const loans = loanRows
      .filter(i => [REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED, REVIEW_STATUS.REJECTED].includes(i.status))
      .map(i => ({ ...i, key: `loan-${i.uid}`, project: '助学贷款' }))
    const refunds = refundRows
      .filter(i => i.status !== REFUND_STATUS.PENDING)
      .map(i => ({ ...i, uid: i.uid || i.refundId, name: i.name || i.studentName, sid: i.sid || i.studentNo, key: `refund-${i.uid || i.refundId}`, project: i.type || i.feeType || '退费', statusLabel: i.statusText || i.statusLabel || i.status, badgeColor: i.badgeColor || 'ok' }))
    this.records = [...aids, ...loans, ...refunds]
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.list { padding: 24rpx 28rpx 48rpx; display: flex; flex-direction: column; gap: 20rpx; }
.record { display: flex; align-items: flex-start; padding: 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--brand-t); color: var(--brand); display: flex; align-items: center; justify-content: center; font-size: var(--fs-15); font-weight: 600; flex-shrink: 0; }
.main { flex: 1; min-width: 0; margin-left: 22rpx; }
.top { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.name { font-size: var(--fs-15); color: var(--N900); font-weight: 600; }
.meta, .amount { display: block; margin-top: 8rpx; font-size: var(--fs-12); color: var(--N500); }
.amount { color: var(--er); font-weight: 700; }
</style>
