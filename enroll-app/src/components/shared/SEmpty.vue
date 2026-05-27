<template>
  <view class="empty">
    <text class="empty-icon">{{ icon }}</text>
    <text class="empty-text">{{ text }}</text>
    <view class="empty-action" :class="{ 'empty-action--hidden': !hasActionSlot }">
      <slot name="action" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'SEmpty',
  props: {
    icon: { type: String, default: '📋' },
    text: { type: String, default: '暂无数据' }
  },
  computed: {
    hasActionSlot() {
      return !!this.$slots.action
    }
  }
}
</script>

<style lang="scss" scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96rpx 48rpx;
}
.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
  opacity: 0.4;
}
.empty-text {
  font-size: var(--fs-14);
  color: var(--N400);
  text-align: center;
}
.empty-action {
  margin-top: 32rpx;
}
.empty-action--hidden {
  display: none;
}
</style>
