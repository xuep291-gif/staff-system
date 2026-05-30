<template>
  <text class="stag" :class="[colorClass]" :style="customStyle">
    <slot />
  </text>
</template>

<script>
export default {
  name: 'SStatusTag',
  props: {
    color: { type: String, default: 'in' },
    customStyle: { type: String, default: '' }
  },
  computed: {
    colorClass() {
      return 'stag-' + this.color
    }
  }
}
</script>

<style lang="scss" scoped>
.stag {
  display: inline-flex;
  align-items: center;
  font-size: var(--fs-11);
  padding: 4rpx 16rpx;
  border-radius: var(--r-20);
  font-weight: 600;
  white-space: nowrap;
  > view + view { margin-left: 8rpx; }
}
.stag-brand { background: var(--brand-t); color: var(--brand-d); }
.stag-ok { background: var(--ok-bg); color: var(--ok); }
.stag-wa { background: var(--wa-bg); color: #92400E; }
.stag-er { background: var(--er-bg); color: var(--er); }
.stag-in { background: var(--in-bg); color: var(--in); }
.stag-pu { background: var(--pu-bg); color: var(--pu); }
.stag-gy { background: var(--N50); color: var(--N500); }
</style>
