<template>
  <view class="page">
    <SNavBar title="学生缴费核验" :showBack="true" />

    <scroll-view scroll-y class="body">
      <!-- 搜索区 -->
      <view class="search-card">
        <view class="search-row">
          <input
            class="search-input"
            v-model="keyword"
            placeholder="输入学号搜索"
            confirm-type="search"
            @confirm="onSearch"
          />
          <view class="search-clear" v-if="keyword" @click="keyword = ''">
            <text>✕</text>
          </view>
        </view>
        <view class="search-actions">
          <view class="btn-scan" @click="onScan">
            <text class="scan-icon">📷</text>
            <text>扫码核验</text>
          </view>
          <view class="btn-search" @click="onSearch">
            <text>查询</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <SEmpty v-if="searched && !student" text="未找到该学生，请检查学号是否正确" />

      <!-- 学生缴费状态卡片 -->
      <view class="info-card" v-if="student">
        <!-- 学生基本信息 -->
        <view class="student-row">
          <view class="student-avatar">{{ student.studentName ? student.studentName.charAt(0) : '?' }}</view>
          <view class="student-base">
            <text class="st-name">{{ student.studentName }}</text>
            <text class="st-no">{{ student.studentNo }}</text>
          </view>
          <view class="clearance-tag" :class="'clearance-' + student.clearance.color">
            <text>{{ student.clearance.label }}</text>
          </view>
        </view>

        <view class="student-meta">
          <text>{{ student.college }} · {{ student.major }} · {{ student.className }}</text>
        </view>

        <view class="divider" />

        <!-- 缴费明细 -->
        <view class="section-label">缴费明细</view>
        <view class="ds-row">
          <text class="ds-label">应缴金额</text>
          <text class="ds-value">¥{{ fmt(student.receivableAmount) }}</text>
        </view>
        <view class="ds-row">
          <text class="ds-label">已缴金额</text>
          <text class="ds-value ok">¥{{ fmt(student.paidAmount) }}</text>
        </view>
        <view class="ds-row">
          <text class="ds-label">欠费金额</text>
          <text class="ds-value" :class="student.unpaidAmount > 0 ? 'er' : ''">¥{{ fmt(student.unpaidAmount) }}</text>
        </view>
        <view class="ds-row">
          <text class="ds-label">缴费状态</text>
          <SStatusTag :type="student.paymentStatusColor">{{ student.paymentStatusLabel }}</SStatusTag>
        </view>
        <view class="ds-row" v-if="student.lastPaymentTime">
          <text class="ds-label">最近缴费</text>
          <text class="ds-value dim">{{ student.lastPaymentTime }}</text>
        </view>
        <view class="ds-row" v-if="student.note">
          <text class="ds-label">备注</text>
          <text class="ds-value dim">{{ student.note }}</text>
        </view>

        <!-- 绿色通道标签 -->
        <view class="channel-tag" v-if="student.isGreenChannel">
          <text>🟢 绿色通道 — 已批准缓缴，允许放行</text>
        </view>

        <view class="divider" />

        <!-- 放行判断 -->
        <view class="clearance-box" :class="'cb-' + student.clearance.color">
          <text class="cb-title">放行判断</text>
          <text class="cb-reason">{{ student.clearance.reason }}</text>
        </view>

        <!-- 操作按钮 -->
        <view class="actions" v-if="!student.checkedIn">
          <view class="btn-primary" v-if="student.clearance.allowed" @click="onConfirmCheckin">
            <text>确认放行并报到</text>
          </view>
          <view class="btn-outline wa-btn" v-if="!student.clearance.allowed && student.clearance.color === 'wa'" @click="onGoOnsite">
            <text>引导现场缴费</text>
          </view>
          <view class="btn-disabled" v-if="!student.clearance.allowed && student.clearance.color === 'er'">
            <text>需完成缴费后方可放行</text>
          </view>
        </view>
        <view class="checked-in-badge" v-if="student.checkedIn">
          <text>✅ 该生已报到</text>
        </view>
      </view>

      <!-- 最近核验记录 -->
      <view class="log-section" v-if="verifyLogs.length > 0">
        <view class="log-header">
          <text class="log-title">最近核验记录</text>
          <text class="log-count">共 {{ verifyLogs.length }} 条</text>
        </view>
        <view class="log-item" v-for="log in verifyLogs" :key="log.logId">
          <view class="log-left">
            <text class="log-name">{{ log.studentName }}</text>
            <text class="log-no">{{ log.studentNo }}</text>
          </view>
          <view class="log-mid">
            <text class="log-method">{{ log.verifyMethod === 'scan' ? '📷 扫码' : '⌨ 手动' }}</text>
            <text class="log-time">{{ log.verifyTime }}</text>
          </view>
          <SStatusTag :type="log.verifyResultColor" customStyle="font-size: var(--fs-10); padding: 4rpx 12rpx">{{ log.verifyResult }}</SStatusTag>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import SStatusTag from '@/components/shared/SStatusTag.vue'
