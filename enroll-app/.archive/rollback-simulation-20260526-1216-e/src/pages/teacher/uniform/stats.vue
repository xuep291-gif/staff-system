<template>
  <view class="page">
    <SNavBar title="尺码统计" :showBack="true" />
    <scroll-view scroll-y class="body">
      <view class="chart-card" v-for="group in groupedStats" :key="group.gender">
        <view class="card-hd">
          <text class="card-ttl">{{ group.gender }}尺码统计</text>
          <text class="card-total">{{ group.total }} 人</text>
        </view>
        <view class="section">
          <text class="section-title">衣服尺码</text>
          <view class="bar-row" v-for="item in group.clothing" :key="item.label" @click="showList(group.gender, 'clothing', item.label)">
            <text class="bar-label">{{ item.label }}</text>
            <view class="bar-track"><view class="bar-fill" :style="{ width: width(item.count, group.maxClothing) }"></view></view>
            <text class="bar-count">{{ item.count }}人</text>
          </view>
        </view>
        <view class="section">
          <text class="section-title">鞋码统计</text>
          <view class="bar-row" v-for="item in group.shoes" :key="item.label" @click="showList(group.gender, 'shoe', item.label)">
            <text class="bar-label">{{ item.label }}码</text>
            <view class="bar-track"><view class="bar-fill shoe" :style="{ width: width(item.count, group.maxShoe) }"></view></view>
            <text class="bar-count">{{ item.count }}人</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="sheet.show" class="ovl on" @click="sheet.show = false">
      <view class="sheet" @click.stop>
        <view class="shandle"></view>
        <text class="stitle">{{ sheet.title }}</text>
        <view class="sbody2">
          <view class="name-row" v-for="s in sheet.list" :key="s.sid">
            <text>{{ s.name }}</text>
            <text>{{ s.sid }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import { getSizeList, SIZE_STATUS } from '@/utils/businessState.js'

const countBy = (list, field) => {
  const map = {}
  list.filter(i => i.status !== SIZE_STATUS.EMPTY && i[field]).forEach(i => {
    map[i[field]] = (map[i[field]] || 0) + 1
  })
  return Object.keys(map).sort((a, b) => Number(a) - Number(b)).map(label => ({ label, count: map[label] }))
}

export default {
  name: 'TeacherUniformStats',
  components: { SNavBar },
  data() {
    return { list: [], sheet: { show: false, title: '', list: [] } }
  },
  computed: {
    groupedStats() {
      return ['男', '女'].map(gender => {
        const rows = this.list.filter(i => i.gender === gender)
        const clothing = countBy(rows, 'clothing')
        const shoes = countBy(rows, 'shoe')
        return {
          gender,
          total: rows.length,
          clothing,
          shoes,
          maxClothing: Math.max(...clothing.map(i => i.count), 1),
          maxShoe: Math.max(...shoes.map(i => i.count), 1)
        }
      })
    }
  },
  onShow() {
    this.list = getSizeList()
  },
  methods: {
    width(count, max) {
      return `${Math.max(8, Math.round(count / max * 100))}%`
    },
    showList(gender, field, value) {
      this.sheet = {
        show: true,
        title: `${gender} · ${field === 'shoe' ? value + '码' : value}`,
        list: this.list.filter(i => i.gender === gender && String(i[field]) === String(value))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 48rpx; }
.chart-card { margin: 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden; }
.card-hd { padding: var(--card-header-padding); border-bottom: 1px solid var(--N50); display: flex; align-items: center; justify-content: space-between; }
.card-ttl { font-size: var(--fs-15); color: var(--N900); font-weight: 600; }
.card-total { font-size: var(--fs-12); color: var(--N400); }
.section { padding: 24rpx 28rpx; }
.section + .section { border-top: 12rpx solid var(--N50); }
.section-title { display: block; font-size: var(--fs-12); color: var(--N500); font-weight: 600; margin-bottom: 16rpx; }
.bar-row { display: flex; align-items: center; min-height: 56rpx; }
.bar-row + .bar-row { margin-top: 12rpx; }
.bar-label { width: 96rpx; font-size: var(--fs-12); color: var(--N700); font-weight: 600; }
.bar-track { flex: 1; height: 18rpx; background: var(--N200); border-radius: 9rpx; overflow: hidden; }
.bar-fill { height: 100%; background: var(--brand); border-radius: 9rpx; transition: width .35s; }
.bar-fill.shoe { background: var(--in); }
.bar-count { width: 72rpx; text-align: right; font-size: var(--fs-12); color: var(--brand); font-weight: 600; }
.ovl { position: fixed; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0); z-index: 300; visibility: hidden; transition: background .25s, visibility .25s; }
.ovl.on { background: rgba(0,0,0,.45); visibility: visible; }
.sheet { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 40rpx 40rpx 0 0; padding: 0 0 72rpx; transform: translateY(100%); transition: transform .28s cubic-bezier(.32,.72,0,1); }
.ovl.on .sheet { transform: translateY(0); }
.shandle { width: 72rpx; height: 8rpx; background: var(--N200); border-radius: 4rpx; margin: 20rpx auto 0; }
.stitle { display: block; text-align: center; padding: 28rpx 32rpx 24rpx; font-size: var(--fs-16); font-weight: 600; color: var(--N900); border-bottom: 1px solid var(--N50); }
.sbody2 { padding: 24rpx 32rpx; }
.name-row { display: flex; justify-content: space-between; font-size: var(--fs-13); color: var(--N700); padding: 18rpx 0; border-bottom: 1px solid var(--N50); }
</style>
