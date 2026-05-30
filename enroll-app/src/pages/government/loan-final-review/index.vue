<template>
  <view class="page">
    <SNavBar :title="reviewTitle" :showBack="true" />
    <scroll-view v-if="item" scroll-y class="body">
      <view class="student-card">
        <view class="avatar">{{ item.avatar || item.name.charAt(0) }}</view>
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="meta">{{ item.sid }} · 计算机学院 2026级1班</text>
        </view>
      </view>

      <SReviewProgress :steps="statusSteps" />

      <SCard title="贷款申请信息" :padding="16">
        <SInfoRow label="贷款金额">
          <text class="amount-red">¥{{ item.amount }}</text>
        </SInfoRow>
        <SInfoRow label="贷款类型">{{ item.type || '生源地助学贷款' }}</SInfoRow>
        <SInfoRow label="贷款银行">国家开发银行</SInfoRow>
        <SInfoRow label="申请时间">2026-05-20 09:15</SInfoRow>
        <SInfoRow label="申请原因">
          <text class="reason-text">{{ item.reason || '家庭经济困难，申请助学贷款以完成入学缴费。' }}</text>
        </SInfoRow>
      </SCard>

      <SCard title="佐证材料" :padding="16">
        <view class="preview-entry" @click="showPreview = true">
          <view class="preview-icon">📄</view>
          <view class="preview-main">
            <text class="preview-title">预览材料</text>
            <text class="preview-sub">查看学生提交的贷款佐证材料</text>
          </view>
          <text class="preview-arrow">›</text>
        </view>
      </SCard>

      <SCard :title="reviewTitle + '意见'" :padding="16">
        <view class="form-group">
          <textarea class="opinion-textarea" v-model="opinion" :placeholder="'请输入' + reviewTitle + '意见…'" />
        </view>
      </SCard>

      <view class="action-row" v-if="canReview">
        <view class="btn-e-outline" @click="showReject = true"><text>不予通过</text></view>
        <view class="btn-p" @click="onApprove"><text>{{ approveLabel }}</text></view>
      </view>
    </scroll-view>
    <SEmpty v-else text="未找到该贷款申请" />

    <view v-if="showPreview" class="ovl on" @click="showPreview = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">材料预览</text>
        <view class="sbody2">
          <text class="smsg">学生端提交的贷款材料将在此统一预览。</text>
          <view class="preview-file">
            <text class="preview-file-name">贷款材料包</text>
            <SBadge color="in">可预览</SBadge>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showReject" class="ovl on" @click="showReject = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">退回原因</text>
        <view class="sbody2">
          <text class="smsg">请输入退回原因，方便学生修改后重新提交</text>
          <textarea class="sheet-textarea" v-model="rejectReason" placeholder="请输入退回原因…" />
          <view class="brow">
            <view class="btn-e" @click="showReject = false"><text>取消</text></view>
            <view class="btn-p" @click="onReject"><text>确认退回</text></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import SReviewProgress from '@/components/shared/SReviewProgress.vue'
import { getReviewItem, updateReview, REVIEW_STATUS } from '@/utils/businessState.js'
import { scholarshipApi } from '@/common/api/scholarship.js'

