<template>
  <view class="alertbar" :class="[typeClass]" v-if="show">
    <view class="alertbar-left">
      <text class="alertbar-icon">{{ iconMap[type] }}</text>
    </view>
    <view class="alertbar-content">
      <slot><text>{{ message }}</text></slot>
    </view>
    <view class="alertbar-right" v-if="closable" @click="$emit('close')">
      <text class="alertbar-close">✕</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SAlertBar',
  props: {
    type: { type: String, default: 'info' },
    message: { type: String, default: '' },
    show: { type: Boolean, default: true },
    closable: { type: Boolean, default: false }
  },
  emits: ['close'],
  data() {
    return {
      iconMap: { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' }
    }
  },
  computed: {
    typeClass() {
      return 'alertbar-' + this.type
    }
  }
}
</script>

<style lang="scss" scoped>
.alertbar {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 32rpx;
  border-radius: var(--r-8);
  font-size: var(--fs-12);
  line-height: 1.5;

}
.alertbar-left { flex-shrink: 0; }
.alertbar-content { margin-left: 16rpx; }
.alertbar-right { margin-left: 16rpx; }
.alertbar-icon { font-size: 32rpx; font-weight: 600; }
.alertbar-content { flex: 1; }
.alertbar-right { flex-shrink: 0; }
.alertbar-close { font-size: 28rpx; color: inherit; opacity: 0.6; }

.alertbar-info { background: var(--in-bg); color: var(--in); }
.alertbar-success { background: var(--ok-bg); color: var(--ok); }
.alertbar-warning { background: var(--wa-bg); color: var(--wa); }
.alertbar-error { background: var(--er-bg); color: var(--er); }
</style>