import { getStudents, getFeeList, getClassSummary } from '@/utils/businessState.js'

const STORAGE_KEY = 'enroll_checkin_verify_logs'

export default {
  name: 'FinanceVerify',
  components: { SNavBar, SEmpty, SStatusTag },
  data() {
    return {
      keyword: '',
      searched: false,
      student: null,
      verifyLogs: []
    }
  },
  onShow() {
    this.loadLogs()
  },
  methods: {
    loadLogs() {
      try {
        const raw = uni.getStorageSync(STORAGE_KEY)
        this.verifyLogs = raw ? JSON.parse(raw) : []
      } catch (e) {
        this.verifyLogs = []
      }
    },

    saveLog(log) {
      this.verifyLogs.unshift(log)
      if (this.verifyLogs.length > 50) this.verifyLogs = this.verifyLogs.slice(0, 50)
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.verifyLogs))
    },

    onScan() {
      uni.scanCode({
        onlyFromCamera: false,
        scanType: ['qrCode', 'barCode', 'datamatrix', 'pdf417'],
        success: (res) => {
          const code = res.result || ''
          this.keyword = code
          this.onSearch('scan')
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes('cancel')) return
          uni.showToast({ title: '扫码失败，请手动输入学号', icon: 'none' })
        }
      })
    },

    onSearch(method = 'manual') {
      const kw = this.keyword.trim()
      this.searched = true
      if (!kw) {
        uni.showToast({ title: '请输入学号', icon: 'none' })
        return
      }

      const fees = getFeeList()
      const students = getStudents()
      const found = fees.find(f =>
        f.studentNo === kw || f.sid === kw
      )

      if (!found) {
        this.student = null
        this.saveLog({
          logId: Date.now().toString(),
          studentName: '—',
          studentNo: kw,
          verifyResult: '未找到',
          verifyResultColor: 'er',
          verifyTime: this.nowText(),
          verifyMethod: method
        })
        return
      }

      const clearance = this.getClearance(found)
      this.student = {
        ...found,
        college: found.college || '计算机学院',
        major: found.major || '软件工程',
        className: found.className || '2026级1班',
        studentName: found.name || found.studentName,
        receivableAmount: found.expectedAmount || 0,
        paidAmount: found.paidAmount || 0,
        unpaidAmount: found.dueAmount || 0,
        paymentStatusLabel: found.statusLabel || '未缴',
        paymentStatusColor: found.statusColor || 'wa',
        lastPaymentTime: found.lastPaymentTime || '',
        clearance,
        isGreenChannel: found.payStatus === 'channel',
        note: found.payStatus === 'channel' ? '绿色通道学生，已批准缓缴' : '',
        checkedIn: found.checkedIn || false,
        checkinTime: found.checkinTime || ''
      }

      this.saveLog({
        logId: Date.now().toString(),
        studentName: found.name || found.studentName,
        studentNo: found.studentNo || kw,
        verifyResult: clearance.label,
        verifyResultColor: clearance.color,
        verifyTime: this.nowText(),
        verifyMethod: method
      })
    },

    getClearance(fee) {
      if (fee.payStatus === 'paid') return { allowed: true, label: '允许放行', color: 'ok', reason: '费用已缴清，可直接报到' }
      if (fee.payStatus === 'channel') return { allowed: true, label: '允许放行(绿通)', color: 'ok', reason: '绿色通道学生，已批准缓缴' }
      if (fee.payStatus === 'partial') return { allowed: false, label: '需人工确认', color: 'wa', reason: '部分未缴费，建议引导至缴费处完成缴费' }
      return { allowed: false, label: '不允许放行', color: 'er', reason: '未缴费，需完成缴费或走绿色通道后方可放行' }
    },

    onConfirmCheckin() {
      if (!this.student) return
      uni.showModal({
        title: '确认放行',
        content: `确认 ${this.student.studentName}（${this.student.studentNo}）已缴费并允许报到？`,
        confirmText: '确认放行',
        success: (res) => {
          if (res.confirm) {
            this.student.checkedIn = true
            this.student.checkinTime = this.nowText()
            // Update in business state
            const students = getStudents()
            const target = students.find(s => s.sid === this.student.studentNo)
            if (target) {
              target.checkedIn = true
              target.checkinTime = this.nowText()
              uni.setStorageSync('enroll_mobile_business_v2_students', JSON.stringify(students))
            }
            uni.showToast({ title: '放行成功', icon: 'success' })
          }
        }
      })
    },

    onGoOnsite() {
      if (!this.student) return
      uni.navigateTo({
        url: `/pages/finance/onsite/index?studentNo=${this.student.studentNo}&name=${encodeURIComponent(this.student.studentName)}`
      })
    },

    nowText() {
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },

    fmt(v) {
      return Number(v || 0).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
}

