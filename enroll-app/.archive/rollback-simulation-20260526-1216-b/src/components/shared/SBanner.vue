<template>
  <!-- §6.4 Banner 首页顶部横幅 -->
  <view class="banner">
    <view class="banner-avatar" v-if="$slots.avatar || avatar" @click="$emit('avatar-click')">
      <slot name="avatar">
        <text>{{ avatar }}</text>
      </slot>
    </view>
    <view class="banner-info">
      <slot name="info">
        <text class="banner-name" v-if="name">{{ name }}</text>
        <text class="banner-sub" v-if="sub">{{ sub }}</text>
      </slot>
    </view>
    <slot name="actions" />
  </view>
</template>

<script>
export default {
  name: 'SBanner',
  props: {
    avatar: { type: String, default: '' },
    name: { type: String, default: '' },
    sub: { type: String, default: '' }
  },
  emits: ['avatar-click']
}
</script>

<style lang="scss" scoped>
.banner {
  background: var(--banner-bg);
  padding: var(--banner-padding);
  display: flex;
  align-items: center;
  transition: background .3s;
  flex-shrink: 0;
}
.banner > * + * { margin-left: 24rpx; }

.banner-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: var(--r-full);
  background: rgba(255,255,255,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-20);
  font-weight: 700;
  color: var(--white);
  flex-shrink: 0;
  border: 4rpx solid rgba(255,255,255,.3);
}

.banner-info {
  flex: 1;
  min-width: 0;
}
.banner-name {
  font-size: var(--banner-name-size);
  font-weight: 700;
  color: var(--white);
  display: block;
}
.banner-sub {
  font-size: var(--banner-sub-size);
  color: rgba(255,255,255,.7);
  margin-top: 4rpx;
  display: block;
}
</style>