function buildLoanSteps(status) {
  const steps = [
    { label: '学生提交申请', sub: '2026-05-20', done: true, current: false, popping: false },
    { label: '辅导员初审', sub: '待进行', done: false, current: false, popping: false },
    { label: '学院负责人复审', sub: '待进行', done: false, current: false, popping: false },
    { label: '学工处审批', sub: '待进行', done: false, current: false, popping: false },
    { label: '财务打款', sub: '待进行', done: false, current: false, popping: false }
  ]
  if (status === REVIEW_STATUS.FIRST_PASS) {
    steps[1] = { label: '辅导员初审', sub: '已通过', done: true, current: false, popping: false }
    steps[2] = { label: '学院负责人复审', sub: '当前步骤', done: false, current: true, popping: false }
  } else if (status === REVIEW_STATUS.REVIEW_PASS) {
    steps[1] = { label: '辅导员初审', sub: '已通过', done: true, current: false, popping: false }
    steps[2] = { label: '学院负责人复审', sub: '已通过', done: true, current: false, popping: false }
    steps[3] = { label: '学工处审批', sub: '当前步骤', done: false, current: true, popping: false }
  } else if ([REVIEW_STATUS.FINAL_PASS, REVIEW_STATUS.PAYMENT_PENDING].includes(status)) {
    steps[1] = { label: '辅导员初审', sub: '已通过', done: true, current: false, popping: false }
    steps[2] = { label: '学院负责人复审', sub: '已通过', done: true, current: false, popping: false }
    steps[3] = { label: '学工处审批', sub: '已通过', done: true, current: false, popping: false }
    steps[4] = { label: '财务打款', sub: '待打款', done: false, current: true, popping: false }
  } else if ([REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED].includes(status)) {
    steps[1] = { label: '辅导员初审', sub: '已通过', done: true, current: false, popping: false }
    steps[2] = { label: '学院负责人复审', sub: '已通过', done: true, current: false, popping: false }
    steps[3] = { label: '学工处审批', sub: '已通过', done: true, current: false, popping: false }
    steps[4] = { label: '财务打款', sub: '已完成', done: true, current: false, popping: false }
  } else if (status === REVIEW_STATUS.REJECTED) {
    steps[1] = { label: '辅导员初审', sub: '已退回', done: false, current: false, popping: false }
  }
  return steps
}

