<template>
  <button
    class="sbtn"
    :class="[variantClass, sizeClass, { 'sbtn-block': block }]"
    :disabled="disabled"
    :loading="loading"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'SButton',
  props: {
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    block: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  emits: ['click'],
  computed: {
    variantClass() {
      return 'sbtn-' + this.variant
    },
    sizeClass() {
      return this.size !== 'md' ? 'sbtn-' + this.size : ''
    }
  }
}
</script>

<style lang="scss" scoped>
/* ── §6.10 按钮基础 ── */
.sbtn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--r-8);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  line-height: 1;
  box-sizing: border-box;
}
.sbtn > * + * { margin-left: 12rpx; }

.sbtn-block { width: 100%; }

/* §6.10 尺寸 */
.sbtn-sm { padding: 12rpx 28rpx; font-size: var(--fs-12); min-height: var(--btn-sm-h); }
.sbtn-md { padding: 20rpx 40rpx; min-height: 88rpx; }
.sbtn-lg { padding: 28rpx 48rpx; font-size: var(--fs-16); min-height: var(--btn-cta-h); }

/* §6.10 主按钮 */
.sbtn-primary {
  background: var(--brand);
  color: var(--white);
}
.sbtn-primary:active {
  background: var(--brand-d) !important;
  color: var(--white) !important;
}

/* §6.10 次按钮 / 描边 */
.sbtn-secondary {
  background: var(--N50);
  color: var(--N700);
}
.sbtn-secondary:active {
  background: var(--brand-t) !important;
  color: var(--brand-d) !important;
}

/* 幽灵按钮 */
.sbtn-ghost {
  background: transparent;
  color: var(--brand);
  border: 1px solid var(--brand);
}
.sbtn-ghost:active {
  background: var(--N50) !important;
}

/* §6.10 危险按钮 */
.sbtn-danger {
  background: var(--er);
  color: var(--white);
}
.sbtn-danger:active {
  background: var(--er) !important;
  color: var(--white) !important;
}

/* §6.10 警告按钮 */
.sbtn-warning {
  background: var(--wa-bg);
  color: #92400E;
  border: 1px solid var(--wa-bd);
}
.sbtn-warning:active {
  background: var(--wa) !important;
  color: var(--white) !important;
}

/* §6.10 胶囊按钮 (pill) */
.sbtn-pill {
  border-radius: var(--btn-pill-radius);
  height: var(--btn-pill-h);
  padding-left: 24rpx;
  padding-right: 24rpx;
  font-size: var(--fs-12);
}

/* 禁用态 */
.sbtn:disabled {
  opacity: 0.5;
}
</style>
