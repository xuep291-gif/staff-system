<template>
  <view class="page">
    <SNavBar title="缴费管理" :showBack="true" />
    <scroll-view scroll-y class="sbody">
      <view class="year-row">
        <text class="year-label">当前学年</text>
        <picker :range="schoolYears" :value="schoolYearIndex" @change="onYearChange">
          <view class="year-picker">{{ activeYear }} <text>⌄</text></view>
        </picker>
      </view>

      <!-- §6.8 统计卡片 -->
      <SCard :padding="0">
        <view class="prog-section">
          <SProgressBar :percent="payRate" color="brand" headLabel="班级缴费进度" :headPercent="true" />
        </view>
        <view class="summary-grid">
          <view class="summary-item" v-for="tab in paymentTabs" :key="tab.key" @click="onPaymentTabChange(tab.key)">
            <text class="summary-num">{{ tab.count }}</text>
            <text class="summary-label">{{ tab.label }}</text>
          </view>
        </view>
        <view class="outstanding-row">
          <text>班级欠费总额</text>
          <text class="outstanding-amount">¥{{ formattedOutstanding }}</text>
        </view>
      </SCard>

      <!-- §6.19 下划线式 Tab -->
      <StatusTabs v-model="activePaymentStatus" :tabs="paymentTabs" @change="onPaymentTabChange" />

      <!-- 学生列表卡片 -->
      <SCard :padding="0">
        <template #header>
          <text class="card-ttl">学生列表</text>
        </template>
        <template #action>
          <view class="card-hd-right">
            <text v-if="selectedIds.length > 0" class="sel-hint">已选 {{ selectedIds.length }} 人</text>
            <text class="sel-all" @click="toggleSelectAll">{{ selectAllLabel }}</text>
          </view>
        </template>
        <view class="stu-list">
          <view
            class="stu-item"
            :class="{ selected: selectedIds.includes(stu.studentNo) }"
            v-for="stu in filteredStudents"
            :key="stu.studentNo"
          >
            <view class="stu-check" @click="onCheckStudent(stu)">
              <SCheckbox :modelValue="selectedIds.includes(stu.studentNo)" :disabled="!isUrgeEligible(stu)" />
            </view>
            <view class="stu-avatar" :style="{ background: stu.avatarBg }">{{ stu.name.charAt(0) }}</view>
            <view class="stu-info" @click="goDetail(stu)">
              <text class="stu-name">{{ stu.name }}</text>
              <text class="stu-meta">{{ stu.studentNo }} · {{ stu.className }} · {{ stu.daysLabel }}</text>
              <text class="stu-fee">
                应缴 ¥{{ formatMoney(stu.expectedAmount) }} · 已缴 ¥{{ formatMoney(stu.paidAmount) }}
                <text v-if="stu.overdueDays"> · 逾期 {{ stu.overdueDays }} 天</text>
              </text>
            </view>
            <text class="stu-amount">¥{{ formatMoney(stu.dueAmount) }}</text>
            <SBadge :color="stu.listBadgeColor">{{ stu.listStatusLabel }}</SBadge>
            <text v-if="stu.urgeCount > 0" class="urge-tag">已催缴{{ stu.urgeCount }}次</text>
          </view>
          <SEmpty v-if="filteredStudents.length === 0" text="暂无数据" />
        </view>
      </SCard>

      <!-- §6.10 操作按钮 -->
      <view class="btn-area">
        <SButton variant="secondary" block size="md" @click="openSheet('selected')">
          催缴选中（{{ selectedIds.length }}人）
        </SButton>
        <view style="margin-top: 20rpx;">
          <SButton variant="primary" block size="md" :disabled="sending" @click="batchUrgeAll">
            一键催缴（全部未缴费）
          </SButton>
        </view>
      </view>
    </scroll-view>

    <!-- §6.25 催缴确认 BottomSheet -->
    <SBottomSheet v-model="showSheet" title="确认发送催缴通知">
      <text class="smsg">即将向 {{ urgeTargetCount }} 名学生发送缴费提醒通知，确认发送？</text>
      <view class="send-preview" v-if="urgeTargetCount > 0">
        <view v-if="sending" class="spin" />
        <text>{{ sending ? '正在发送催缴通知…' : '本次发送对象会逐一记录催缴次数和时间' }}</text>
      </view>
      <view class="brow">
        <SButton variant="danger" block size="md" @click="showSheet = false">取消</SButton>
        <SButton variant="primary" block size="md" :disabled="sending" @click="confirmUrge">确认发送</SButton>
      </view>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import SCard from '@/components/shared/SCard.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SButton from '@/components/shared/SButton.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import SCheckbox from '@/components/shared/SCheckbox.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import { getFeeList, getPaymentSummary, urgeStudents } from '@/utils/businessState.js'
import { reminderApi } from '@/common/api/reminder.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'

const PAYMENT_KEY_STATUS_MAP = {
  unpaid: ['unpaid', 'overdue'],
  partial: ['partial'],
  paid: ['paid'],
  green: ['channel', 'green_channel']
}

