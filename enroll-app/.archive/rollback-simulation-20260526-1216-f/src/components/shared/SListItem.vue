<template>
  <view class="sli" @click="$emit('click')">
    <view class="sli-left" v-if="$slots.avatar || avatar">
      <slot name="avatar">
        <view class="sli-avatar" :style="{ background: avatarBg }">{{ avatar }}</view>
      </slot>
    </view>
    <view class="sli-body">
      <slot />
    </view>
    <view class="sli-right" v-if="$slots.right || showArrow">
      <slot name="right">
        <text v-if="showArrow" class="sli-arrow">›</text>
      </slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SListItem',
  props: {
    avatar: { type: String, default: '' },
    avatarBg: { type: String, default: 'var(--brand-t)' },
    showArrow: { type: Boolean, default: false }
  },
  emits: ['click']
}
</script>

<style lang="scss" scoped>
.sli {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid var(--N50);
}
.sli:last-child { border-bottom: none; }
.sli-left {
  margin-right: 24rpx;
  flex-shrink: 0;
}
.sli-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-14);
  font-weight: 600;
  color: var(--brand-d);
}
.sli-body {
  flex: 1;
  min-width: 0;
}
.sli-right {
  flex-shrink: 0;
  margin-left: 16rpx;
}
.sli-arrow {
  font-size: var(--fs-18);
  color: var(--N400);
}
</style>
