<template>
  <view class="inforow">
    <text class="inforow-label">{{ label }}</text>
    <text class="inforow-value">
      <slot>{{ displayValue }}</slot>
    </text>
  </view>
</template>

<script>
export default {
  name: 'SInfoRow',
  props: {
    label: { type: String, default: '' },
    value: { type: [String, Number], default: '' }
  },
  computed: {
    displayValue() {
      return this.value !== undefined && this.value !== null ? String(this.value) : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.inforow {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 0;
  font-size: var(--fs-14);
  line-height: 1.5;
}
.inforow-label {
  flex-shrink: 0;
  color: var(--N500);
  min-width: 160rpx;
  margin-right: 16rpx;
  word-break: keep-all;
}
.inforow-value {
  flex: 1;
  color: var(--N900);
  font-weight: 500;
  word-break: break-all;
  overflow-wrap: break-word;
  min-width: 0;
}
</style>
