<template>
  <view class="page">
    <SNavBar title="报到统计" :showBack="true" />
    <scroll-view scroll-y class="scroll-body">

      <!-- Dimension Switch -->
      <view class="dimension-bar">
        <view
          v-for="dim in dimensions"
          :key="dim.key"
          class="dim-chip"
          :class="{ 'dim-chip--on': dimKey === dim.key }"
          @click="switchDim(dim.key)"
        >
          <text>{{ dim.label }}</text>
        </view>
      </view>

      <picker v-if="dimKey !== 'class'" :range="dimOptions" :value="dimIdx" @change="onDimChange">
        <view class="dim-picker">
          <text>{{ dimOptions[dimIdx] || '全部' }}</text>
          <text class="dim-arrow">▾</text>
        </view>
      </picker>

      <!-- Stats Card -->
      <view class="stats-card">
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-num stat-num--brand">{{ stats.checkedIn }}</text>
            <text class="stat-label">已报到</text>
          </view>
          <view class="stat-item">
            <text class="stat-num stat-num--wa">{{ stats.unchecked }}</text>
            <text class="stat-label">未报到</text>
          </view>
          <view class="stat-item">
            <text class="stat-num stat-num--N500">{{ stats.total }}</text>
            <text class="stat-label">全班</text>
          </view>
        </view>
        <view class="stats-progress">
          <text class="stats-progress-title">{{ className }} 报到率 {{ checkinRate }}%</text>
          <SProgressBar :percent="checkinRate" color="brand" />
        </view>
      </view>

      <!-- Step Progress Card -->
      <SCard title="报到步骤完成情况" :padding="16">
        <view class="step-list">
          <view class="step-row" v-for="step in stepList" :key="step.name">
            <view class="step-row-left">
              <view class="step-dot" :class="'step-dot--' + step.status" />
              <text class="step-name">{{ step.name }}</text>
            </view>
            <view class="step-row-right">
              <text class="step-count" :class="'step-count--' + step.status">
                {{ step.done }} / {{ step.total }}
              </text>
            </view>
          </view>
        </view>
      </SCard>

      <!-- Status Filter -->
      <view class="filter-row">
        <view
          v-for="f in filters"
          :key="f.key"
          class="filter-chip"
          :class="{ 'filter-chip--on': currentFilter === f.key }"
          @click="currentFilter = f.key"
        >
          <text>{{ f.label }} ({{ f.count }})</text>
        </view>
      </view>

      <!-- Student List -->
      <SCard title="学生名单" :padding="16">
        <SEmpty v-if="!filteredStudents.length" text="暂无匹配学生" />
        <view class="student-list">
          <view
            class="student-row"
            v-for="student in filteredStudents"
            :key="student.id"
            @click="viewStudent(student)"
          >
            <view class="student-avatar">
              <text>{{ student.name.charAt(0) }}</text>
            </view>
            <view class="student-info">
              <view class="student-info-top">
                <text class="student-name">{{ student.name }}</text>
                <text class="student-id">{{ student.studentId }}</text>
              </view>
              <text class="student-reason">{{ student.statusLabel }}</text>
            </view>
            <SBadge :color="student.badgeColor">{{ student.badge }}</SBadge>
          </view>
        </view>
        <view class="more-link" v-if="remainingCount > 0">
          <text class="more-link-text">还有 {{ remainingCount }} 名学生未列出 ›</text>
        </view>
      </SCard>

      <!-- QR Scan Entry -->
      <view class="qr-section">
        <view class="qr-card" @click="scanQR">
          <text class="qr-icon">📷</text>
          <view class="qr-info">
            <text class="qr-title">扫码报到</text>
            <text class="qr-sub">扫描学生二维码快速完成报到</text>
          </view>
          <text class="qr-arrow">›</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { checkinApi } from '@/common/api/checkin.js'

