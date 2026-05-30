<template>
  <view class="page">
    <SNavBar title="学生详情" :showBack="true" />
    <scroll-view scroll-y class="body">
      <!-- Profile Card -->
      <view class="profile-card">
        <view class="profile-avatar">{{ student.name.charAt(0) }}</view>
        <text class="profile-name">{{ student.name }}</text>
        <text class="profile-meta">{{ student.sid }} · {{ student.college }} {{ student.className }}</text>
        <view class="profile-badge" v-if="student.overdue">
          <SBadge color="er">逾期 {{ student.overdue }} 天</SBadge>
        </view>
      </view>

      <!-- Personal Info -->
      <SCard title="个人信息" :padding="16">
        <SInfoRow label="学号">{{ student.sid }}</SInfoRow>
        <view class="inline-action" @click="copySid">
          <text>复制学号</text>
        </view>
        <SInfoRow label="性别">{{ student.gender }}</SInfoRow>
        <SInfoRow label="学院">{{ student.college }}</SInfoRow>
        <SInfoRow label="专业">{{ student.major }}</SInfoRow>
        <SInfoRow label="班级">{{ student.className }}</SInfoRow>
        <SInfoRow label="联系电话">{{ student.phone }}</SInfoRow>
        <SInfoRow label="家长联系电话">{{ student.parentPhone }}</SInfoRow>
        <SInfoRow label="身份证号">{{ maskedIdNo }}</SInfoRow>
        <SInfoRow label="家庭住址">
          <text class="addr-text">{{ student.address }}</text>
        </SInfoRow>
      </SCard>

      <!-- Campus Status -->
      <SCard title="在校状态" :padding="16">
        <SInfoRow label="宿舍">{{ student.dorm }}</SInfoRow>
        <SInfoRow label="报到状态">
          <SBadge :color="student.checkinStatus === '已报到' ? 'ok' : 'wa'">{{ student.checkinStatus }}</SBadge>
        </SInfoRow>
      </SCard>

      <!-- Fee Detail -->
      <SCard title="缴费情况" :padding="16">
        <SInfoRow label="应缴金额">¥{{ formatMoney(feeTotal.expected) }}</SInfoRow>
        <SInfoRow label="已缴金额">¥{{ formatMoney(feeTotal.paid) }}</SInfoRow>
        <SInfoRow label="缴费状态"><SBadge :color="feeTotal.statusColor">{{ feeTotal.statusLabel }}</SBadge></SInfoRow>
        <view class="fee-divider" />
        <!-- Fee Items List -->
        <view class="fee-item-header">
          <text class="fee-item-header-name">项目名称</text>
          <text class="fee-item-header-paid">金额</text>
          <text class="fee-item-header-req">必缴</text>
          <text class="fee-item-header-status">状态</text>
        </view>
        <view class="fee-item-row" v-for="item in feeItems" :key="item.name">
          <text class="fee-item-name">{{ item.name }}</text>
          <text class="fee-item-paid">¥{{ formatMoney(item.amount) }}</text>
          <text class="fee-item-req">{{ item.required ? '是' : '否' }}</text>
          <SBadge :color="item.statusColor">{{ item.statusLabel }}</SBadge>
        </view>
        <view class="fee-divider" />
        <view class="fee-total-row">
          <text class="fee-total-label">未缴合计</text>
          <text class="fee-total-value">¥{{ formatMoney(feeTotal.due) }}</text>
        </view>
      </SCard>

      <SCard title="缴费记录" :padding="16">
        <view class="record" v-if="fee && fee.paidAmount > 0">
          <text class="record-title">缴费入账 · ¥{{ formatMoney(fee.paidAmount) }}</text>
          <text class="record-meta">{{ fee.paymentMethod || '线上支付' }} · {{ fee.paidAt || '2026-05-18 10:10' }}</text>
        </view>
        <text v-else class="empty-text">暂无缴费记录</text>
      </SCard>

      <SCard title="票据信息" :padding="16">
        <text v-if="fee && fee.payStatus === 'paid'" class="record-title">电子票据已生成，可在学生端查看</text>
        <text v-else class="empty-text">缴费完成后生成票据</text>
      </SCard>

    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SBadge from '@/components/shared/SBadge.vue'
import { getStudent, getFeeList, getStudentFeeItems, computePaymentStatus } from '@/utils/businessState.js'
import { studentApi } from '@/common/api/student.js'
import { paymentApi } from '@/common/api/payment.js'


const STORAGE_KEYS = ['teacher_doc_list', 'teacher_aid_list', 'teacher_loan_list', 'teacher_nondorm_list']

