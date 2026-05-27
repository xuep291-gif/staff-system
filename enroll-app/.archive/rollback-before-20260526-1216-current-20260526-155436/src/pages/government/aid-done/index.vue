<template>
  <view class="page">
    <SNavBar title="审批完成" :showBack="true" />

    <view class="success-section">
      <view class="success-circle">
        <text class="success-emoji">💰</text>
      </view>
      <text class="success-title">终审完成</text>
      <text class="success-desc">孙文浩的助学金申请已终审通过\n系统已通知财务部门安排放款</text>
    </view>

    <view class="info-card">
      <SInfoRow label="学生姓名">孙文浩</SInfoRow>
      <SInfoRow label="学号">2026010039</SInfoRow>
      <SInfoRow label="助学金档位">特殊困难助学金</SInfoRow>
      <SInfoRow label="批准金额">
        <text class="amount-text">¥4,000</text>
      </SInfoRow>
      <SInfoRow label="终审人">李明远（政务专员）</SInfoRow>
      <SInfoRow label="终审时间">2026-05-16 14:30</SInfoRow>
      <SInfoRow label="状态">
        <SBadge color="ok">已批准 · 待放款</SBadge>
      </SInfoRow>
    </view>

    <view class="btn-area">
      <SButton variant="primary" block @click="onBackToList">返回列表</SButton>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SButton from '@/components/shared/SButton.vue'

export default {
  name: 'GovernmentAidDone',
  components: { SNavBar, SInfoRow, SBadge, SButton },
  data() {
    return {
      record: {
        studentName: '孙文浩',
        studentId: '2026010039',
        aidType: '特殊困难助学金',
        approvedAmount: '¥4,000',
        reviewer: '李明远（政务专员）',
        reviewTime: '2026-05-16 14:30',
        status: '已批准 · 待放款'
      }
    }
  },
  methods: {
    onBackToList() {
      uni.redirectTo({ url: '/pages/government/aid-home/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
}

.success-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 28rpx 48rpx;
}

.success-section > * + * {
  margin-top: 24rpx;
}

.success-circle {
  width: 144rpx;
  height: 144rpx;
  border-radius: 50%;
  background: var(--wa-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-emoji {
  font-size: 64rpx;
}

.success-title {
  font-size: var(--fs-18);
  font-weight: bold;
  color: var(--N900);
}

.success-desc {
  font-size: var(--fs-13);
  color: var(--N500);
  text-align: center;
  line-height: 1.6;
  white-space: pre-line;
}

.info-card {
  background: var(--white);
  border-radius: var(--r-14);
  box-shadow: var(--card-shadow);
  margin: 0 28rpx;
  padding: 24rpx 28rpx;
}

.info-card > * + * {
  border-top: 1px solid var(--N200);
}

.amount-text {
  color: var(--ok);
  font-weight: bold;
}

.btn-area {
  padding: 48rpx 28rpx;
}
</style>
