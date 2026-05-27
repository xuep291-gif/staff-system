<template>
  <view class="spm">
    <view
      v-for="(m, idx) in methods"
      :key="idx"
      class="spm-item"
      :class="{ 'spm-on': idx === modelValue }"
      @click="onSelect(idx)"
    >
      <text class="spm-ico">{{ m.icon }}</text>
      <text class="spm-lbl">{{ m.label }}</text>
      <!-- §6.18 单选圆圈 -->
      <view class="spm-radio" :class="{ checked: idx === modelValue }">
        <view v-if="idx === modelValue" class="spm-radio-dot" />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SPaymentMethods',
  props: {
    methods: { type: Array, default: () => [] },
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
/* ── §6.18 支付方式选择器 ── */
.spm {
  display: flex;
  padding: 0 0 8rpx;
}
.spm > * + * { margin-left: 16rpx; }

.spm-item {
  flex: 1;
  padding: 24rpx 16rpx;
  border-radius: var(--r-12);
  border: 1.5px solid var(--N200);
  text-align: center;
  transition: all .15s;
  position: relative;
}
.spm-on {
  border-color: var(--brand);
  background: var(--brand-t);
}

.spm-ico {
  font-size: 44rpx;
  display: block;
  margin-bottom: 8rpx;
}
.spm-lbl {
  font-size: var(--fs-11);
  font-weight: 600;
  color: var(--N500);
  display: block;
}
.spm-on .spm-lbl { color: var(--brand); }

/* §6.18 单选圆圈 18px */
.spm-radio {
  width: 36rpx;
  height: 36rpx;
  border-radius: var(--r-full);
  border: 3rpx solid var(--N200);
  margin: 12rpx auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spm-radio.checked {
  border-color: var(--brand);
  background: var(--brand);
}
.spm-radio-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: var(--r-full);
  background: var(--white);
}
</style>
