<template>
  <view class="steps">
    <view v-for="(step, idx) in steps" :key="idx" class="step" :class="{ done: idx < current, active: idx === current }">
      <view class="step-dot">
        <text v-if="idx < current">✓</text>
        <text v-else>{{ idx + 1 }}</text>
      </view>
      <view class="step-body">
        <text class="step-title">{{ step.title || step }}</text>
        <text class="step-desc" v-if="step.desc">{{ step.desc }}</text>
      </view>
      <view class="step-line" v-if="idx < steps.length - 1" :class="{ filled: idx < current }" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'SSteps',
  props: {
    steps: { type: Array, default: () => [] },
    current: { type: Number, default: 0 }
  }
}
</script>

<style lang="scss" scoped>
.steps {
  padding: 16rpx 0;
}
.step {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding-bottom: 48rpx;
}
.step:last-child { padding-bottom: 0; }
.step-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: var(--r-full);
  background: var(--N50);
  color: var(--N500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-11);
  font-weight: 600;
  flex-shrink: 0;
  margin-right: 24rpx;
  z-index: 1;
}
.step.active .step-dot {
  background: var(--brand);
  color: var(--white);
}
.step.done .step-dot {
  background: var(--ok);
  color: var(--white);
}
.step-body {
  flex: 1;
  min-width: 0;
}
.step-title {
  font-size: var(--fs-14);
  font-weight: 500;
  color: var(--N900);
  display: block;
}
.step-desc {
  font-size: var(--fs-12);
  color: var(--N500);
  margin-top: 4rpx;
  display: block;
}
.step-line {
  position: absolute;
  left: 22rpx;
  top: 56rpx;
  bottom: 0;
  width: 4rpx;
  background: var(--N200);
}
.step-line.filled {
  background: var(--ok);
}
</style>
