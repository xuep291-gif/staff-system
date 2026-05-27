<template>
  <view class="stabbar">
    <view
      v-for="(item, idx) in items"
      :key="idx"
      class="stabbar-item"
      :class="{ active: idx === modelValue }"
      @click="onSelect(idx)"
    >
      <view class="stabbar-icon-wrap" v-if="item.icon">
        <text class="stabbar-icon">{{ item.icon }}</text>
      </view>
      <text class="stabbar-text">{{ item.text }}</text>
      <view class="stabbar-badge" v-if="item.badge">
        <text>{{ item.badge }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'STabBar',
  props: {
    items: { type: Array, default: () => [] },
    modelValue: { type: Number, default: 0 },
    safeBottom: { type: Number, default: 0 }
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    onSelect(idx) {
      this.$emit('update:modelValue', idx)
      this.$emit('change', idx)
    }
  }
}
</script>

<style lang="scss" scoped>
.stabbar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: var(--tabbar-h);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
  background: var(--tabbar-bg);
  border-top: var(--tabbar-border);
  box-shadow: var(--tabbar-shadow);
  display: flex;
  z-index: 100;
  > * + * { margin-left: 0; }
}
.stabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  > * + * { margin-top: 4rpx; }
}
.stabbar-icon-wrap {
  min-width: 56rpx;
  height: 48rpx;
  padding: 0 14rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--N400);
}
.stabbar-icon {
  font-size: var(--fs-20);
  color: inherit;
}
.stabbar-text {
  font-size: var(--fs-10);
  font-weight: 500;
  color: var(--N400);
}
.stabbar-item.active .stabbar-text {
  color: var(--brand);
}
.stabbar-item.active .stabbar-icon-wrap {
  color: var(--brand);
  background: var(--brand-t);
}
.stabbar-badge {
  position: absolute;
  top: 8rpx;
  left: 58%;
  background: var(--er);
  color: var(--white);
  font-size: var(--fs-10);
  padding: 4rpx 12rpx;
  border-radius: var(--r-20);
  min-width: 36rpx;
  text-align: center;
}
</style>
