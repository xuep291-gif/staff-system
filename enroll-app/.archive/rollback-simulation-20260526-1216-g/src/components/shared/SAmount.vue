<template>
  <view class="amount" :class="sizeClass" :style="color ? { color } : ''">
    <text class="amount-symbol">{{ symbol }}</text>
    <text class="amount-value">{{ formattedValue }}</text>
    <text v-if="suffix" class="amount-suffix">{{ suffix }}</text>
  </view>
</template>

<script>
export default {
  name: 'SAmount',
  props: {
    value: { type: Number, default: 0 },
    symbol: { type: String, default: '¥' },
    suffix: { type: String, default: '' },
    size: { type: String, default: 'md' },
    color: { type: String, default: '' }
  },
  computed: {
    sizeClass() {
      return 'amount-' + this.size
    },
    formattedValue() {
      return this.value.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.amount {
  display: inline-flex;
  align-items: baseline;
  font-weight: 700;
  color: var(--N900);
}
.amount-symbol {
  font-weight: 500;
}
.amount-suffix {
  font-size: 0.7em;
  font-weight: 400;
  color: var(--N500);
  margin-left: 4rpx;
}
.amount-sm { font-size: var(--fs-14); }
.amount-sm .amount-symbol { font-size: 22rpx; }
.amount-md { font-size: var(--fs-18); }
.amount-md .amount-symbol { font-size: var(--fs-13); }
.amount-lg { font-size: var(--fs-24); }
.amount-lg .amount-symbol { font-size: var(--fs-16); }
.amount-xl { font-size: var(--fs-32); }
.amount-xl .amount-symbol { font-size: var(--fs-20); }
</style>
