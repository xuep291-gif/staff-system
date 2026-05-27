<template>
  <view class="page">
    <SNavBar title="审核完成" :showBack="true" />

    <view class="success-section">
      <view class="success-icon">
        <text class="check-mark">✓</text>
      </view>
      <text class="success-title">初核通过</text>
      <text class="success-desc">王明辉 的资料已完成班主任初核
资料状态更新为「已审核」，学生已收到通知</text>
    </view>

    <view class="info-card">
      <SInfoRow label="学生姓名">王明辉</SInfoRow>
      <SInfoRow label="学号">2026010001</SInfoRow>
      <SInfoRow label="审核结果">
        <text class="result-ok">初核通过</text>
      </SInfoRow>
      <SInfoRow label="审核人">刘晓华（班主任）</SInfoRow>
      <SInfoRow label="审核时间">2026-05-16 10:23</SInfoRow>
    </view>

    <view class="btn-area">
      <SButton block @click="goNext">继续审核下一份</SButton>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SButton from '@/components/shared/SButton.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'

export default {
  name: 'TeacherDocDone',
  components: { SNavBar, SButton, SInfoRow },
  data() {
    return {
      reviewResult: {
        studentName: '王明辉',
        studentId: '2026010001',
        result: '初核通过',
        reviewer: '刘晓华（班主任）',
        reviewTime: '2026-05-16 10:23'
      }
    }
  },
  methods: {
    goNext() {
      const pages = getCurrentPages()
      uni.navigateBack()
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
  padding: 64rpx 28rpx 32rpx;

  > * + * { margin-top: 20rpx; }
}

.success-icon {
  width: 144rpx;
  height: 144rpx;
  border-radius: var(--r-full);
  background: var(--ok-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-mark {
  font-size: 64rpx;
  color: var(--ok);
  font-weight: 700;
}

.success-title {
  font-size: var(--fs-18);
  font-weight: 700;
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

  > * + * { border-top: 1px solid var(--N200); }
}

.result-ok {
  color: var(--ok);
}

.btn-area {
  padding: 48rpx 28rpx;
}
</style>
