<template>
  <view class="status-tabs-wrapper" :style="underlineVars">
    <view class="status-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="status-tab"
        :class="{ active: tab.key === activeKey }"
        @tap.stop="onSelect(tab.key)"
      >
        <text class="status-tab-label">{{ tab.label }}</text>
        <text class="status-tab-count">{{ tab.count }}</text>
      </view>
    </view>
    <view class="status-tabs-underline" />
  </view>
</template>

<script>
import { getActiveKey, setActiveKey } from '@/utils/tabState.js'

export default {
  name: 'StatusTabs',
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: { type: String, default: '' },
    tabs: { type: Array, default: () => [] },
    tabGroup: { type: String, default: '' }
  },
  computed: {
    activeKey() {
      const ns = this.tabGroup || 'default'
      const fallback = this.modelValue || this.tabs[0]?.key || ''
      return getActiveKey(ns, fallback)
    },
    activeIndex() {
      const idx = this.tabs.findIndex(t => t.key === this.activeKey)
      return idx >= 0 ? idx : 0
    },
    underlineVars() {
      const cols = Math.max(this.tabs.length, 1)
      const pct = (100 / cols)
      return {
        '--ul-left': `${(this.activeIndex * pct).toFixed(2)}%`,
        '--ul-width': `${pct.toFixed(2)}%`
      }
    }
  },
  methods: {
    onSelect(key) {
      if (!this.tabs.some(t => t.key === key)) return
      const ns = this.tabGroup || 'default'
      setActiveKey(ns, key)
      this.$emit('update:modelValue', key)
      this.$emit('change', key)
    }
  }
}
</script>

<style lang="scss" scoped>
.status-tabs-wrapper {
  background: var(--white);
  flex-shrink: 0;
  position: relative;
}

.status-tabs {
  display: flex;
  width: 100%;
  background: var(--white);
}

.status-tab {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 80rpx;
  font-size: var(--fs-13);
  font-weight: 500;
  color: var(--N500);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-sizing: border-box;
  white-space: nowrap;
  transition: color .18s ease;
}

.status-tab.active {
  color: var(--brand);
  font-weight: 600;
}

.status-tab-label {
  font-size: var(--fs-13);
  color: inherit;
  font-weight: inherit;
}

.status-tab-count {
  margin-top: 2rpx;
  font-size: var(--fs-10);
  color: inherit;
  font-weight: inherit;
}

.status-tabs-underline {
  position: absolute;
  bottom: 0;
  left: var(--ul-left);
  width: var(--ul-width);
  height: 6rpx;
  background: var(--brand);
  border-radius: 3rpx;
  transition: left .25s cubic-bezier(.4, 0, .2, 1);
}
</style>