const DEFAULT_STUDENT = {
  name: '王明辉', sid: '2026010001', college: '计算机学院', className: '2026级1班',
  gender: '男', phone: '13875615678', parentPhone: '13984564321',
  address: '湖南省长沙市岳麓区麓山南路932号中南大学校本部15栋302室',
  bankName: '中国工商银行', bankCard: '6222 0219 0301 2453 091',
  dorm: '3号楼 305室(6人间)', checkinStatus: '未报到', overdue: 12,
  feeTuition: '5,800.00', feeDorm: '1,200.00', feeBook: '320.00',
  tuitionUnpaid: true, totalDue: '5,800.00'
}

function searchStorage(uid, sid) {
  for (const key of STORAGE_KEYS) {
    try {
      const raw = uni.getStorageSync(key)
      if (raw) {
        const list = JSON.parse(raw)
        const found = list.find(i => i.uid === uid || i.id === sid || i.sid === sid)
        if (found) return found
      }
    } catch (e) { /* ignore */ }
  }
  return null
}

export default {
  name: 'TeacherStudentDetail',
  components: { SNavBar, SCard, SInfoRow, SBadge },
  data() {
    return {
      student: { ...DEFAULT_STUDENT },
      fee: null,
      feeItems: []
    }
  },
  computed: {
    maskedIdNo() {
      const id = this.student.idNo || ''
      return id.length > 10 ? `${id.slice(0, 6)}********${id.slice(-4)}` : id
    },
    feeTotal() {
      const items = this.feeItems
      if (!items.length) return { expected: 0, paid: 0, due: 0, statusLabel: '未缴', statusColor: 'wa' }
      // 与列表页 getFeeList 保持一致：金额用 fee 记录，状态用 computePaymentStatus
      const expected = this.fee?.expectedAmount || items.reduce((s, i) => s + i.amount, 0)
      const paid = this.fee?.paidAmount || 0
      const due = expected - paid
      const result = computePaymentStatus(items)
      // fee 记录的特殊状态优先（逾期、绿通），其余用 computePaymentStatus 结果
      if (this.fee?.payStatus === 'channel') {
        return { expected, paid, due, statusLabel: '绿通', statusColor: 'pu' }
      }
      if (this.fee?.payStatus === 'overdue' && result.payStatus === 'unpaid') {
        return { expected, paid, due, statusLabel: '逾期', statusColor: 'er' }
      }
      return { expected, paid, due, statusLabel: result.statusLabel, statusColor: result.statusColor }
    }
  },
  async onLoad(options) {
    const uid = options.uid
    const sid = options.sid
    const rawId = options.id
    const cleanId = (rawId && rawId !== 'undefined') ? rawId : null
    const apiId = cleanId || sid
    if (uid || sid) {
      const found = searchStorage(uid, sid)
      const bizStudent = getStudent(sid || found?.sid || found?.id)
      this.fee = getFeeList().find(i => i.sid === (sid || found?.sid || found?.id))
      this.feeItems = getStudentFeeItems(sid || found?.sid || found?.id)
      if (found || bizStudent) {
        const source = bizStudent || {}
        this.student = {
          name: found?.name || source.name || DEFAULT_STUDENT.name,
          sid: found?.sid || found?.id || source.sid || DEFAULT_STUDENT.sid,
          college: found?.college || source.college || DEFAULT_STUDENT.college,
          major: source.major || DEFAULT_STUDENT.major || '软件工程',
          className: found?.className || source.className || DEFAULT_STUDENT.className,
          gender: source.gender || DEFAULT_STUDENT.gender,
          phone: source.phone || DEFAULT_STUDENT.phone,
          parentPhone: source.parentPhone || DEFAULT_STUDENT.parentPhone,
          idNo: source.idNo || DEFAULT_STUDENT.idNo,
          address: source.address || DEFAULT_STUDENT.address,
          bankName: DEFAULT_STUDENT.bankName,
          bankCard: DEFAULT_STUDENT.bankCard,
          dorm: source.dorm || DEFAULT_STUDENT.dorm,
          checkinStatus: source.checkedIn ? '已报到' : '未报到',
          overdue: this.fee?.payStatus === 'overdue' ? 12 : 0,
          feeTuition: this.fee?.amount || found?.amount || found?.feeTuition || DEFAULT_STUDENT.feeTuition,
          feeDorm: DEFAULT_STUDENT.feeDorm,
          feeBook: DEFAULT_STUDENT.feeBook,
          tuitionUnpaid: this.fee ? this.fee.payStatus !== 'paid' : (found?.status === 'pending' || found?.status === '待审核' || found?.status === '待初审'),
          totalDue: this.fee?.payStatus === 'paid' ? '0.00' : (this.fee?.amount || found?.amount || DEFAULT_STUDENT.totalDue)
        }
      }
      const studentId = sid || found?.sid || found?.id
      const [detailRes, paymentRes] = await Promise.all([
        studentApi.getStudentDetail(apiId || studentId),
        paymentApi.getStudentPaymentDetail(apiId || studentId)
      ])
      if (detailRes?.data?.code === 0) {
        const detail = detailRes.data.data
        this.student = {
          ...this.student,
          name: detail.name || detail.studentName || this.student.name,
          sid: detail.studentNo || detail.studentId || this.student.sid,
          college: detail.college || this.student.college,
          className: detail.className || this.student.className,
          gender: detail.gender || this.student.gender,
          phone: detail.phone || this.student.phone,
          idNo: detail.idCard || detail.idNo || this.student.idNo,
          checkinStatus: detail.checkinStatus === 'checked_in' ? '已报到' : '未报到'
        }
      }
      if (paymentRes?.data?.code === 0) {
        const payment = paymentRes.data.data
        const status = payment.paymentStatus || payment.status
        this.fee = { payStatus: status, amount: String(payment.unpaidAmount || payment.receivableAmount || 0) }
        this.student.tuitionUnpaid = status !== 'paid'
        this.student.totalDue = Number(payment.unpaidAmount || 0).toLocaleString()
      }
    }
  },
  methods: {
    copySid() {
      uni.setClipboardData({ data: this.student.sid, success: () => uni.showToast({ title: '学号已复制', icon: 'success' }) })
    },
    formatMoney(value) {
      return Number(String(value || 0).replace(/,/g, '')).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); padding-bottom: 64rpx; display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }

/* ── Profile Card ── */
.profile-card { display: flex; flex-direction: column; align-items: center; margin: 28rpx; padding: 40rpx 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); }
.profile-avatar { width: 112rpx; height: 112rpx; border-radius: 50%; background: var(--brand-t); color: var(--brand); font-size: var(--fs-22); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.profile-name { font-size: var(--fs-18); font-weight: 600; color: var(--N900); margin-top: 24rpx; }
.profile-meta { font-size: var(--fs-13); color: var(--N500); margin-top: 8rpx; }
.profile-badge { margin-top: 20rpx; }

/* ── Tags ── */
.tag-er { color: var(--er); font-size: var(--fs-12); margin-left: 16rpx; }
.tag-ok { color: var(--ok); font-size: var(--fs-12); margin-left: 16rpx; }
.addr-text { color: var(--N500); font-size: var(--fs-12); line-height: 1.5; }
.link-text { color: var(--brand); font-weight: 600; }
.inline-action { margin: -12rpx 0 12rpx; height: 56rpx; display: flex; align-items: center; justify-content: flex-end; color: var(--brand); font-size: var(--fs-12); }

/* ── Fee Summary ── */
.fee-divider { height: 1px; background: var(--N200); margin: 8rpx 0; }
.fee-total-row { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; }
.fee-total-label { font-size: var(--fs-14); font-weight: 500; color: var(--N900); }
.fee-total-value { font-size: var(--fs-18); font-weight: 700; color: var(--er); }
.record + .record { margin-top: 20rpx; }
.record-title { display: block; font-size: var(--fs-13); color: var(--N900); font-weight: 600; }
.record-meta { display: block; margin-top: 6rpx; font-size: var(--fs-11); color: var(--N500); }
.empty-text { display: block; font-size: var(--fs-12); color: var(--N400); padding: 8rpx 0; }

/* ── Fee Items ── */
.fee-item-header {
  display: flex; align-items: center;
  padding: 16rpx 0 8rpx;
}
.fee-item-header-name { flex: 1; font-size: var(--fs-11); color: var(--N400); font-weight: 500; min-width: 0; }
.fee-item-header-paid { width: 120rpx; text-align: right; font-size: var(--fs-11); color: var(--N400); font-weight: 500; flex-shrink: 0; }
.fee-item-header-req { width: 56rpx; text-align: center; font-size: var(--fs-11); color: var(--N400); font-weight: 500; flex-shrink: 0; }
.fee-item-header-status { width: 80rpx; text-align: right; font-size: var(--fs-11); color: var(--N400); font-weight: 500; flex-shrink: 0; }

.fee-item-row {
  display: flex; align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
}
.fee-item-row:last-child { border-bottom: none; }
.fee-item-name { flex: 1; font-size: var(--fs-14); color: var(--N900); font-weight: 500; min-width: 0; }
.fee-item-paid { width: 120rpx; text-align: right; font-size: var(--fs-13); color: var(--N700); font-weight: 500; flex-shrink: 0; }
.fee-item-req { width: 56rpx; text-align: center; font-size: var(--fs-13); color: var(--N700); flex-shrink: 0; }

</style>