export default {
  name: 'TeacherFeeHome',
  components: { SNavBar, StatusTabs, SCard, SBadge, SButton, SProgressBar, SEmpty, SCheckbox, SBottomSheet },
  data() {
    return {
      activePaymentStatus: 'unpaid',
      selectedIds: [],
      showSheet: false,
      urgeMode: 'selected',
      sending: false,
      allStudents: [],
      activeYear: '2025-2026学年',
      schoolYears: ['2025-2026学年', '2024-2025学年']
    }
  },
  computed: {
    paymentTabs() {
      return [
        { key: 'unpaid', label: '未缴费', count: this.allStudents.filter(s => PAYMENT_KEY_STATUS_MAP.unpaid.includes(s.payStatus)).length },
        { key: 'partial', label: '部分未缴费', count: this.allStudents.filter(s => PAYMENT_KEY_STATUS_MAP.partial.includes(s.payStatus)).length },
        { key: 'paid', label: '已缴费', count: this.allStudents.filter(s => PAYMENT_KEY_STATUS_MAP.paid.includes(s.payStatus)).length },
        { key: 'green', label: '绿色通道', count: this.allStudents.filter(s => PAYMENT_KEY_STATUS_MAP.green.includes(s.payStatus)).length }
      ]
    },
    stats() { return getPaymentSummary(this.allStudents) },
    payRate() { return this.stats.payRate },
    filteredStudents() {
      const statuses = PAYMENT_KEY_STATUS_MAP[this.activePaymentStatus] || PAYMENT_KEY_STATUS_MAP.unpaid
      return this.allStudents.filter(s => statuses.includes(s.payStatus))
    },
    selectAllLabel() {
      const selectable = this.filteredStudents.filter(this.isUrgeEligible)
      if (selectable.length === 0) return '无可选'
      return this.selectedIds.length === selectable.length ? '取消全选' : '全选未缴'
    },
    urgeTargetCount() { return this.getUrgeTargets().length },
    schoolYearIndex() {
      const index = this.schoolYears.indexOf(this.activeYear)
      return index >= 0 ? index : 0
    },
    formattedOutstanding() { return this.formatMoney(this.stats.outstandingAmount) }
  },
  watch: {
    activePaymentStatus() { this.selectedIds = [] }
  },
  onLoad() {
    this.onBusinessStateChange = ({ collection }) => {
      if (collection === 'fees') this.refresh()
    }
    if (typeof uni.$on === 'function') uni.$on('business-state-change', this.onBusinessStateChange)
  },
  onUnload() {
    if (this.onBusinessStateChange && typeof uni.$off === 'function') uni.$off('business-state-change', this.onBusinessStateChange)
  },
  methods: {
    onPaymentTabChange(key) {
      this.activePaymentStatus = key
      console.log('当前选中状态:', key)
    },
    onYearChange(event) {
      this.activeYear = this.schoolYears[Number(event.detail.value)] || this.schoolYears[0]
      try { uni.setStorageSync('teacher_fee_school_year', this.activeYear) } catch (e) { /* optional */ }
    },
    isUrgeEligible(stu) { return ['unpaid', 'overdue'].includes(stu.payStatus) },
    onCheckStudent(stu) {
      if (!this.isUrgeEligible(stu)) return
      const idx = this.selectedIds.indexOf(stu.studentNo)
      if (idx > -1) this.selectedIds.splice(idx, 1)
      else this.selectedIds.push(stu.studentNo)
    },
    toggleSelectAll() {
      const selectable = this.filteredStudents.filter(this.isUrgeEligible)
      if (selectable.length === 0) return
      if (this.selectedIds.length === selectable.length) this.selectedIds = []
      else this.selectedIds = selectable.map(s => s.studentNo)
    },
    openSheet(mode = 'selected') {
      if (mode === 'selected' && this.selectedIds.length === 0) {
        uni.showToast({ title: '请先选择学生', icon: 'none' })
        return
      }
      this.urgeMode = mode
      this.showSheet = true
    },
    getUrgeTargets() {
      if (this.urgeMode === 'all') return this.allStudents.filter(this.isUrgeEligible).map(s => s.studentNo)
      return this.selectedIds
    },
    async confirmUrge() {
      if (this.sending) return
      const targets = this.getUrgeTargets()
      if (targets.length === 0) {
        uni.showToast({ title: '没有需要催缴的学生', icon: 'none' })
        return
      }
      this.sending = true
      try {
        urgeStudents(targets)
        await reminderApi.batchSendReminder({ studentIds: targets, channels: ['site', 'sms'], scope: this.urgeMode })
        this.allStudents = this.allStudents.map(student =>
          targets.includes(student.studentNo) ? { ...student, urgeCount: (student.urgeCount || 0) + 1 } : student)
        await this.refresh()
        this.showSheet = false
        this.selectedIds = []
        uni.showToast({ title: '已发送催缴通知', icon: 'success' })
      } finally { this.sending = false }
    },
    goDetail(stu) {
      rememberStaffBackTarget('/pages/teacher/fee-home/index')
      uni.navigateTo({ url: `/pages/teacher/student-detail/index?id=${stu.studentId}&sid=${stu.studentNo}` })
    },
    batchUrgeAll() {
      const targets = this.allStudents.filter(this.isUrgeEligible)
      if (targets.length === 0) return uni.showToast({ title: '没有需要催缴的学生', icon: 'none' })
      this.selectedIds = targets.map(s => s.studentNo)
      this.openSheet('all')
    },
    refresh() { this.allStudents = getFeeList() },
    formatMoney(value) { return Number(value || 0).toLocaleString() }
  },
  onShow() {
    try { this.activeYear = uni.getStorageSync('teacher_fee_school_year') || this.activeYear } catch (e) { /* optional */ }
    this.refresh()
    this.showSheet = false
    this.sending = false
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.sbody { height: 0; flex: 1; padding-bottom: 40rpx; }

.year-row {
  margin: 24rpx 28rpx 0;
  display: flex; align-items: center; justify-content: space-between;
}
.year-label { font-size: var(--fs-12); color: var(--N500); }
.year-picker {
  min-height: 64rpx; padding: 0 20rpx;
  border-radius: var(--r-8);
  background: var(--white);
  display: flex; align-items: center;
  color: var(--N700); font-size: var(--fs-12);
  box-shadow: var(--card-shadow);
}
.year-picker > * + * { margin-left: 12rpx; }

/* ── 统计卡片内 ── */
.prog-section { padding: 24rpx 32rpx 12rpx; }
.summary-grid { display: flex; border-top: 1px solid var(--N50); padding: 8rpx 16rpx 16rpx; }
.summary-item {
  flex: 1; min-width: 0; text-align: center;
  padding: 16rpx 4rpx; border-radius: var(--r-8);
  transition: background .18s;
}
.summary-item:active { background: var(--brand-t); }
.summary-num { display: block; font-size: var(--fs-15); font-weight: 700; color: var(--brand); }
.summary-label { display: block; margin-top: 4rpx; font-size: var(--fs-10); color: var(--N500); white-space: nowrap; }
.outstanding-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 32rpx 28rpx;
  font-size: var(--fs-12); color: var(--N500);
}
.outstanding-amount { font-size: var(--fs-16); font-weight: 700; color: var(--er); }

/* ── 卡片头部 ── */
.card-ttl { font-size: var(--fs-15); font-weight: 600; color: var(--N900); }
.card-hd-right { display: flex; align-items: center; }
.card-hd-right > * + * { margin-left: 16rpx; }
.sel-hint { font-size: var(--fs-11); color: var(--brand); }
.sel-all { font-size: var(--fs-11); color: var(--brand); font-weight: 500; }

/* ── 学生列表 ── */
.stu-list { padding: 0 28rpx; }
.stu-item {
  display: flex; align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
  border-radius: var(--r-8);
  transition: background .18s, border-color .18s;
  > * + * { margin-left: 16rpx; }
}
.stu-item.selected { background: var(--brand-t); box-shadow: inset 0 0 0 1px var(--brand); }
.stu-item:last-child { border-bottom: none; }

.stu-check { flex-shrink: 0; }
.stu-avatar {
  width: 72rpx; height: 72rpx; border-radius: var(--r-full);
  color: var(--N700);
  font-size: var(--fs-15); font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stu-info { flex: 1; min-width: 0; }
.stu-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.stu-meta { font-size: var(--fs-11); color: var(--N500); margin-top: 4rpx; display: block; }
.stu-fee { font-size: var(--fs-10); color: var(--N500); margin-top: 6rpx; line-height: 1.45; display: block; }
.stu-amount { font-size: var(--fs-14); font-weight: 600; color: var(--N900); flex-shrink: 0; }

.urge-tag {
  font-size: var(--fs-10); color: var(--wa); background: var(--wa-bg);
  padding: 4rpx 12rpx; border-radius: var(--r-20);
  white-space: nowrap; flex-shrink: 0;
}

/* ── 按钮区 ── */
.btn-area { padding: 8rpx 28rpx 40rpx; }

/* ── BottomSheet 内容 ── */
.smsg { font-size: var(--fs-13); color: var(--N500); text-align: center; line-height: 1.6; display: block; }
.send-preview {
  display: flex; align-items: center; justify-content: center;
  min-height: 56rpx; padding: 12rpx 16rpx;
  border-radius: var(--r-8);
  background: var(--brand-t); color: var(--brand);
  font-size: var(--fs-12);
  > * + * { margin-left: 12rpx; }
}
.spin {
  width: 28rpx; height: 28rpx;
  border: 4rpx solid rgba(43,108,176,.18);
  border-top-color: var(--brand);
  border-radius: var(--r-full);
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.brow { display: flex; }
.brow > * + * { margin-left: 16rpx; }
</style>
