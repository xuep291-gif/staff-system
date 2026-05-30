<template>
  <view class="page">
    <SNavBar title="报到统计" :showBack="true" fallbackUrl="/pages/teacher/home/index" />
    <scroll-view scroll-y class="scroll-body">
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
            <text class="stat-num stat-num--in">{{ deferredCount }}</text>
            <text class="stat-label">已延期</text>
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

      <!-- Unchecked Students Card -->
      <SCard title="未报到学生" :padding="16">
        <view class="student-list">
          <view class="student-row" v-for="student in uncheckedStudents" :key="filterVersion + '-' + student.id" @click="goDetail(student)">
            <view class="student-avatar">
              <text>{{ student.name.charAt(0) }}</text>
            </view>
            <view class="student-info">
              <view class="student-info-top">
                <text class="student-name">{{ student.name }}</text>
                <text class="student-id">{{ student.studentId }}</text>
              </view>
              <text class="student-reason">{{ student.reason }}</text>
            </view>
            <view class="student-actions">
              <view class="action-btn urge" @click.stop="urgeStudent(student)">
                <text>催促</text>
              </view>
              <view class="action-btn delay" @click.stop="delayStudent(student)">
                <text>延期</text>
              </view>
            </view>
            <SBadge :color="student.badgeColor">{{ student.badge }}</SBadge>
          </view>
        </view>
        <view class="more-link" v-if="remainingCount > 0">
          <text class="more-link-text">还有 {{ remainingCount }} 名学生未完成报到 ›</text>
        </view>
      </SCard>

      <!-- Deferred Students Card -->
      <SCard title="已延期学生" :padding="16" v-if="deferredStudents.length > 0">
        <view class="student-list">
          <view class="student-row" v-for="student in deferredStudents" :key="'def-' + filterVersion + '-' + student.id" @click="goDetail(student)">
            <view class="student-avatar">
              <text>{{ student.name.charAt(0) }}</text>
            </view>
            <view class="student-info">
              <view class="student-info-top">
                <text class="student-name">{{ student.name }}</text>
                <text class="student-id">{{ student.studentId }}</text>
              </view>
              <text class="student-reason">{{ student.reason }}</text>
            </view>
            <SBadge color="in">{{ student.badge }}</SBadge>
          </view>
        </view>
      </SCard>

      <!-- QR Code Scan Entry -->
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
import { checkinApi } from '@/common/api/checkin.js'
import { reminderApi } from '@/common/api/reminder.js'
import { getClassSummary, getStudents, updateStudentCheckin, updateStudentDelay } from '@/utils/businessState.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

export default {
  name: 'TeacherCheckin',
  components: { SNavBar, SBadge, SProgressBar, SCard },
  data() {
    return {
      stats: { checkedIn: 0, unchecked: 0, total: 0 },
      className: '2026级1班',
      checkinRate: 83.3,
      stepList: [
        { name: '身份验证绑定', done: 42, total: 42, status: 'ok' },
        { name: '资料提交', done: 34, total: 42, status: 'wa' },
        { name: '资料审核通过', done: 26, total: 42, status: 'wa' },
        { name: '学费缴纳', done: 37, total: 42, status: 'wa' },
        { name: '宿舍分配完成', done: 38, total: 42, status: 'wa' },
        { name: '报到完成', done: 35, total: 42, status: 'ok' }
      ],
      uncheckedStudents: [],
      deferredStudents: [],
      remainingCount: 0,
      deferredCount: 0,
      filterVersion: 0
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
    this.filterVersion++
    try { uni.removeStorageSync('staff_back_target') } catch (e) { /* optional */ }
    await this.refresh()
  },
  methods: {
    refresh() {
      const summary = getClassSummary()
      const students = getStudents()
      this.stats = summary.checkin
      this.checkinRate = summary.checkin.rate
      this.className = students[0]?.className || this.className
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
      const unchecked = students.filter(item => !item.checkedIn && !item.deferred)
      this.uncheckedStudents = unchecked
        .map(item => ({
          id: item.sid,
          name: item.name,
          studentId: item.sid,
          reason: '待完成报到流程',
          badge: '待报到',
          badgeColor: 'wa'
        }))
        .slice(0, 5)
      this.deferredStudents = students
        .filter(item => !item.checkedIn && item.deferred)
        .map(item => ({
          id: item.sid,
          name: item.name,
          studentId: item.sid,
          reason: '已申请延期报到',
          badge: '已延期',
          badgeColor: 'in'
        }))
      this.deferredCount = students.filter(item => item.deferred).length
      this.remainingCount = Math.max(0, unchecked.length - this.uncheckedStudents.length)
    },
    goDetail(student) {
      rememberStaffBackTarget('/pages/teacher/checkin/index')
      uni.navigateTo({ url: `/pages/teacher/student-detail/index?sid=${student.studentId}` })
    },
    async urgeStudent(student) {
      await reminderApi.sendReminder({ studentId: student.studentId, channels: ['site', 'sms'], scene: 'checkin' })
      uni.showToast({ title: '已向 ' + student.name + ' 发送催促通知', icon: 'success' })
    },
    async delayStudent(student) {
      const res = await uni.showModal({
        title: '延期报到',
        content: '确认为 ' + student.name + ' 办理延期报到？'
      })
      if (!res.confirm) return
      const expectedCheckinDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
      checkinApi.delay(student.studentId, {
        reason: '学生申请延期报到',
        expectedCheckinDate
      }).catch(() => {})
      updateStudentDelay(student.studentId, true)
      this.filterVersion++
      this.refresh()
      uni.showToast({ title: '已办理延期报到', icon: 'success' })
    },
    scanQR() {
      uni.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: async ({ result }) => {
          const studentId = String(result || '').replace(/^checkin:/, '').trim()
          if (!studentId) {
            uni.showToast({ title: '二维码未包含学生信息', icon: 'none' })
            return
          }
          const res = await checkinApi.confirm(studentId, {
            checkinMethod: 'qr_scan',
            location: '报到现场',
            remark: '扫码确认报到'
          })
          if (res?.data?.code === 0) {
            updateStudentCheckin(studentId, true)
            this.filterVersion++
            this.refresh()
            uni.showToast({ title: '报到确认成功', icon: 'success' })
          }
        },
        fail: () => {
          uni.showToast({ title: '未完成扫码', icon: 'none' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); padding-bottom: 40rpx; display: flex; flex-direction: column; }
.scroll-body { height: 0; flex: 1; }

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
.stat-num--in { color: var(--in); }
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

/* ── Unchecked Students ── */
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

.student-actions { display: flex; flex-shrink: 0; margin-right: 16rpx; }
.student-actions > view + view { margin-left: 10rpx; }
.action-btn {
  min-height: 40rpx;
  padding: var(--badge-padding);
  border-radius: var(--badge-radius);
  font-size: var(--badge-font-size);
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.action-btn.urge { background: var(--wa-bg); color: var(--wa); }
.action-btn.urge:active { background: var(--wa); color: var(--white); }
.action-btn.delay { background: var(--in-bg); color: var(--in); }
.action-btn.delay:active { background: var(--in); color: var(--white); }

.more-link { padding: 20rpx 0 4rpx 0; text-align: center; }
.more-link-text { font-size: var(--fs-13); color: var(--N400); }

/* ── QR Section ── */
.qr-section { padding: 0 28rpx; }
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
