<template>
  <SCard title="审核进度" :padding="16">
    <view class="steps">
      <view v-for="(step, idx) in steps" :key="idx" class="step" :class="stepClass(step)">
        <view class="step-dot" :class="stepClass(step)">
          <text v-if="step.done" class="step-check">✓</text>
          <text v-else class="step-num">{{ idx + 1 }}</text>
        </view>
        <view class="step-info">
          <text class="step-label">{{ step.label }}</text>
          <text class="step-sub">{{ step.sub }}</text>
        </view>
        <view
          v-if="idx < steps.length - 1"
          class="step-line"
          :class="{ done: step.done, 'anim-line': idx === animatingLine }"
        />
      </view>
    </view>
  </SCard>
</template>

<script>
import SCard from '@/components/shared/SCard.vue'

export default {
  name: 'SReviewProgress',
  components: { SCard },
  props: {
    steps: { type: Array, default: () => [] },
    animatingLine: { type: Number, default: -1 }
  },
  methods: {
    stepClass(step) {
      return { done: step.done, cur: step.current, 'step-pop': step.popping }
    }
  }
}
</script>

<style lang="scss" scoped>
.steps { display: flex; flex-direction: column; }
.step { display: flex; align-items: flex-start; position: relative; padding-bottom: 28rpx; }
.step:last-child { padding-bottom: 0; }
.step-dot {
  width: 48rpx; height: 48rpx; border-radius: 50%;
  background: var(--N200); display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-11); color: var(--N500); flex-shrink: 0; z-index: 1;
  transition: background .4s ease, color .4s ease, box-shadow .4s ease, transform .3s ease;
  border: 3px solid transparent;
}
.step-dot.done { background: var(--ok); color: #fff; border-color: var(--ok); box-shadow: 0 0 0 4rpx var(--ok-bg); }
.step-dot.cur { background: var(--brand); color: #fff; border-color: var(--brand); box-shadow: 0 0 0 8rpx var(--brand-t); animation: pulse-dot 1.4s ease-in-out infinite; }
.step-dot.step-pop { transform: scale(1.35); box-shadow: 0 0 0 16rpx var(--ok-bg); }
.step-check { font-size: var(--fs-10); font-weight: 700; }
.step-num { font-weight: 600; }
.step-info { flex: 1; margin-left: 20rpx; min-width: 0; }
.step-label { font-size: var(--fs-13); font-weight: 600; color: var(--N900); display: block; transition: color .4s ease; }
.step.cur .step-label { color: var(--brand); }
.step.done .step-label { color: var(--ok); }
.step-sub { font-size: var(--fs-11); color: var(--N400); display: block; margin-top: 4rpx; transition: color .3s; }
.step-line {
  position: absolute; left: 24rpx; top: 48rpx; bottom: 0; width: 4px; border-radius: 2px;
  background: var(--N200); transition: background .5s ease, box-shadow .5s ease;
}
.step-line.done { background: var(--ok); }
.step-line.anim-line { background: var(--brand); animation: line-glow .6s ease-out forwards; }

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 8rpx var(--brand-t); transform: scale(1); }
  50% { box-shadow: 0 0 0 22rpx var(--brand-t); transform: scale(1.05); }
}
@keyframes line-glow {
  0% { background: var(--brand); box-shadow: 0 0 6rpx var(--brand-t); }
  100% { background: var(--ok); box-shadow: 0 0 8rpx var(--ok-bg); }
}
</style>