export default {
  name: 'FinanceCheckin',
  components: { SNavBar, SBadge, SProgressBar, SCard, SEmpty },
  data() {
    const students = []
    const colleges = [...new Set(students.map(s => s.college).filter(Boolean))]
    const majors = [...new Set(students.map(s => s.major).filter(Boolean))]
    return {
      stats: { checkedIn: 0, unchecked: 0, total: 0 },
      dimKey: 'class',
      dimIdx: 0,
      dimensions: [
        { key: 'class', label: '班级' },
        { key: 'college', label: '学院' },
        { key: 'major', label: '专业' }
      ],
      dimOptions: ['全部'],
      allColleges: colleges,
      allMajors: majors,
      className: '',
      checkinRate: 0,
      currentFilter: 'all',
      filters: [
        { key: 'all', label: '全部', count: 0 },
        { key: 'checkedIn', label: '已报到', count: 0 },
        { key: 'unchecked', label: '未报到', count: 0 }
      ],
      students: [],
      stepList: [
        { name: '身份验证绑定', done: 42, total: 42, status: 'ok' },
        { name: '资料提交', done: 34, total: 42, status: 'wa' },
        { name: '资料审核通过', done: 26, total: 42, status: 'wa' },
        { name: '学费缴纳', done: 37, total: 42, status: 'wa' },
        { name: '宿舍分配完成', done: 38, total: 42, status: 'wa' },
        { name: '报到完成', done: 35, total: 42, status: 'ok' }
      ],
      remainingCount: 0,
      displayLimit: 10
    }
  },
  computed: {
    filteredStudents() {
      let list = this.students
      if (this.currentFilter === 'checkedIn') list = list.filter(s => s.checkedIn)
      else if (this.currentFilter === 'unchecked') list = list.filter(s => !s.checkedIn)
      const shown = list.slice(0, this.displayLimit)
      this.remainingCount = Math.max(0, list.length - shown.length)
      return shown
    }
  },
  onShow() {
    this.refresh()
  },
  methods: {
    refresh() {
      const summary = {}
      const students = []
      this.stats = summary.checkin
      this.checkinRate = summary.checkin.rate
      this.className = students[0]?.className || '2026级1班'

      this.filters = [
        { key: 'all', label: '全部', count: students.length },
        { key: 'checkedIn', label: '已报到', count: students.filter(s => s.checkedIn).length },
        { key: 'unchecked', label: '未报到', count: students.filter(s => !s.checkedIn).length }
      ]

      this.students = students.map(s => ({
        id: s.sid,
        name: s.name,
        studentId: s.sid,
        checkedIn: s.checkedIn,
        className: s.className,
        college: s.college,
        major: s.major,
        dorm: s.dorm,
        phone: s.phone,
        statusLabel: s.checkedIn ? '已完成报到' : '待完成报到流程',
        badge: s.checkedIn ? '已报到' : '待报到',
        badgeColor: s.checkedIn ? 'ok' : 'wa'
      }))

      this.stepList = this.stepList.map((step, index) => {
        const done = index === 1
          ? summary.documents.tabs[1].count
          : index === 2
            ? summary.documents.tabs[1].count
            : index === 3
              ? summary.fees.tabs[2].count + summary.fees.tabs[3].count
              : index === 5
                ? summary.checkin.checkedIn
                : summary.totalStudents
        return { ...step, done, total: summary.totalStudents, status: done === summary.totalStudents ? 'ok' : 'wa' }
      })
    },

    viewStudent(student) {
      uni.showModal({
        title: student.name,
        content: `学号：${student.studentId}\n班级：${student.className}\n学院：${student.college}\n专业：${student.major}\n宿舍：${student.dorm || '未分配'}\n状态：${student.statusLabel}`,
        showCancel: false,
        confirmText: '关闭'
      })
    },

    scanQR() {
      uni.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: (res) => {
          const studentId = String(res.result || '').replace(/^checkin:/, '').trim()
          if (!studentId) {
            uni.showToast({ title: '二维码未包含学生信息', icon: 'none' })
            return
          }
          const student = this.students.find(s => s.studentId === studentId)
          if (!student) {
            uni.showToast({ title: '未找到该学生', icon: 'none' })
            return
          }
          if (student.checkedIn) {
            uni.showToast({ title: student.name + ' 已报到', icon: 'none' })
            return
          }
          checkinApi.confirm(studentId,{checkinMethod:'manual'}).catch(function(){})
          this.refresh()
          uni.showToast({ title: '报到确认成功', icon: 'success' })
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes('cancel')) return
          uni.showToast({ title: '扫码失败，请重试', icon: 'none' })
        }
      })
    },

    switchDim(key) {
      this.dimKey = key
      this.dimIdx = 0
      const students = []
      if (key === 'college') {
        this.dimOptions = ['全部', ...this.allColleges]
      } else if (key === 'major') {
        this.dimOptions = ['全部', ...this.allMajors]
      }
      this.refresh()
    },

    onDimChange(e) {
      this.dimIdx = Number(e.detail.value)
      this.refresh()
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); padding-bottom: 40rpx; display: flex; flex-direction: column; }
.scroll-body { height: 0; flex: 1; }

