<template>
  <view class="sheet-overlay" :class="{ 'sheet-overlay-on': modelValue }" @click="onOverlayClick">
    <view class="sheet-panel" :class="{ 'sheet-open': modelValue }" @click.stop>
      <view class="sheet-handle" />
      <view class="sheet-header" :class="{ 'sheet-header--hidden': !hasHeaderSlot }">
        <slot name="header">
          <text class="sheet-title">{{ title }}</text>
        </slot>
      </view>
      <scroll-view scroll-y class="sheet-body">
        <slot />
      </scroll-view>
      <view class="sheet-footer" :class="{ 'sheet-footer--hidden': !hasFooterSlot }">
        <slot name="footer" />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SBottomSheet',
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    closable: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'close'],
  computed: {
    hasHeaderSlot() {
      return !!(this.$slots.header || this.title)
    },
    hasFooterSlot() {
      return !!this.$slots.footer
    }
  },
  methods: {
    onOverlayClick() {
      if (this.closable) {
        this.$emit('update:modelValue', false)
        this.$emit('close')
      }
    },
    close() {
      this.$emit('update:modelValue', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
/* ── §6.25 Bottom Sheet ── */
.sheet-overlay {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  background: rgba(0,0,0,0);
  z-index: 1000;
  visibility: hidden;
  transition: background .25s, visibility .25s;
}
.sheet-overlay-on {
  background: var(--sheet-overlay);
  visibility: visible;
}

.sheet-panel {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: var(--white);
  border-radius: var(--sheet-radius);
  width: 100%;
  max-height: 800rpx;
  padding-bottom: env(safe-area-inset-bottom);
  transform: translateY(100%);
  transition: transform .28s cubic-bezier(.32,.72,0,1);
}
.sheet-open {
  transform: translateY(0);
}

/* §6.25 拖拽手柄 */
.sheet-handle {
  width: 72rpx;
  height: 8rpx;
  background: var(--N200);
  border-radius: 4rpx;
  margin: 20rpx auto 0;
}

.sheet-header {
  padding: 28rpx 32rpx 24rpx;
  border-bottom: 1px solid var(--N50);
}
.sheet-header--hidden {
  display: none;
}
.sheet-title {
  font-size: var(--fs-16);
  font-weight: 600;
  color: var(--N900);
}

.sheet-body {
  padding: 32rpx;
  max-height: 600rpx;
  display: flex;
  flex-direction: column;
  > view + view { margin-top: 24rpx; }
}

.sheet-footer {
  padding: 24rpx 32rpx;
  border-top: 1px solid var(--N50);
}
.sheet-footer--hidden {
  display: none;
}
</style>
