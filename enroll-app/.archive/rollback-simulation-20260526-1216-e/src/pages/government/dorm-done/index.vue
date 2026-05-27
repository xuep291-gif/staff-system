<template>
  <view class="page">
    <SNavBar title="审批完成" :showBack="true" />

    <view class="success-area">
      <view class="success-circle">
        <text class="success-icon">✓</text>
      </view>
      <text class="success-title">审批完成</text>
      <text class="success-desc">孙文浩的换房申请已审批通过\n系统已自动计算住宿费差额并通知学生</text>
    </view>

    <view class="info-card">
      <SInfoRow label="学生姓名">孙文浩</SInfoRow>
      <SInfoRow label="学号">2026010039</SInfoRow>
      <SInfoRow label="审批结果">
        <text class="result-ok">审批通过</text>
      </SInfoRow>
      <SInfoRow label="原宿舍">3号楼 305室（6人间）</SInfoRow>
      <SInfoRow label="目标宿舍">3号楼 310室（4人间）</SInfoRow>
      <SInfoRow label="费用差额">
        <text class="fee-text">需补缴 ¥600</text>
      </SInfoRow>
      <SInfoRow label="审批人">李明远（政务专员）</SInfoRow>
      <SInfoRow label="审批时间">2026-05-16 10:45</SInfoRow>
    </view>

    <view class="button-area">
      <SButton variant="primary" block @click="onBackToList">返回列表</SButton>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SButton from '@/components/shared/SButton.vue'

export default {
  name: 'GovernmentDormDone',
  components: { SNavBar, SInfoRow, SButton },
  data() {
    return {
      studentName: '孙文浩',
      studentId: '2026010039',
      originalDorm: '3号楼 305室（6人间）',
      targetDorm: '3号楼 310室（4人间）',
      feeDiff: '需补缴 ¥600',
      approver: '李明远（政务专员）',
      approveTime: '2026-05-16 10:45'
    }
  },
  methods: {
    onBackToList() {
      uni.redirectTo({ url: '/pages/government/dorm-home/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
}

.success-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 28rpx 48rpx;
}

.success-area > * + * {
  margin-top: 24rpx;
}

.success-circle {
  width: 144rpx;
  height: 144rpx;
  border-radius: 50%;
  background: var(--ok-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  font-size: 64rpx;
  color: var(--ok);
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
}

.info-card {
  background: var(--white);
  border-radius: var(--r-14);
  box-shadow: var(--card-shadow-low);
  margin: 28rpx;
  padding: 0 28rpx;
}

.result-ok {
  color: var(--ok);
}

.fee-text {
  color: var(--wa);
}

.button-area {
  margin: 28rpx;
}
</style>