.body {
  padding: 24rpx;
}

/* 搜索卡片 */
.search-card {
  background: var(--white);
  border-radius: var(--r-14);
  padding: 24rpx;
  box-shadow: var(--card-shadow);
}

.search-row {
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 84rpx;
  padding: 0 20rpx;
  border: 1.5px solid var(--N200);
  border-radius: var(--r-10);
  font-size: var(--fs-15);
  color: var(--N900);
  background: var(--N25);
}

.search-clear {
  width: 48rpx;
  height: 48rpx;
  border-radius: var(--r-full);
  background: var(--N200);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12rpx;
  flex-shrink: 0;
  font-size: var(--fs-12);
  color: var(--N500);
}
.search-clear:active { background: var(--N400); }

.search-actions {
  display: flex;
  margin-top: 16rpx;
  > * + * { margin-left: 16rpx; }
}

.btn-scan {
  flex: 1;
  height: 80rpx;
  background: var(--N25);
  border: 1.5px solid var(--N200);
  border-radius: var(--r-10);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-14);
  color: var(--N700);
  font-weight: 600;
}
.btn-scan:active { background: var(--N50); }
.scan-icon { margin-right: 8rpx; }

.btn-search {
  flex: 1;
  height: 80rpx;
  background: var(--brand);
  border-radius: var(--r-10);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: var(--fs-15);
  font-weight: 600;
}
.btn-search:active { background: var(--brand-d); }

/* 学生信息卡 */
.info-card {
  margin-top: 20rpx;
  background: var(--white);
  border-radius: var(--r-14);
  padding: 28rpx;
  box-shadow: var(--card-shadow);
}

.student-row {
  display: flex;
  align-items: center;
  > * + * { margin-left: 16rpx; }
}

.student-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--r-full);
  background: var(--brand-t);
  color: var(--brand);
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.student-base {
  flex: 1;
  min-width: 0;
}

.st-name {
  font-size: var(--fs-16);
  font-weight: 700;
  color: var(--N900);
  display: block;
}

.st-no {
  font-size: var(--fs-11);
  color: var(--N500);
  display: block;
  margin-top: 2rpx;
}

.clearance-tag {
  flex-shrink: 0;
  padding: 8rpx 20rpx;
  border-radius: var(--r-full);
  font-size: var(--fs-12);
  font-weight: 700;
}
.clearance-ok {
  background: var(--ok-bg);
  color: var(--ok);
}
.clearance-wa {
  background: var(--wa-bg);
  color: var(--wa);
}
.clearance-er {
  background: var(--er-bg);
  color: var(--er);
}

