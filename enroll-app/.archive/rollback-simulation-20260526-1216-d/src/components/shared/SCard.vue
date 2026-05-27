<template>
  <view class="scard" :class="[variantClass, { 'scard-flush': padding === 0 }]">
    <view class="scard-header" v-if="$slots.header || title">
      <slot name="header">
        <text class="scard-title">{{ title }}</text>
      </slot>
      <slot name="action">
        <text v-if="actionText" class="scard-action" @click="$emit('action')">{{ actionText }}</text>
      </slot>
    </view>
    <view class="scard-body">
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  name: 'SCard',
  props: {
    title: { type: String, default: '' },
    actionText: { type: String, default: '' },
    padding: { type: Number, default: 16 },
    variant: { type: String, default: '' }
  },
  emits: ['action'],
  computed: {
    variantClass() {
      if (!this.variant) return ''
      return 'scard-' + this.variant
    }
  }
}
</script>

<style lang="scss" scoped>
.scard {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  margin: 28rpx;
  box-shadow: var(--card-shadow);
  border: var(--card-border);
  overflow: hidden;
}

/* §5.1 / §6.8 变体 */
.scard-urgent {
  border-color: var(--er-bd);
  box-shadow: 0 0 0 6rpx rgba(185,28,28,.06);
}
.scard-ok-c { border-color: var(--ok-bd); }
.scard-info-c { border-color: var(--in-bd); }

/* §5.1 卡片头部 */
.scard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--card-header-padding);
  border-bottom: 1px solid var(--N50);
}
.scard-title {
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--N900);
}
.scard-action {
  font-size: var(--fs-12);
  color: var(--brand);
  font-weight: 500;
}

/* §5.1 卡片主体 */
.scard-body {
  padding: var(--card-body-padding);
  overflow: hidden;
  word-break: break-all;
  overflow-wrap: break-word;
}
.scard-flush .scard-body { padding: 0; }
</style>
