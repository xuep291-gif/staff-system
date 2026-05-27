<template>
  <view class="page">
    <SNavBar title="统计概览" :showBack="true" />
    <SCard title="数据范围">
      <SInfoRow label="查看权限">{{ profile.college || '全校授权范围' }}</SInfoRow>
      <SInfoRow label="说明">仅供查看，不可修改财务数据</SInfoRow>
    </SCard>
    <SCard title="缴费完成率">
      <view class="rate-row">
        <text class="rate">{{ summary.fees.payRate }}%</text>
        <text class="caption">{{ summary.fees.paid }}/{{ summary.fees.total }} 人已缴费</text>
      </view>
      <SProgressBar :percent="summary.fees.payRate" />
      <SInfoRow label="待缴/部分未缴">{{ summary.fees.unpaid + summary.fees.partial }} 人</SInfoRow>
      <SInfoRow label="欠费总金额"><text class="amount">¥{{ formatAmount(summary.fees.outstandingAmount) }}</text></SInfoRow>
    </SCard>
    <SCard title="资助业务情况">
      <SInfoRow label="助学金申请总数">{{ summary.aids.total }} 笔</SInfoRow>
      <SInfoRow label="助学贷款申请总数">{{ summary.loans.total }} 笔</SInfoRow>
      <SInfoRow label="助学金已完结">{{ summary.aids.tabs[2].count }} 笔</SInfoRow>
      <SInfoRow label="助学贷款已完结">{{ summary.loans.tabs[2].count }} 笔</SInfoRow>
    </SCard>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import { getClassSummary } from '@/utils/businessState.js'
import { getStaffProfile, guardStaffFeature } from '@/utils/staffAccess.js'

export default {
  name: 'StaffStats',
  components: { SNavBar, SCard, SInfoRow, SProgressBar },
  data() {
    return { profile: {}, summary: getClassSummary() }
  },
  onLoad() {
    if (!guardStaffFeature('stats')) return
    this.profile = getStaffProfile()
  },
  onShow() {
    this.summary = getClassSummary()
  },
  methods: {
    formatAmount(value) {
      return Number(value || 0).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); padding-bottom: 48rpx; }
.rate-row { display: flex; align-items: flex-end; margin-bottom: 22rpx; }
.rate { color: var(--brand); font-size: 48rpx; line-height: 1; font-weight: 700; }
.caption { color: var(--N500); font-size: var(--fs-11); margin-left: 18rpx; }
.amount { color: var(--er); font-size: var(--fs-14); font-weight: 700; }
</style>
