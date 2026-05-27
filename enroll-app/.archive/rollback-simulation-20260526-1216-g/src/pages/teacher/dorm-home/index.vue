<template>
  <view class="page">
    <SNavBar title="宿舍查看" :showBack="true" />

    <scroll-view scroll-y class="body">
      <view class="card stats-card">
        <view class="stat-item">
          <text class="stat-num">{{ stats.total }}</text>
          <text class="stat-lbl">班级人数</text>
        </view>
        <view class="stat-item">
          <text class="stat-num ok">{{ stats.assigned }}</text>
          <text class="stat-lbl">已分配</text>
        </view>
        <view class="stat-item">
          <text class="stat-num wa">{{ stats.unassigned }}</text>
          <text class="stat-lbl">未分配</text>
        </view>
      </view>

      <view class="search-card">
        <input
          v-model="keyword"
          class="search-input"
          confirm-type="search"
          placeholder="搜索姓名、学号或班级"
          placeholder-class="search-placeholder"
        />
      </view>

      <view class="list">
        <view class="student-card" v-for="item in filteredList" :key="item.sid" @click="goDetail(item)">
          <view class="avatar">{{ item.name.charAt(0) }}</view>
          <view class="info">
            <view class="name-row">
              <text class="name">{{ item.name }}</text>
              <SBadge :color="item.dorm ? 'ok' : 'wa'">{{ item.dorm ? '已分配' : '未分配' }}</SBadge>
            </view>
            <text class="meta">{{ item.sid }} · {{ item.className }}</text>
            <view class="dorm-grid">
              <view class="dorm-cell">
                <text class="cell-lbl">宿舍楼</text>
                <text class="cell-val">{{ item.building }}</text>
              </view>
              <view class="dorm-cell">
                <text class="cell-lbl">房间</text>
                <text class="cell-val">{{ item.room }}</text>
              </view>
              <view class="dorm-cell">
                <text class="cell-lbl">床位</text>
                <text class="cell-val">{{ item.bed }}</text>
              </view>
            </view>
          </view>
          <text class="arrow">›</text>
        </view>
        <SEmpty v-if="filteredList.length === 0" text="暂无匹配学生" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { getStudents } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

function parseDorm(dorm) {
  const text = dorm || ''
  const parts = text.split(/\s+/).filter(Boolean)
  return {
    building: parts[0] || '未分配',
    room: parts[1] || '-',
    bed: parts[2] || '-'
  }
}

export default {
  name: 'TeacherDormHome',
  components: { SNavBar, SBadge, SEmpty },
  data() {
    return {
      keyword: '',
      list: []
    }
  },
  computed: {
    stats() {
      const total = this.list.length
      const assigned = this.list.filter(item => item.dorm).length
      return { total, assigned, unassigned: total - assigned }
    },
    filteredList() {
      const kw = this.keyword.trim()
      if (!kw) return this.list
      return this.list.filter(item =>
        [item.name, item.sid, item.className].some(value => String(value || '').includes(kw))
      )
    }
  },
  onShow() {
    this.list = getStudents().map(student => ({
      ...student,
      ...parseDorm(student.dorm)
    }))
  },
  methods: {
    goDetail(item) {
      rememberStaffBackTarget('/pages/teacher/dorm-home/index')
      uni.navigateTo({ url: `/pages/teacher/dorm-detail/index?id=${item.studentId || ''}&sid=${item.sid}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 40rpx; }
.card,
.search-card,
.student-card {
  background: var(--white);
  border-radius: var(--r-14);
  box-shadow: var(--card-shadow);
}
.stats-card {
  margin: 28rpx;
  padding: 32rpx 0;
  display: flex;
}
.stat-item { flex: 1; text-align: center; border-right: 1px solid var(--N200); }
.stat-item:last-child { border-right: none; }
.stat-num { display: block; font-size: var(--fs-22); font-weight: 700; color: var(--brand); line-height: 1.2; }
.stat-num.ok { color: var(--ok); }
.stat-num.wa { color: var(--wa); }
.stat-lbl { display: block; margin-top: 8rpx; font-size: var(--fs-11); color: var(--N500); }
.search-card { margin: 0 28rpx 20rpx; padding: 0 24rpx; }
.search-input { height: 88rpx; font-size: var(--fs-13); color: var(--N900); }
.search-placeholder { color: var(--N400); }
.list { padding: 0 28rpx 28rpx; }
.student-card {
  display: flex;
  align-items: center;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.student-card:active { transform: scale(.995); background: var(--N50); }
.student-card > * + * { margin-left: 20rpx; }
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--r-full);
  background: var(--brand-t);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-15);
  font-weight: 700;
  flex-shrink: 0;
}
.info { flex: 1; min-width: 0; }
.name-row { display: flex; align-items: center; justify-content: space-between; }
.name { font-size: var(--fs-15); font-weight: 700; color: var(--N900); }
.meta { display: block; margin-top: 6rpx; font-size: var(--fs-12); color: var(--N500); }
.dorm-grid { display: flex; margin-top: 18rpx; background: var(--N50); border-radius: var(--r-8); padding: 16rpx 0; }
.dorm-cell { flex: 1; text-align: center; border-right: 1px solid var(--N200); min-width: 0; }
.dorm-cell:last-child { border-right: none; }
.cell-lbl { display: block; font-size: var(--fs-10); color: var(--N400); }
.cell-val { display: block; margin-top: 6rpx; font-size: var(--fs-12); color: var(--N700); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arrow { color: var(--N400); font-size: 32rpx; flex-shrink: 0; }
</style>
