<template>
  <view class="sbadge" :class="[colorClass, variantClass]" :style="customStyle">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'SBadge',
  props: {
    color: { type: String, default: 'brand' },
    variant: { type: String, default: 'fill' },
    customStyle: { type: String, default: '' }
  },
  computed: {
    colorClass() {
      return 'sbadge-' + this.color
    },
    variantClass() {
      return this.variant === 'outline' ? 'sbadge-outline' : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.sbadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 40rpx;
  font-size: var(--badge-font-size);
  padding: var(--badge-padding);
  border-radius: var(--badge-radius);
  font-weight: 600;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
/* §6.9 语义变体 */
.sbadge-brand { background: var(--brand-t); color: var(--brand-d); }
.sbadge-ok { background: var(--ok-bg); color: var(--ok); }
.sbadge-wa { background: var(--wa-bg); color: var(--wa); }
.sbadge-er { background: var(--er-bg); color: var(--er); }
.sbadge-in { background: var(--in-bg); color: var(--in); }
.sbadge-pu { background: var(--pu-bg); color: var(--pu); }
.sbadge-gy { background: var(--N50); color: var(--N500); }

.sbadge-outline { background: transparent; border: 1px solid currentColor; }
.sbadge-outline.sbadge-brand { color: var(--brand); }
.sbadge-outline.sbadge-ok { color: var(--ok); }
.sbadge-outline.sbadge-wa { color: var(--wa); }
.sbadge-outline.sbadge-er { color: var(--er); }
.sbadge-outline.sbadge-in { color: var(--in); }
.sbadge-outline.sbadge-pu { color: var(--pu); }
.sbadge-outline.sbadge-gy { color: var(--N500); }
</style>
