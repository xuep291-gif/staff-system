<template>
  <view class="float-card" :style="{ marginTop: offset + 'px' }">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'SFloatCard',
  props: {
    offset: { type: Number, default: -28 }
  }
}
</script>

<style lang="scss" scoped>
.float-card {
  background: var(--white);
  border-radius: var(--r-14);
  margin-left: 28rpx;
  margin-right: 28rpx;
  padding: var(--sp-16);
  box-shadow: var(--card-shadow-high);
  position: relative;
  z-index: 2;
}
</style>
