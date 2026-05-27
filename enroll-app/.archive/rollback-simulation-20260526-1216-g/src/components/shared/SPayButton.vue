<template>
  <button class="pay-btn" :class="{ loading }" :disabled="disabled || loading" @click="$emit('click')">
    <text v-if="!loading">{{ label }}</text>
    <text v-else>处理中...</text>
  </button>
</template>

<script>
export default {
  name: 'SPayButton',
  props: {
    label: { type: String, default: '去缴费' },
    amount: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  emits: ['click']
}
</script>

<style lang="scss" scoped>
.pay-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 88rpx;
  border-radius: var(--r-8);
  font-size: var(--fs-15);
  font-weight: 700;
  color: var(--white);
  background: var(--brand);
  border: none;

  > * + * { margin-left: 16rpx; }
}
.pay-btn:active {
  opacity: 0.8;
}
.pay-btn:disabled {
  opacity: 0.5;
}
</style>
