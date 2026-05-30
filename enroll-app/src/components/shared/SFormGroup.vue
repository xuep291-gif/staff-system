<template>
  <view class="sfg">
    <view class="sfg-label">
      <text class="sfg-label-text">{{ label }}</text>
      <text v-if="required" class="sfg-required">*</text>
    </view>
    <slot />
    <text v-if="hint && !error" class="sfg-hint">{{ hint }}</text>
    <text v-if="error" class="sfg-err">{{ error }}</text>
  </view>
</template>

<script>
export default {
  name: 'SFormGroup',
  props: {
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
    required: { type: Boolean, default: false }
  }
}
</script>

<style lang="scss" scoped>
.sfg {
  display: flex;
  flex-direction: column;
}
.sfg > view + view { margin-top: 8rpx; }

.sfg-label {
  display: flex;
  align-items: center;
}
.sfg-label > view + view { margin-left: 6rpx; }

.sfg-label-text {
  font-size: var(--fs-13);
  font-weight: 600;
  color: var(--N700);
}
.sfg-required {
  color: var(--er);
  font-size: var(--fs-13);
  font-weight: 700;
}
.sfg-hint {
  font-size: var(--fs-11);
  color: var(--N400);
}
.sfg-err {
  font-size: var(--fs-11);
  color: var(--er);
}
</style>
