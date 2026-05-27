<template>
  <view class="spb" v-if="show">
    <!-- §6.6 头部标签行 -->
    <view class="spb-head" v-if="headLabel || headPercent">
      <text class="spb-head-label" v-if="headLabel">{{ headLabel }}</text>
      <text class="spb-head-pct" v-if="headPercent">{{ percent }}%</text>
    </view>
    <view class="spb-track">
      <view class="spb-fill" :class="[colorClass]" :style="{ width: percent + '%' }" />
    </view>
    <text v-if="label" class="spb-label">{{ label }}</text>
  </view>
</template>

<script>
export default {
  name: 'SProgressBar',
  props: {
    percent: { type: Number, default: 0 },
    color: { type: String, default: 'brand' },
    label: { type: String, default: '' },
    headLabel: { type: String, default: '' },
    headPercent: { type: Boolean, default: false },
    show: { type: Boolean, default: true }
  },
  computed: {
    colorClass() {
      return 'spb-' + this.color
    }
  }
}
</script>

<style lang="scss" scoped>
/* ── §6.6 进度条 ── */
.spb { margin: 16rpx 0; }

.spb-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.spb-head-label { font-size: var(--fs-11); color: var(--N500); }
.spb-head-pct { font-size: var(--fs-11); color: var(--N500); font-weight: 600; }

.spb-track {
  height: var(--prog-h);
  background: var(--N200);
  border-radius: var(--prog-radius);
  overflow: hidden;
}
.spb-fill {
  height: 100%;
  border-radius: var(--prog-radius);
  transition: width .6s;
}
/* §6.6 语义色 */
.spb-brand { background: var(--brand); }
.spb-ok    { background: var(--ok); }
.spb-wa    { background: var(--wa); }
.spb-er    { background: var(--er); }

.spb-label {
  text-align: center;
  font-size: var(--fs-12);
  color: var(--N500);
  margin-top: 12rpx;
  display: block;
}
</style>
