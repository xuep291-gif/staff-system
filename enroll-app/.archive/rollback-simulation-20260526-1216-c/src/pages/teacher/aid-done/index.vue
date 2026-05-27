<template>
  <view class="page">
    <SNavBar title="提交成功" :showBack="true" />

    <view class="success-area">
      <view class="success-circle">
        <text class="success-icon">📤</text>
      </view>
      <text class="success-title">初审意见已提交</text>
      <text class="success-desc">已转交学院学工办复审\n后续结果将通过消息通知您</text>
    </view>

    <SCard>
      <SInfoRow label="学生">{{ studentName }}</SInfoRow>
      <SInfoRow label="班主任建议金额">¥{{ suggestAmount }}</SInfoRow>
      <SInfoRow label="流转至">{{ flowTo }}</SInfoRow>
    </SCard>

    <view class="button-area">
      <SButton variant="primary" block @click="onBackToList">返回列表</SButton>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SButton from '@/components/shared/SButton.vue'

export default {
  name: 'TeacherAidDone',
  components: { SNavBar, SCard, SInfoRow, SButton },
  data() {
    return {
      studentName: '孙文浩',
      suggestAmount: '4,000',
      flowTo: '计算机学院学工复审'
    }
  },
  methods: {
    onBackToList() {
      uni.redirectTo({ url: '/pages/teacher/aid-home/index' })
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
  background: var(--wa-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  font-size: 60rpx;
}

.success-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--N900);
}

.success-desc {
  font-size: var(--fs-14);
  color: var(--N500);
  text-align: center;
  line-height: 1.6;
}

.button-area {
  margin: 28rpx;
}
</style>
