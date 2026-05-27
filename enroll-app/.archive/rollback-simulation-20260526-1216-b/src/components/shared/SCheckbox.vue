<template>
  <view
    class="scheckbox"
    :class="{ checked: modelValue, disabled }"
    @click="toggle"
  >
    <text v-if="modelValue" class="scheckbox-mark">✓</text>
  </view>
</template>

<script>
export default {
  name: 'SCheckbox',
  props: {
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    toggle() {
      if (this.disabled) return
      const checked = !this.modelValue
      this.$emit('update:modelValue', checked)
      this.$emit('change', checked)
    }
  }
}
</script>

<style lang="scss" scoped>
.scheckbox {
  width: 32rpx;
  height: 32rpx;
  border-radius: 8rpx;
  border: 2rpx solid var(--N200);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: background .15s, border-color .15s;
}
.scheckbox.checked {
  background: var(--brand);
  border-color: var(--brand);
}
.scheckbox.disabled {
  background: var(--N50);
  border-color: var(--N200);
}
.scheckbox-mark {
  color: var(--white);
  font-size: var(--fs-11);
  line-height: 1;
  font-weight: 700;
}
</style>
