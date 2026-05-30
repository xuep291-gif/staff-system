<template>
  <view class="ssp">
    <view class="ssp-ico" :class="'ssp-ico-' + iconType">
      <text class="ssp-ico-text">{{ icon }}</text>
    </view>
    <text class="ssp-title">{{ title }}</text>
    <text v-if="sub" class="ssp-sub">{{ sub }}</text>
    <slot />
  </view>
</template>

<script>
export default {
  name: 'SSuccessPage',
  props: {
    icon: { type: String, default: '✓' },
    iconType: { type: String, default: 'ok' },
    title: { type: String, default: '' },
    sub: { type: String, default: '' }
  }
}
</script>

<style lang="scss" scoped>
.ssp {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 96rpx 40rpx 48rpx;
}
.ssp > view + view { margin-top: 24rpx; }

.ssp-ico {
  width: 144rpx;
  height: 144rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ssp-ico-ok { background: var(--ok-bg); }
.ssp-ico-wa { background: var(--wa-bg); }
.ssp-ico-er { background: var(--er-bg); }

.ssp-ico-text {
  font-size: 64rpx;
}

.ssp-title {
  font-size: var(--fs-18);
  font-weight: 700;
  color: var(--N900);
  text-align: center;
}
.ssp-sub {
  font-size: 26rpx;
  color: var(--N500);
  text-align: center;
  line-height: 1.6;
  white-space: pre-line;
}
</style>
