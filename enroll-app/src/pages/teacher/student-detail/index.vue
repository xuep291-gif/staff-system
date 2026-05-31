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
import { studentApi } from '@/common/api/student.js'
import { paymentApi } from '@/common/api/payment.js'

export default {
  name: 'TeacherStudentDetail',
  components: { SNavBar, SCard, SInfoRow, SBadge },
  data() {
    return {
      student: { name:'--', sid:'', college:'--', className:'--', gender:'--', phone:'--', idNo:'--', address:'--', dorm:'--', checkinStatus:'--', tuitionUnpaid: false, totalDue:'0' },
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
      const f = this.fee || {}
      const expected = Number(f.expectedAmount || f.receivableAmount || 0)
      const paid = Number(f.paidAmount || 0)
      // 优先使用后端 paymentStatus；缺失时按金额 fallback 计算
      const st = f.payStatus || (
        paid >= expected && expected > 0 ? 'paid' :
        paid > 0 ? 'partial' : 'unpaid'
      )
      const labelMap = { paid:'已缴', unpaid:'未缴', partial:'部分', overdue:'逾期', channel:'绿通', green_channel:'绿通' }
      const colorMap = { paid:'ok', unpaid:'wa', partial:'wa', overdue:'er', channel:'pu', green_channel:'pu' }
      return { expected, paid, due: expected-paid, statusLabel: labelMap[st]||'未缴', statusColor: colorMap[st]||'wa' }
    }
  },
  async onLoad(options) {
    const sid = options.sid || options.uid || options.id
    if (!sid || sid === 'undefined') return
    try {
      const [detailRes, paymentRes] = await Promise.all([
        studentApi.getStudentDetail(sid),
        paymentApi.getStudentPaymentDetail(sid)
      ])
      if (detailRes?.code === 0) {
        const d = detailRes.data
        this.student = {
          name: d.name||'--', sid: d.studentNo||sid,
          college: d.college||'--', className: d.className||'--',
          gender: d.gender||'--', phone: d.phone||'--',
          idNo: d.idNoMasked||'--', address: d.address||'--',
          dorm: d.dormitory ? d.dormitory.building+' '+d.dormitory.room+'室' : '--',
          checkinStatus: d.checkin?.status==='checked_in'?'已报到':'未报到',
          tuitionUnpaid: d.paymentSummary?.status!=='paid',
          totalDue: Number(d.paymentSummary?.unpaid||0).toLocaleString()
        }
      }
      if (paymentRes?.code === 0) {
        const p = paymentRes.data, s = p.summary||{}
        const bills = p.bills || []
        const requiredSet = new Set(['学费', '教材费'])
        this.feeItems = bills.map(b => {
          const name = b.itemName || b.item_name || '--'
          const billStatus = b.status || (b.paidAmount >= b.receivableAmount ? 'paid' : b.paidAmount > 0 ? 'partial' : 'unpaid')
          return {
            name,
            amount: b.receivableAmount || 0,
            paid: b.paidAmount || 0,
            required: requiredSet.has(name) || (b.required === true),
            statusLabel: billStatus === 'paid' ? '已缴' : billStatus === 'partial' ? '部分' : '未缴',
            statusColor: billStatus === 'paid' ? 'ok' : billStatus === 'partial' ? 'wa' : 'wa'
          }
        })
        this.fee = { payStatus: s.paymentStatus, expectedAmount: s.receivableAmount, paidAmount: s.paidAmount }
        this.student.tuitionUnpaid = s.paymentStatus !== 'paid'
        this.student.totalDue = Number(s.unpaidAmount||0).toLocaleString()
      }
    } catch(e){}
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
