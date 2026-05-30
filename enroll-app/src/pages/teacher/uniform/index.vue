<template>
  <view class="page">
    <SNavBar title="军训尺码" :showBack="true">
      <template #right>
        <text class="nav-link" @click="doExport">导出</text>
      </template>
    </SNavBar>
    <scroll-view scroll-y class="body">
      <!-- Stats Summary -->
      <view class="summary-card">
        <view class="summary-item">
          <text class="summary-num">{{ stats.total }}</text>
          <text class="summary-label">班级人数</text>
        </view>
        <view class="summary-item">
          <text class="summary-num ok">{{ stats.filled }}</text>
          <text class="summary-label">已填写</text>
        </view>
        <view class="summary-item">
          <text class="summary-num wa">{{ stats.empty }}</text>
          <text class="summary-label">未填写</text>
        </view>
        <view class="summary-item">
          <text class="summary-num er">{{ stats.abnormal }}</text>
          <text class="summary-label">异常</text>
        </view>
      </view>

      <!-- Search -->
      <view class="search-wrap">
        <input class="search" v-model="keyword" placeholder="搜索姓名/学号" />
      </view>

      <!-- Student List -->
      <view class="list-card">
        <view
          v-for="item in filteredList"
          :key="item.sid"
          class="size-row"
          @click="goDetail(item)"
        >
          <view class="avatar">{{ item.name.charAt(0) }}</view>
          <view class="main">
            <view class="title-row">
              <text class="name">{{ item.name }}</text>
              <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
            </view>
            <text class="meta">{{ item.gender }} · {{ item.className }}</text>
            <text class="sizes">衣服 {{ item.clothing || '-' }} · 鞋码 {{ item.shoe || '-' }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <SEmpty v-if="filteredList.length === 0" icon="👕" text="暂无尺码数据" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { getSizeList, SIZE_STATUS } from '@/utils/businessState.js'

export default {
  name: 'TeacherUniform',
  components: { SNavBar, SBadge, SEmpty },
  data() {
    return {
      keyword: '',
      list: []
    }
  },
  computed: {
    stats() {
      return {
        total: this.list.length,
        filled: this.list.filter(i => i.status === SIZE_STATUS.FILLED).length,
        empty: this.list.filter(i => i.status === SIZE_STATUS.EMPTY).length,
        abnormal: this.list.filter(i => i.status === SIZE_STATUS.ABNORMAL).length
      }
    },
    filteredList() {
      const kw = this.keyword.trim()
      if (!kw) return this.list
      return this.list.filter(item => item.name.includes(kw) || item.sid.includes(kw))
    }
  },
  onShow() {
    this.list = getSizeList()
  },
  methods: {
    goDetail(item) {
      uni.navigateTo({ url: '/pages/teacher/uniform/detail?sid=' + item.sid })
    },
    doExport() {
      const rows = this.list
      if (rows.length === 0) {
        uni.showToast({ title: '暂无数据可导出', icon: 'none' })
        return
      }
      try {
        const headers = ['学生姓名', '学号', '班级', '衣服尺码', '鞋码', '填写状态']
        const csvRows = [headers.join(',')]
        rows.forEach(r => {
          csvRows.push([
            r.name,
            r.sid,
            r.className,
            r.clothing || '-',
            r.shoe || '-',
            r.statusLabel
          ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        })
        const bom = '﻿'
        // #ifdef H5
        const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '本班军训尺码信息.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        // #endif
        // #ifdef MP-WEIXIN
        uni.showToast({ title: '小程序端暂不支持导出CSV', icon: 'none' })
        // #endif
        uni.showToast({ title: '导出成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '导出失败', icon: 'none' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 48rpx; }
.nav-link { color: var(--brand); font-size: var(--fs-13); font-weight: 600; }

/* ── Stats Summary ── */
.summary-card {
  margin: 28rpx; padding: 28rpx 0; background: var(--white);
  border-radius: var(--r-14); box-shadow: var(--card-shadow); display: flex;
}
.summary-item { flex: 1; text-align: center; border-right: 1px solid var(--N200); }
.summary-item:last-child { border-right: none; }
.summary-num { display: block; font-size: var(--fs-22); color: var(--brand); font-weight: 700; }
.summary-num.ok { color: var(--ok); }
.summary-num.wa { color: var(--wa); }
.summary-num.er { color: var(--er); }
.summary-label { font-size: var(--fs-10); color: var(--N400); margin-top: 4rpx; }

/* ── Search ── */
.search-wrap { margin: 0 28rpx 20rpx; }
.search {
  height: 88rpx; padding: 0 24rpx; border-radius: var(--r-12);
  background: var(--white); border: 1.5px solid var(--N200);
  font-size: var(--fs-13); box-sizing: border-box; width: 100%;
}

/* ── List ── */
.list-card {
  margin: 0 28rpx; background: var(--white);
  border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden;
}
.size-row {
  display: flex; align-items: center; padding: 24rpx 28rpx;
  border-bottom: 1px solid var(--N50); transition: background .15s;
}
.size-row:active { background: var(--N50); }
.size-row:last-child { border-bottom: none; }
.size-row > view + view { margin-left: 20rpx; }
.avatar {
  width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--brand-t);
  color: var(--brand); display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-15); font-weight: 700; flex-shrink: 0;
}
.main { flex: 1; min-width: 0; }
.title-row { display: flex; align-items: center; justify-content: space-between; }
.name { font-size: var(--fs-14); color: var(--N900); font-weight: 600; }
.meta, .sizes { display: block; font-size: var(--fs-11); color: var(--N500); margin-top: 4rpx; }
.arrow { color: var(--N400); font-size: 32rpx; }
</style>
