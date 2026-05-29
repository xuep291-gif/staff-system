<template>
  <view class="page">
    <SNavBar title="报到统计" :showBack="true" fallbackUrl="/pages/government/home/index" />

    <scroll-view scroll-y class="body">
      <!-- Stats Overview Card -->
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
            <text class="stat-num stat-num--brand">{{ stats.checkinRate }}%</text>
            <text class="stat-label">报到率</text>
          </view>
        </view>
        <view class="stats-progress">
          <SProgressBar :percent="stats.checkinRate" color="brand" />
        </view>
      </view>

      <!-- College Check-in Card -->
      <SCard title="各学院报到情况" :padding="16">
        <view class="college-list">
          <view class="college-item" v-for="college in collegeList" :key="college.name">
            <view class="college-item-hd">
              <text class="college-name">{{ college.name }}</text>
              <text class="college-count">{{ college.checked }} / {{ college.total }}</text>
            </view>
            <SProgressBar :percent="college.rate" :color="college.rate >= 95 ? 'ok' : college.rate >= 90 ? 'wa' : 'er'" />
          </view>
        </view>
      </SCard>

      <!-- Unchecked Students Card -->
      <SCard title="未报到学生" :padding="16">
        <view class="student-list">
          <view class="student-row" v-for="student in uncheckedStudents" :key="student.id" @click="goStudent(student)">
            <view class="student-avatar">
              <text>{{ student.name.charAt(0) }}</text>
            </view>
            <view class="student-info">
              <view class="student-info-top">
                <text class="student-name">{{ student.name }}</text>
                <text class="student-id">{{ student.studentId }}</text>
              </view>
              <text class="student-college">{{ student.college }}</text>
              <text class="student-status">{{ student.lastStatus }}</text>
            </view>
            <SBadge :color="student.badgeColor">{{ student.badge }}</SBadge>
          </view>
        </view>
        <view class="more-link">
          <text class="more-link-text">查看全部 {{ uncheckedTotal }} 名 ›</text>
        </view>
      </SCard>

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
import SCard from '@/components/shared/SCard.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
import { checkinApi } from '@/common/api/checkin.js'
import { getClassSummary, getStudents, updateStudentCheckin } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'GovernmentCheckin',
  components: {
    SNavBar,
    SCard,
    SProgressBar,
    SBadge
  },
  data() {
    return {
      stats: {
        checkedIn: 0,
        unchecked: 0,
        checkinRate: 0
      },
      collegeList: [],
      uncheckedStudents: [],
      uncheckedTotal: 0
    }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'students') this.refresh()
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  async onShow() {
    try { uni.removeStorageSync('staff_back_target') } catch (e) { /* optional */ }
    await this.refresh()
  },
  methods: {
    refresh() {
      const summary = getClassSummary()
      const students = getStudents()
      this.stats = { checkedIn: summary.checkin.checkedIn, unchecked: summary.checkin.unchecked, checkinRate: summary.checkin.rate }
      this.collegeList = [{
        name: students[0]?.college || '计算机学院',
        checked: summary.checkin.checkedIn,
        total: summary.totalStudents,
        rate: summary.checkin.rate
      }]
      this.uncheckedTotal = summary.checkin.unchecked
      this.uncheckedStudents = students
        .filter(item => !item.checkedIn)
        .map(item => ({
          id: item.sid,
          name: item.name,
          studentId: item.sid,
          college: item.className,
          lastStatus: '待完成报到流程',
          badge: '待报到',
          badgeColor: 'wa'
        }))
        .slice(0, 3)
    },
    goStudent(student) {
      rememberStaffBackTarget('/pages/government/checkin/index')
      uni.navigateTo({ url: `/pages/teacher/student-detail/index?id=${student.id}&sid=${student.studentId}` })
    },
    scanQR() {
      uni.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: async ({ result }) => {
          const studentId = String(result || '').replace(/^checkin:/, '').trim()
          if (!studentId) return uni.showToast({ title: '二维码未包含学生信息', icon: 'none' })
          const res = await checkinApi.confirm(studentId, { checkinMethod: 'qr_scan', location: '政务报到现场', remark: '扫码确认报到' })
          if (res?.data?.code === 0) {
            updateStudentCheckin(studentId, true)
            this.refresh()
            uni.showToast({ title: '报到确认成功', icon: 'success' })
          }
        },
        fail: () => uni.showToast({ title: '未完成扫码', icon: 'none' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 48rpx; }

/* ========== Stats Overview Card ========== */
.stats-card {
  background: var(--white);
  border-radius: var(--r-14);
  box-shadow: var(--card-shadow);
  margin: 28rpx;
  padding: 32rpx;
}

.stats-row {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: var(--fs-22);
  font-weight: 700;
  line-height: 1.2;
}

.stat-num--brand { color: var(--brand); }
.stat-num--wa { color: var(--wa); }

.stat-label {
  font-size: var(--fs-12);
  color: var(--N500);
  margin-top: 8rpx;
}

.stats-progress {
  margin-top: 28rpx;
}

/* ========== College List ========== */
.college-list {
  > * + * { margin-top: 0; }
}

.college-item {
  padding: 20rpx 0;
}

.college-item + .college-item {
  border-top: 1px solid var(--N50);
}

.college-item-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.college-name {
  font-size: var(--fs-14);
  font-weight: 700;
  color: var(--N900);
}

.college-count {
  font-size: var(--fs-13);
  color: var(--N500);
  flex-shrink: 0;
  margin-left: 16rpx;
}

/* ========== Unchecked Students ========== */
.student-list {
  > * + * { margin-top: 0; }
}

.student-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0;

  > * + * { margin-left: 16rpx; }
}

.student-row + .student-row {
  border-top: 1px solid var(--N50);
}

.student-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--r-full);
  background: var(--brand-t);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-14);
  font-weight: 600;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-info-top {
  display: flex;
  align-items: baseline;
}

.student-name {
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--N900);
  margin-right: 16rpx;
}

.student-id {
  font-size: var(--fs-12);
  color: var(--N500);
}

.student-college {
  font-size: var(--fs-12);
  color: var(--N700);
  display: block;
  margin-top: 4rpx;
}

.student-status {
  font-size: var(--fs-12);
  color: var(--N500);
  display: block;
  margin-top: 4rpx;
}

.more-link {
  padding: 20rpx 0 4rpx 0;
  text-align: center;
}

.more-link-text {
  font-size: var(--fs-13);
  color: var(--N400);
}
.qr-section { padding: 0 28rpx 28rpx; }
.qr-card {
  display: flex; align-items: center; padding: 32rpx 28rpx;
  background: var(--white); border-radius: var(--r-14);
  box-shadow: var(--card-shadow); border: 2px dashed var(--brand-t);
}
.qr-icon { font-size: 56rpx; flex-shrink: 0; }
.qr-info { flex: 1; margin-left: 24rpx; min-width: 0; }
.qr-title { display: block; font-size: var(--fs-15); font-weight: 600; color: var(--N900); }
.qr-sub { display: block; margin-top: 4rpx; font-size: var(--fs-12); color: var(--N500); }
.qr-arrow { font-size: 32rpx; color: var(--N400); }
</style>
