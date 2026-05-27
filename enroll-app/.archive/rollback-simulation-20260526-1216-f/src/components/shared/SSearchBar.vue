<template>
  <view class="ssb">
    <view class="ssb-icon" v-if="showIcon">
      <text>🔍</text>
    </view>
    <input
      class="ssb-input"
      :value="modelValue"
      :placeholder="placeholder"
      placeholder-style="color: var(--N400)"
      @input="onInput"
      @confirm="$emit('search', modelValue)"
    />
    <view class="ssb-clear" v-if="modelValue && clearable" @click="onClear">
      <text>✕</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SSearchBar',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '搜索' },
    showIcon: { type: Boolean, default: true },
    clearable: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'search'],
  methods: {
    onInput(e) {
      this.$emit('update:modelValue', e.detail.value)
    },
    onClear() {
      this.$emit('update:modelValue', '')
      this.$emit('search', '')
    }
  }
}
</script>

<style lang="scss" scoped>
.ssb {
  display: flex;
  align-items: center;
  background: var(--N50);
  border-radius: var(--r-8);
  padding: 0 24rpx;
  height: 72rpx;

  > * + * { margin-left: 16rpx; }
}
.ssb-icon {
  flex-shrink: 0;
  font-size: var(--fs-14);
}
.ssb-input {
  flex: 1;
  height: 100%;
  font-size: var(--fs-14);
  color: var(--N900);
  background: transparent;
  border: none;
}
.ssb-clear {
  flex-shrink: 0;
  width: 40rpx;
  height: 40rpx;
  border-radius: var(--r-full);
  background: var(--N200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-10);
  color: var(--white);
}
</style>