export default {
  name: 'GovernmentLoanFinalReview',
  components: { SNavBar, SCard, SInfoRow, SBadge, SEmpty, SReviewProgress },
  data() {
    return { REVIEW_STATUS, uid: '', expectedStatus: '', item: null, opinion: '学工处审批通过，提交财务打款。', rejectReason: '', showPreview: false, showReject: false, submitting: false }
  },
  computed: {
    canReview() {
      if (!this.item) return false
      return this.expectedStatus === REVIEW_STATUS.REVIEW_PASS && this.item.status === this.expectedStatus
    },
    approveLabel() { return '审批通过' },
    reviewTitle() { return '学工处审批' },
    lockedMessage() {
      if (!this.item) return ''
      if (this.canReview) return ''
      if (this.item.status === REVIEW_STATUS.REJECTED) return '申请已驳回，仅供查看。'
      if ([REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED].includes(this.item.status)) return '流程已完结，仅供查看。'
      return '当前阶段为财务打款或前置流程未完成，请等待其他角色处理。'
    },
    statusSteps() {
      return buildLoanSteps(this.item?.status)
    }
  },
  onLoad(options) {
    this.uid = options.uid || ''
    this.expectedStatus = options.status || ''
  },
  async onShow() {
    const localItem = this.uid ? getReviewItem('loans', this.uid) : null
    if (localItem) {
      this.item = localItem
      return
    }
    const res = this.uid ? await scholarshipApi.getLoanDetail(this.uid) : null
    this.item = res?.data?.code === 0 ? res.data.data : null
  },
  methods: {
    async onApprove() {
      if (this.submitting) return
      this.submitting = true
      this.showPreview = false
      this.showReject = false
      await scholarshipApi.approveLoan(this.uid, { opinion: this.opinion, targetStatus: REVIEW_STATUS.FINAL_PASS })
      updateReview('loans', this.uid, REVIEW_STATUS.FINAL_PASS, { node: '学工处审批', result: '审批通过', remark: this.opinion })
      this.item = getReviewItem('loans', this.uid) || { ...this.item, status: REVIEW_STATUS.FINAL_PASS }
      uni.showToast({ title: '审批通过', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 500)
    },
    async onReject() {
      if (this.submitting) return
      this.submitting = true
      this.showReject = false
      this.showPreview = false
      const reason = this.rejectReason || '审批驳回'
      await scholarshipApi.rejectLoan(this.uid, { rejectReason: reason })
      updateReview('loans', this.uid, REVIEW_STATUS.REJECTED, { node: '学工处审批', result: '已驳回', remark: reason })
      this.item = getReviewItem('loans', this.uid) || { ...this.item, status: REVIEW_STATUS.REJECTED }
      uni.showToast({ title: '已驳回', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 48rpx; }
.student-card { display: flex; align-items: center; margin: 28rpx; padding: 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--wa-bg); color: var(--wa); font-size: var(--fs-16); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.info { flex: 1; margin-left: 24rpx; min-width: 0; }
.name { font-size: var(--fs-16); font-weight: 600; color: var(--N900); display: block; }
.meta { font-size: var(--fs-12); color: var(--N500); display: block; margin-top: 8rpx; }
.amount-red { color: var(--er); font-weight: 700; font-size: var(--fs-15); }
.reason-text { color: var(--N500); font-size: var(--fs-12); line-height: 1.6; }
.preview-entry { display: flex; align-items: center; min-height: 96rpx; }
.preview-entry > * + * { margin-left: 20rpx; }
.preview-icon { width: 72rpx; height: 72rpx; border-radius: var(--r-12); background: var(--brand-t); color: var(--brand); display: flex; align-items: center; justify-content: center; font-size: var(--fs-20); }
.preview-main { flex: 1; min-width: 0; }
.preview-title { display: block; font-size: var(--fs-14); color: var(--N900); font-weight: 600; }
.preview-sub { display: block; margin-top: 4rpx; font-size: var(--fs-11); color: var(--N500); }
.preview-arrow { color: var(--N400); font-size: 32rpx; }
.preview-file { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; border-radius: var(--r-12); background: var(--N50); }
.preview-file-name { font-size: var(--fs-13); color: var(--N900); font-weight: 600; }
.form-group { display: flex; flex-direction: column; }
.form-label { font-size: var(--fs-13); font-weight: 600; color: var(--N700); margin-bottom: 12rpx; }
.opinion-textarea, .sheet-textarea { width: 100%; min-height: 144rpx; padding: 20rpx 24rpx; border: 1.5px solid var(--N200); border-radius: 24rpx; font-size: var(--fs-13); color: var(--N900); background: var(--white); box-sizing: border-box; }
.action-row { display: flex; margin: 28rpx; }
.action-row > * { flex: 1; }
.action-row > * + * { margin-left: 20rpx; }
.btn-p { height: 96rpx; background: var(--brand); color: #fff; border-radius: 24rpx; font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; transition: background .3s, transform .2s; }
.btn-p:active { background: var(--brand-d); transform: scale(0.97); }
.btn-e-outline { height: 96rpx; border-radius: 24rpx; border: 2px solid var(--er); color: var(--er); font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; background: var(--white); transition: background .2s; }
.btn-e-outline:active { background: var(--er-bg); }
.btn-e { flex: 1; height: 96rpx; border-radius: 24rpx; background: var(--er-bg); color: var(--er); font-size: var(--fs-15); font-weight: 600; border: 1px solid var(--er-bd); display: flex; align-items: center; justify-content: center; }
.btn-e:active { background: var(--er); color: #fff; }
.ovl { position: fixed; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0); z-index: 300; visibility: hidden; transition: background .25s, visibility .25s; }
.ovl.on { background: rgba(0,0,0,.45); visibility: visible; }
.sheet { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 40rpx 40rpx 0 0; padding: 0 0 72rpx; transform: translateY(100%); transition: transform .28s cubic-bezier(.32,.72,0,1); }
.ovl.on .sheet { transform: translateY(0); }
.shandle { width: 72rpx; height: 8rpx; background: var(--N200); border-radius: 4rpx; margin: 20rpx auto 0; }
.stitle { font-size: var(--fs-16); font-weight: 600; color: var(--N900); padding: 28rpx 32rpx 24rpx; border-bottom: 1px solid var(--N50); display: block; text-align: center; }
.sbody2 { padding: 32rpx; display: flex; flex-direction: column; }
.sbody2 > * + * { margin-top: 24rpx; }
.smsg { font-size: var(--fs-13); color: var(--N500); text-align: center; line-height: 1.6; display: block; }
.brow { display: flex; }
.brow > * + * { margin-left: 16rpx; }
</style>
