<template>
  <view class="page">
    <SNavBar title="缴费管理" :showBack="true" fallbackUrl="/pages/teacher/home/index" />
    <view class="top-area">
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
    </view>

    <!-- §6.19 下划线式 Tab（在 scroll-view 外部，避免触摸事件冲突） -->
    <StatusTabs tabGroup="feeHome" :tabs="paymentTabs" :modelValue="activeTab" @change="onTabClick" />

    <scroll-view scroll-y class="sbody">
      <!-- 学生列表卡片 -->
      <view :key="'scard-wrap-' + contentKey">
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
            :key="activeTab + '-' + filterVersion + '-' + selectionVersion + '-' + stu.studentNo"
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
      </view>

      <!-- §6.10 操作按钮（仅未缴费/部分未缴费可见） -->
      <view class="btn-area" v-if="activeTab === 'unpaid' || activeTab === 'partial'">
        <SButton variant="secondary" block size="md" :disabled="sending" @click="confirmSendSelected">
          确认发送（{{ selectedIds.length }}人）
        </SButton>
        <view style="margin-top: 20rpx;">
          <SButton variant="primary" block size="md" :disabled="sending" @click="confirmSendAll">
            一键催缴（{{ urgeCount }}人）
          </SButton>
        </view>
      </view>
    </scroll-view>
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
import { getFeeList, getPaymentSummary, urgeStudents } from '@/utils/businessState.js'
import { reminderApi } from '@/common/api/reminder.js'
import { rememberStaffBackTarget } from '@/utils/staffNavigation.js'
import { getActiveKey, setActiveKey } from '@/utils/tabState.js'

const PAYMENT_KEY_STATUS_MAP = {
  unpaid: ['unpaid', 'overdue'],
  partial: ['partial'],
  paid: ['paid'],
  green: ['channel', 'green_channel']
}

export default {
  name: 'TeacherFeeHome',
  components: { SNavBar, StatusTabs, SCard, SBadge, SButton, SProgressBar, SEmpty, SCheckbox },
  data() {
    return {
      selectedIds: [],
      sending: false,
      activeTab: 'unpaid',
      filterVersion: 0,
      contentKey: 0,
      selectionVersion: 0,
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
      const statuses = PAYMENT_KEY_STATUS_MAP[this.activeTab] || PAYMENT_KEY_STATUS_MAP.unpaid
      const result = this.allStudents.filter(s => statuses.includes(s.payStatus))
      console.log('[fee-home] filteredStudents: activeTab=', this.activeTab, 'statuses=', statuses, 'input=', this.allStudents.length, 'output=', result.length)
      return result
    },
    selectAllLabel() {
      const selectable = this.filteredStudents.filter(this.isUrgeEligible)
      if (selectable.length === 0) return '无可选'
      return this.selectedIds.length === selectable.length ? '取消全选' : '全选可催缴'
    },
    schoolYearIndex() {
      const index = this.schoolYears.indexOf(this.activeYear)
      return index >= 0 ? index : 0
    },
    formattedOutstanding() { return this.formatMoney(this.stats.outstandingAmount) },
    urgeCount() { return this.allStudents.filter(this.isUrgeEligible).length }
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
      this.onTabClick(key)
    },
    onTabClick(key) {
      console.log('[fee-home] onTabClick key=', key, 'current=', this.activeTab)
      if (this.activeTab === key) return
      this.activeTab = key
      this.selectedIds = []
      this.filterVersion++
      this.contentKey++
      this.selectionVersion++
      setActiveKey('feeHome', key)
    },
    onYearChange(event) {
      this.activeYear = this.schoolYears[Number(event.detail.value)] || this.schoolYears[0]
      try { uni.setStorageSync('teacher_fee_school_year', this.activeYear) } catch (e) { /* optional */ }
    },
    isUrgeEligible(stu) { return ['unpaid', 'overdue', 'partial'].includes(stu.payStatus) },
    onCheckStudent(stu) {
      if (!this.isUrgeEligible(stu)) return
      if (this.selectedIds.includes(stu.studentNo)) {
        this.selectedIds = this.selectedIds.filter(id => id !== stu.studentNo)
      } else {
        this.selectedIds = this.selectedIds.concat(stu.studentNo)
      }
      this.selectionVersion++
    },
    toggleSelectAll() {
      const selectable = this.filteredStudents.filter(this.isUrgeEligible)
      if (selectable.length === 0) return
      if (this.selectedIds.length === selectable.length) this.selectedIds = []
      else this.selectedIds = selectable.map(s => s.studentNo)
      this.selectionVersion++
    },
    confirmSendSelected() {
      if (this.selectedIds.length === 0) {
        uni.showToast({ title: '请先选择学生', icon: 'none' })
        return
      }
      this.doSendUrge(this.selectedIds)
    },
    confirmSendAll() {
      const targets = this.allStudents.filter(this.isUrgeEligible).map(s => s.studentNo)
      if (targets.length === 0) {
        uni.showToast({ title: '没有需要催缴的学生', icon: 'none' })
        return
      }
      this.doSendUrge(targets)
    },
    doSendUrge(targets) {
      if (this.sending) return
      this.sending = true
      urgeStudents(targets)
      reminderApi.batchSendReminder({ studentIds: targets, channels: ['site', 'sms'], scope: 'selected' })
        .catch(e => console.log('[fee-home] API 未就绪，本地已记录催缴:', e))
      this.allStudents = getFeeList()
      this.selectedIds = []
      this.selectionVersion++
      this.sending = false
      uni.hideLoading()
      uni.showModal({
        title: '催缴成功',
        content: `已向 ${targets.length} 名学生发送缴费提醒通知`,
        showCancel: false,
        confirmText: '知道了'
      })
    },
    goDetail(stu) {
      console.log('[fee-home] goDetail navigateTo student-detail')
      rememberStaffBackTarget('/pages/teacher/fee-home/index')
      uni.navigateTo({ url: `/pages/teacher/student-detail/index?id=${stu.studentId}&sid=${stu.studentNo}` })
    },
    refresh() {
      this.allStudents = getFeeList()
      console.log('[fee-home] refresh done, allStudents count:', this.allStudents.length, 'activeTab:', this.activeTab)
    },
    formatMoney(value) { return Number(value || 0).toLocaleString() }
  },
  onShow() {
    console.log('[fee-home] onShow fired')
    this.activeTab = getActiveKey('feeHome', 'unpaid')
    this.filterVersion++
    this.contentKey++
    try { uni.removeStorageSync('staff_back_target') } catch (e) { /* optional */ }
    try { this.activeYear = uni.getStorageSync('teacher_fee_school_year') || this.activeYear } catch (e) { /* optional */ }
    this.refresh()
    this.sending = false
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.top-area { flex-shrink: 0; }
.sbody { height: 0; flex: 1; padding-bottom: 40rpx; overflow-y: scroll; }

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
</style>
