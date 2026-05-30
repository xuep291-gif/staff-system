<template>
  <view class="nb" :class="{ 'nb-brand': variant === 'brand' }">
    <view class="nb-left" @click="onBack" v-if="showBack">
      <text class="nb-back-icon">{{ backIcon }}</text>
    </view>
    <view class="nb-center">
      <text class="nb-title" v-if="title">{{ title }}</text>
      <view v-show="!title" class="nb-title-slot">
        <slot name="title" />
      </view>
    </view>
    <view class="nb-right">
      <slot name="right" />
    </view>
  </view>
  <view class="nb-placeholder" v-if="placeholder" />
</template>

<script>
import { getRoleFromStorage, getRoleHomePage } from '@/utils/role.js'
import { resolveStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'SNavBar',
  props: {
    title: { type: String, default: '' },
    showBack: { type: Boolean, default: true },
    backIcon: { type: String, default: '←' },
    placeholder: { type: Boolean, default: true },
    variant: { type: String, default: 'white' },
    fallbackUrl: { type: String, default: '' }
  },
  emits: ['back'],
  methods: {
    onBack() {
      this.$emit('back')
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
        return
      }
      const home = getRoleHomePage(getRoleFromStorage() || 'teacher')
      uni.reLaunch({ url: resolveStaffBackTarget(this.fallbackUrl || home) })
    }
  }
}
</script>

<style lang="scss" scoped>
/* ── §6.1 导航栏 ── */
.nb {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--navbar-padding);
  height: var(--navbar-height);
  box-sizing: border-box;
}
.nb > view + view { margin-left: 20rpx; }

.nb-placeholder {
  height: var(--navbar-height);
  flex-shrink: 0;
}

/* §6.1 白底导航栏（子页面默认） */
.nb {
  background: var(--navbar-wh-bg);
  border-bottom: var(--navbar-wh-border);
}
.nb .nb-back-icon { color: var(--N700); font-size: 36rpx; }
.nb .nb-title { color: var(--navbar-wh-text); }
.nb .nb-right { color: var(--navbar-wh-action); }

/* §6.1 品牌色导航栏 */
.nb-brand {
  background: var(--navbar-bg);
  border-bottom: none;
  transition: background .3s;
}
.nb-brand .nb-back-icon { color: var(--navbar-text); }
.nb-brand .nb-title { color: var(--navbar-text); }
.nb-brand .nb-right { color: var(--navbar-text); }

.nb-left {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.nb-back-icon { font-size: 36rpx; }

.nb-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nb-title, .nb-title-slot {
  font-size: var(--navbar-title-size);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nb-right {
  min-width: 88rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: var(--navbar-action-size);
}
.nb-right > view + view { margin-left: 24rpx; }
</style>