/* ── Dimension ── */
.dimension-bar {
  display: flex;
  margin: 20rpx 28rpx 0;
  background: var(--N100);
  border-radius: var(--r-20);
  padding: 6rpx;
}
.dim-chip {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  border-radius: var(--r-20);
  font-size: var(--fs-12);
  color: var(--N500);
  transition: all 0.2s;
}
.dim-chip--on {
  background: var(--white);
  color: var(--brand);
  font-weight: 600;
  box-shadow: var(--card-shadow-low);
}
.dim-picker {
  margin: 12rpx 28rpx 0;
  padding: 16rpx 24rpx;
  background: var(--white);
  border-radius: var(--r-8);
  font-size: var(--fs-13);
  color: var(--N700);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--card-shadow-low);
}
.dim-arrow { font-size: 24rpx; color: var(--N400); }

/* ── Stats Card ── */
.stats-card {
  background: var(--white); border-radius: var(--r-14);
  box-shadow: var(--card-shadow); margin: 28rpx; padding: 32rpx;
}
.stats-row { display: flex; justify-content: space-between; }
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-num { font-size: 56rpx; font-weight: 700; line-height: 1.2; }
.stat-num--brand { color: var(--brand); }
.stat-num--wa { color: var(--wa); }
.stat-num--N500 { color: var(--N500); }
.stat-label { font-size: var(--fs-12); color: var(--N500); margin-top: 8rpx; }
.stats-progress { margin-top: 28rpx; }
.stats-progress-title { font-size: var(--fs-12); color: var(--N500); display: block; margin-bottom: 8rpx; }

/* ── Step Progress ── */
.step-list > view + view { margin-top: 4rpx; }
.step-row { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; }
.step-row + .step-row { border-top: 1px solid var(--N50); }
.step-row-left { display: flex; align-items: center; }
.step-dot { width: 16rpx; height: 16rpx; border-radius: 50%; margin-right: 16rpx; flex-shrink: 0; }
.step-dot--ok { background: var(--ok); }
.step-dot--wa { background: var(--wa); }
.step-name { font-size: var(--fs-14); color: var(--N900); font-weight: 500; }
.step-row-right { flex-shrink: 0; margin-left: 16rpx; }
.step-count { font-size: var(--fs-13); font-weight: 600; }
.step-count--ok { color: var(--ok); }
.step-count--wa { color: var(--wa); }

/* ── Filter Row ── */
.filter-row {
  display: flex;
  padding: 20rpx 28rpx 8rpx;
  > view + view { margin-left: 16rpx; }
}
.filter-chip {
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: var(--r-full);
  background: var(--white);
  font-size: var(--fs-12);
  color: var(--N500);
  display: flex;
  align-items: center;
  border: 1px solid var(--N200);
}
.filter-chip--on {
  background: var(--brand-t);
  color: var(--brand);
  border-color: var(--brand);
  font-weight: 600;
}

/* ── Student List ── */
.student-list > view + view { margin-top: 0; }
.student-row { display: flex; align-items: center; padding: 24rpx 0; }
.student-row + .student-row { border-top: 1px solid var(--N50); }
.student-avatar {
  width: 80rpx; height: 80rpx; border-radius: 50%;
  background: var(--brand-t); color: var(--brand);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-14); font-weight: 600; flex-shrink: 0; margin-right: 24rpx;
}
.student-info { flex: 1; min-width: 0; }
.student-info-top { display: flex; align-items: baseline; }
.student-name { font-size: var(--fs-15); font-weight: 600; color: var(--N900); margin-right: 16rpx; }
.student-id { font-size: var(--fs-12); color: var(--N500); }
.student-reason { font-size: var(--fs-12); color: var(--N500); display: block; margin-top: 6rpx; }
.more-link { padding: 20rpx 0 4rpx 0; text-align: center; }
.more-link-text { font-size: var(--fs-13); color: var(--N400); }

/* ── QR Section ── */
.qr-section { padding: 28rpx; }
.qr-card {
  display: flex; align-items: center; padding: 32rpx 28rpx;
  background: var(--white); border-radius: var(--r-14);
  box-shadow: var(--card-shadow); border: 2px dashed var(--brand-t);
}
.qr-icon { font-size: 56rpx; flex-shrink: 0; }
.qr-info { flex: 1; margin-left: 24rpx; min-width: 0; }
.qr-title { font-size: var(--fs-15); font-weight: 600; color: var(--N900); display: block; }
.qr-sub { font-size: var(--fs-12); color: var(--N500); margin-top: 4rpx; display: block; }
.qr-arrow { font-size: 32rpx; color: var(--N400); flex-shrink: 0; }
</style>
