<template>
  <view class="timeline">
    <view v-for="(item, idx) in items" :key="idx" class="tl-item">
      <!-- §6.26 圆点：ok/done | cur/current | pending/p | brand -->
      <view class="tl-dot" :class="[item.state || item.color || 'brand']" />
      <view class="tl-content">
        <text class="tl-step" v-if="item.step">{{ item.step }}</text>
        <text class="tl-title">{{ item.title }}</text>
        <text class="tl-who" v-if="item.who">{{ item.who }}</text>
        <text class="tl-desc" v-if="item.desc">{{ item.desc }}</text>
        <text class="tl-time" v-if="item.time">{{ item.time }}</text>
      </view>
      <view class="tl-line" v-if="idx < items.length - 1" :class="{ done: item.state === 'ok' || item.state === 'done' }" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'STimeline',
  props: {
    items: { type: Array, default: () => [] }
  }
}
</script>

<style lang="scss" scoped>
/* ── §6.26 Timeline / 审批链 ── */
.timeline { padding: 16rpx 0; }

.tl-item {
  display: flex;
  position: relative;
  padding-bottom: 40rpx;
}
.tl-item:last-child { padding-bottom: 0; }

/* §6.26 圆点 10×10px */
.tl-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: var(--r-full);
  flex-shrink: 0;
  margin-right: 24rpx;
  margin-top: 8rpx;
  border: 4rpx solid;
}

/* 已通过 */
.tl-dot.ok,
.tl-dot.done {
  background: var(--ok);
  border-color: var(--ok);
}

/* 当前步骤 */
.tl-dot.cur {
  background: var(--white);
  border-color: var(--brand);
  box-shadow: 0 0 0 6rpx var(--brand-t);
}

/* 待办（空心） */
.tl-dot.pending,
.tl-dot.p {
  background: var(--white);
  border-color: var(--N200);
}

/* 默认品牌色（已完成） */
.tl-dot.brand {
  background: var(--brand);
  border-color: var(--brand);
}
.tl-dot.wa { background: var(--wa); border-color: var(--wa); }
.tl-dot.er { background: var(--er); border-color: var(--er); }
.tl-dot.in { background: var(--N500); border-color: var(--N500); }

.tl-content {
  flex: 1;
  min-width: 0;
}
.tl-step {
  font-size: var(--fs-12);
  font-weight: 600;
  color: var(--brand);
  display: block;
}
.tl-title {
  font-size: var(--fs-13);
  font-weight: 600;
  color: var(--N900);
  display: block;
}
.tl-who {
  font-size: var(--fs-11);
  color: var(--N500);
  margin-top: 4rpx;
  display: block;
}
.tl-desc {
  font-size: var(--fs-12);
  color: var(--N500);
  margin-top: 4rpx;
  display: block;
}
.tl-time {
  font-size: var(--fs-10);
  color: var(--N400);
  margin-top: 4rpx;
  display: block;
}

/* §6.26 连接线 */
.tl-line {
  position: absolute;
  left: 8rpx;
  top: 36rpx;
  bottom: 0;
  width: 4rpx;
  background: var(--N200);
}
.tl-line.done { background: var(--ok); }
</style>
