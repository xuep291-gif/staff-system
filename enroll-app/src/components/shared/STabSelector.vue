<template>
  <view class="stabs-wrapper">
    <scroll-view scroll-x show-scrollbar="false" class="stabs-scroll">
      <view class="stabs-bar">
        <view
          v-for="(tab, idx) in tabs"
          :key="idx"
          class="stabs-tab"
          :class="{ 'stabs-on': idx === modelValue }"
          @click="onSelect(idx)"
        >
          <text class="stabs-tab-label">{{ tab.label }}</text>
          <text v-if="tab.count !== undefined" class="stabs-tab-count">{{ tab.count }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'STabSelector',
  props: {
    tabs: { type: Array, default: () => [] },
    modelValue: { type: Number, default: 0 }
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
.stabs-wrapper {
  background: var(--white);
  border-bottom: 1px solid var(--N200);
  flex-shrink: 0;
}
.stabs-scroll { width: 100%; }
.stabs-bar {
  display: flex;
}
.stabs-tab {
  flex: 1;
  padding: 20rpx 8rpx;
  text-align: center;
  font-size: var(--fs-12);
  color: var(--N400);
  border-bottom: 2px solid transparent;
  font-weight: 500;
  white-space: nowrap;
  transition: all .2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stabs-tab > view + view { margin-left: 8rpx; }

.stabs-on {
  color: var(--brand);
  border-bottom-color: var(--brand);
  font-weight: 600;
}

.stabs-tab-label {
  display: inline;
}
.stabs-tab-count {
  font-size: var(--fs-10);
  background: var(--N200);
  color: var(--N500);
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  font-weight: 600;
  min-width: 32rpx;
  text-align: center;
}
.stabs-on .stabs-tab-count {
  background: var(--brand-t);
  color: var(--brand);
}
</style>