.student-meta {
  margin-top: 12rpx;
  font-size: var(--fs-11);
  color: var(--N400);
  padding-left: 4rpx;
}

.divider {
  height: 1px;
  background: var(--N50);
  margin: 20rpx 0;
}

.section-label {
  font-size: var(--fs-11);
  color: var(--N400);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 12rpx;
}

.ds-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
}

.ds-label {
  font-size: var(--fs-13);
  color: var(--N500);
}

.ds-value {
  font-size: var(--fs-14);
  font-weight: 600;
  color: var(--N900);
}
.ds-value.ok { color: var(--ok); }
.ds-value.er { color: var(--er); }
.ds-value.dim { font-size: var(--fs-11); color: var(--N400); font-weight: 400; }

.channel-tag {
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  background: var(--ok-bg);
  border: 1px solid var(--ok-bd);
  border-radius: var(--r-10);
  font-size: var(--fs-12);
  color: var(--ok);
  font-weight: 600;
}

/* 放行判断 */
.clearance-box {
  padding: 20rpx;
  border-radius: var(--r-10);
}
.cb-ok { background: var(--ok-bg); }
.cb-wa { background: var(--wa-bg); }
.cb-er { background: var(--er-bg); }

.cb-title {
  font-size: var(--fs-12);
  font-weight: 600;
  display: block;
}
.cb-ok .cb-title { color: var(--ok); }
.cb-wa .cb-title { color: var(--wa); }
.cb-er .cb-title { color: var(--er); }

.cb-reason {
  font-size: var(--fs-13);
  display: block;
  margin-top: 6rpx;
  line-height: 1.5;
}
.cb-ok .cb-reason { color: var(--ok); }
.cb-wa .cb-reason { color: var(--wa); }
.cb-er .cb-reason { color: var(--er); }

/* 操作按钮 */
.actions {
  margin-top: 24rpx;
}

.btn-primary {
  height: 88rpx;
  background: var(--brand);
  border-radius: var(--r-12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: var(--fs-15);
  font-weight: 600;
}
.btn-primary:active { background: var(--brand-d); }

.btn-outline {
  height: 88rpx;
  background: var(--white);
  border: 1.5px solid;
  border-radius: var(--r-12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-15);
  font-weight: 600;
}
.btn-outline.wa-btn {
  border-color: var(--wa);
  color: var(--wa);
}
.btn-outline.wa-btn:active { background: var(--wa-bg); }

.btn-disabled {
  height: 88rpx;
  background: var(--N50);
  border-radius: var(--r-12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-14);
  color: var(--N400);
  font-weight: 600;
}

.checked-in-badge {
  margin-top: 24rpx;
  text-align: center;
  font-size: var(--fs-14);
  color: var(--ok);
  font-weight: 600;
}

/* 核验记录 */
.log-section {
  margin-top: 24rpx;
  background: var(--white);
  border-radius: var(--r-14);
  padding: 24rpx;
  box-shadow: var(--card-shadow);
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.log-title {
  font-size: var(--fs-15);
  font-weight: 700;
  color: var(--N900);
}

.log-count {
  font-size: var(--fs-11);
  color: var(--N400);
}

.log-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid var(--N50);
  > * + * { margin-left: 16rpx; }
}
.log-item:last-child { border-bottom: none; }

.log-left {
  flex: 1;
  min-width: 0;
}

.log-name {
  font-size: var(--fs-13);
  font-weight: 600;
  color: var(--N900);
  display: block;
}

.log-no {
  font-size: var(--fs-10);
  color: var(--N400);
  display: block;
  margin-top: 2rpx;
}

.log-mid {
  flex-shrink: 0;
}

.log-method {
  font-size: var(--fs-10);
  color: var(--N500);
  display: block;
  text-align: right;
}

.log-time {
  font-size: var(--fs-9);
  color: var(--N400);
  display: block;
  text-align: right;
  margin-top: 2rpx;
}
</style>
