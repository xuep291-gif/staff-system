<template>
  <view class="status-tabs-wrapper">
    <view class="status-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="status-tab"
        :class="{ active: tab.key === modelValue }"
        hover-class="status-tab-pressed"
        :hover-stay-time="80"
        @tap="onSelect(tab.key)"
      >
        <text class="status-tab-label">{{ tab.label }}</text>
        <text class="status-tab-count">{{ tab.count }}</text>
      </view>
      <view class="status-tabs-underline" :style="underlineStyle" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'StatusTabs',
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: { type: String, default: 'unpaid' },
    tabs: {
      type: Array,
      default: () => [
        { key: 'unpaid', label: '未缴费', count: 8 },
        { key: 'partial', label: '部分未缴费', count: 1 },
        { key: 'paid', label: '已缴费', count: 2 },
        { key: 'green', label: '绿色通道', count: 1 }
      ]
    }
  },
  computed: {
    activeIndex() {
      const idx = this.tabs.findIndex(t => t.key === this.modelValue)
      return idx >= 0 ? idx : 0
    },
    underlineWidth() {
      return `${100 / Math.max(this.tabs.length, 1)}%`
    },
    underlineStyle() {
      return {
        width: this.underlineWidth,
        transform: `translateX(${this.activeIndex * 100}%)`
      }
    }
  },
  methods: {
    onSelect(key) {
      if (!this.tabs.some(t => t.key === key)) return
      console.log('切换缴费状态:', key)
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
}

.status-tabs {
  display: grid;
  grid-template-columns: repeat(v-bind('tabs.length'), 1fr);
  width: 100%;
  background: var(--white);
  position: relative;
}

.status-tab {
  position: relative;
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

.status-tab-pressed {
  background: var(--N50);
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
  left: 0;
  height: 6rpx;
  background: var(--brand);
  border-radius: 3rpx;
  transition: transform .25s cubic-bezier(.4, 0, .2, 1);
}
</style>
