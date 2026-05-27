<template>
  <view class="page">
    <SNavBar title="换房审批" :showBack="true" />
    <scroll-view scroll-y class="body" v-if="item">
      <!-- Student Info Card -->
      <view class="student-card">
        <view class="avatar">{{ item.avatar || '孙' }}</view>
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="meta">{{ item.id }} · 计算机学院 2026级1班</text>
        </view>
      </view>

      <!-- Application Info -->
      <SCard title="换房申请信息" :padding="16">
        <SInfoRow label="申请人">{{ item.name }}</SInfoRow>
        <SInfoRow label="学号">{{ item.id }}</SInfoRow>
        <SInfoRow label="联系电话">{{ item.phone || '-' }}</SInfoRow>
        <SInfoRow label="原宿舍">{{ item.oldDorm || '-' }}</SInfoRow>
        <SInfoRow label="目标宿舍">{{ item.targetDorm || '-' }}</SInfoRow>
        <SInfoRow label="申请原因">
          <text class="reason-text">{{ item.reason || '-' }}</text>
        </SInfoRow>
        <SInfoRow label="申请时间">{{ item.applyTime || '-' }}</SInfoRow>
      </SCard>

      <!-- Fee Diff -->
      <SCard title="住宿费差额" :padding="16">
        <SInfoRow label="原宿舍费用">¥600/学期</SInfoRow>
        <SInfoRow label="目标宿舍费用">¥1,200/学期</SInfoRow>
        <SInfoRow label="差额">
          <text class="diff-red">需补缴 ¥600</text>
        </SInfoRow>
      </SCard>

      <!-- Status Steps -->
      <SCard title="审批进度" :padding="16">
        <view class="steps">
          <view v-for="(step, idx) in statusSteps" :key="idx" class="step" :class="stepClass(idx)">
            <view class="step-dot" :class="stepClass(idx)">
              <text v-if="step.done" class="step-check">✓</text>
              <text v-else class="step-num">{{ idx + 1 }}</text>
            </view>
            <view class="step-info">
              <text class="step-label">{{ step.label }}</text>
              <text class="step-sub">{{ step.sub }}</text>
            </view>
            <view v-if="idx < statusSteps.length - 1" class="step-line" :class="{ done: step.done, 'anim-line': idx === animatingLine }" />
          </view>
        </view>
      </SCard>

      <!-- Review Form -->
      <SCard title="审批意见" :padding="16">
        <view class="form-group">
          <text class="form-label">审批意见</text>
          <textarea class="opinion-textarea" v-model="form.opinion" placeholder="请输入审批意见…" />
          <text class="form-hint">请根据实际情况填写审批意见</text>
        </view>
      </SCard>

      <!-- Action Buttons -->
      <view class="action-row">
        <view class="btn-e-outline" @click="showReject = true">
          <text>不予通过</text>
        </view>
        <view class="btn-p" :class="{ 'btn-done': submitDone }" @click="onApprove">
          <text>{{ submitDone ? '已通过 ✓' : '通过审批' }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Reject BottomSheet -->
    <view v-if="showReject" class="ovl on" @click="showReject = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">退回原因</text>
        <view class="sbody2">
          <text class="smsg">请输入不予通过的原因</text>
          <textarea class="sheet-textarea" v-model="rejectReason" placeholder="请输入退回原因…" />
          <view class="brow">
            <view class="btn-e" @click="showReject = false">
              <text>取消</text>
            </view>
            <view class="btn-p" @click="confirmReject">
              <text>确认退回</text>
            </view>
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
import { DORM_REVIEW_STATUS, getDormReviewItem, updateReview } from '@/utils/businessState.js'
import { dormitoryApi } from '@/common/api/dormitory.js'

export default {
  name: 'GovernmentDormReview',
  components: { SNavBar, SCard, SInfoRow },
  data() {
    return {
      item: null,
      uid: '',
      apiId: '',
      showReject: false,
      rejectReason: '',
      submitDone: false,
      animatingLine: -1,
      form: { opinion: '经核实，该生申请理由属实，目标宿舍有空余床位，同意换房申请。' },
      statusSteps: [
        { label: '学生提交', sub: '2026-05-15', done: true, current: false, popping: false },
        { label: '班主任审核', sub: '已通过', done: true, current: false, popping: false },
        { label: '政务处审批', sub: '当前步骤', done: false, current: true, popping: false },
        { label: '宿舍分配', sub: '待进行', done: false, current: false, popping: false }
      ]
    }
  },
  async onLoad(options) {
    this.uid = options.uid || ''
    this.apiId = options.apiId || this.uid
    const res = this.apiId ? await dormitoryApi.getRoomChangeDetail(this.apiId) : null
    this.item = res?.data?.code === 0 ? res.data.data : getDormReviewItem('roomChanges', this.uid)
    if (this.item) {
      if (this.item.status === DORM_REVIEW_STATUS.APPROVED) {
        this.submitDone = true
        this.statusSteps = [
          { label: '学生提交', sub: '2026-05-15', done: true, current: false, popping: false },
          { label: '班主任审核', sub: '已通过', done: true, current: false, popping: false },
          { label: '政务处审批', sub: '已通过', done: true, current: false, popping: false },
          { label: '宿舍分配', sub: '已通过', done: true, current: false, popping: false }
        ]
      } else if (this.item.status === DORM_REVIEW_STATUS.REJECTED) {
        this.submitDone = true
        this.statusSteps = [
          { label: '学生提交', sub: '2026-05-15', done: true, current: false, popping: false },
          { label: '班主任审核', sub: '已通过', done: true, current: false, popping: false },
          { label: '政务处审批', sub: '已驳回', done: false, current: true, popping: false },
          { label: '宿舍分配', sub: '待进行', done: false, current: false, popping: false }
        ]
      }
    }
  },
  methods: {
    stepClass(idx) {
      const s = this.statusSteps[idx]
      return { done: s.done, cur: s.current, 'step-pop': s.popping }
    },
    animateStep(currentIdx) {
      this.statusSteps[currentIdx].done = true
      this.statusSteps[currentIdx].current = false
      this.statusSteps[currentIdx].popping = true
      this.statusSteps[currentIdx].sub = new Date().toLocaleDateString()
      this.animatingLine = currentIdx
      setTimeout(() => {
        this.statusSteps[currentIdx].popping = false
        this.animatingLine = -1
        if (currentIdx + 1 < this.statusSteps.length) {
          this.statusSteps[currentIdx + 1].current = true
          this.statusSteps[currentIdx + 1].popping = true
          setTimeout(() => { this.statusSteps[currentIdx + 1].popping = false }, 400)
        }
      }, 400)
    },
    async onApprove() {
      if (this.submitDone) return
      await dormitoryApi.approveRoomChange(this.apiId, { remark: this.form.opinion, generateDiffOrder: true })
      updateReview('roomChanges', this.uid, DORM_REVIEW_STATUS.APPROVED, { node: '政务处审批', result: '已通过', remark: this.form.opinion })
      this.item = { ...this.item, status: DORM_REVIEW_STATUS.APPROVED, statusLabel: '已通过', badgeColor: 'ok' }
      this.submitDone = true
      this.animateStep(2)
      setTimeout(() => {
        uni.showToast({ title: '换房审批已通过', icon: 'success' })
        setTimeout(() => { uni.navigateBack() }, 800)
      }, 600)
    },
    async confirmReject() {
      this.showReject = false
      const remark = this.rejectReason || '不符合换房条件'
      await dormitoryApi.rejectRoomChange(this.apiId, { remark })
      updateReview('roomChanges', this.uid, DORM_REVIEW_STATUS.REJECTED, { node: '政务处审批', result: '已驳回', remark })
      this.item = { ...this.item, status: DORM_REVIEW_STATUS.REJECTED, statusLabel: '已驳回', badgeColor: 'er' }
      uni.showToast({ title: '已退回', icon: 'none' })
      setTimeout(() => { uni.navigateBack() }, 800)
    }
  }
}
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 48rpx; }

.student-card { display: flex; align-items: center; margin: 28rpx; padding: 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--ac-t); color: var(--ac); font-size: var(--fs-16); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.info { flex: 1; margin-left: 24rpx; min-width: 0; }
.name { font-size: var(--fs-16); font-weight: 600; color: var(--N900); display: block; }
.meta { font-size: var(--fs-12); color: var(--N500); display: block; margin-top: 8rpx; }

/* ── Highlights ── */
.reason-text { color: var(--N500); font-size: var(--fs-12); line-height: 1.6; }
.diff-red { color: var(--er); font-weight: 700; font-size: var(--fs-14); }

/* ── Status Steps ── */
.steps { display: flex; flex-direction: column; }
.step { display: flex; align-items: flex-start; position: relative; padding-bottom: 28rpx; }
.step:last-child { padding-bottom: 0; }
.step-dot {
  width: 48rpx; height: 48rpx; border-radius: 50%;
  background: var(--N200); display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-11); color: var(--N500); flex-shrink: 0; z-index: 1;
  transition: background .4s ease, color .4s ease, box-shadow .4s ease, transform .3s ease;
  border: 3px solid transparent;
}
.step-dot.done { background: var(--ok); color: #fff; border-color: var(--ok); box-shadow: 0 0 0 4rpx var(--ok-bg); }
.step-dot.cur { background: var(--brand); color: #fff; border-color: var(--brand); box-shadow: 0 0 0 8rpx var(--brand-t); animation: pulse-dot 1.4s ease-in-out infinite; }
.step-dot.step-pop { transform: scale(1.35); box-shadow: 0 0 0 16rpx var(--ok-bg); }
.step-check { font-size: var(--fs-10); font-weight: 700; }
.step-num { font-weight: 600; }
.step-info { flex: 1; margin-left: 20rpx; min-width: 0; }
.step-label { font-size: var(--fs-13); font-weight: 600; color: var(--N900); display: block; transition: color .4s ease; }
.step.cur .step-label { color: var(--brand); }
.step.done .step-label { color: var(--ok); }
.step-sub { font-size: var(--fs-11); color: var(--N400); display: block; margin-top: 4rpx; transition: color .3s; }
.step-line { position: absolute; left: 24rpx; top: 48rpx; bottom: 0; width: 3px; background: var(--N200); transition: background .5s ease; }
.step-line.done { background: var(--ok); }
.step-line.anim-line { background: var(--brand); animation: line-glow .6s ease-out forwards; }

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 8rpx var(--brand-t); transform: scale(1); }
  50% { box-shadow: 0 0 0 22rpx var(--brand-t); transform: scale(1.05); }
}
@keyframes line-glow {
  0% { background: var(--brand); box-shadow: 0 0 6rpx var(--brand-t); }
  100% { background: var(--ok); box-shadow: 0 0 8rpx var(--ok-bg); }
}

/* ── Form ── */
.form-group { display: flex; flex-direction: column; }
.form-label { font-size: var(--fs-13); font-weight: 600; color: var(--N700); margin-bottom: 12rpx; }
.form-hint { font-size: var(--fs-11); color: var(--N400); display: block; margin-top: 12rpx; }
.opinion-textarea { width: 100%; min-height: 144rpx; padding: 20rpx 24rpx; border: 1.5px solid var(--N200); border-radius: 24rpx; font-size: var(--fs-13); color: var(--N900); background: var(--white); box-sizing: border-box; }

/* ── Action Row ── */
.action-row { display: flex; margin: 28rpx; }
.action-row > * { flex: 1; }
.action-row > * + * { margin-left: 20rpx; }
.btn-p { height: 96rpx; background: var(--brand); color: #fff; border-radius: 24rpx; font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; transition: background .3s, transform .2s; }
.btn-p:active { background: var(--brand-d); transform: scale(0.97); }
.btn-p.btn-done { background: var(--ok); pointer-events: none; }
.btn-e-outline { height: 96rpx; border-radius: 24rpx; border: 2px solid var(--er); color: var(--er); font-size: var(--fs-15); font-weight: 600; display: flex; align-items: center; justify-content: center; background: var(--white); transition: background .2s; }
.btn-e-outline:active { background: var(--er-bg); }
.btn-e { flex: 1; height: 96rpx; border-radius: 24rpx; background: var(--er-bg); color: var(--er); font-size: var(--fs-15); font-weight: 600; border: 1px solid var(--er-bd); display: flex; align-items: center; justify-content: center; }
.btn-e:active { background: var(--er); color: #fff; }

/* ── BottomSheet ── */
.ovl { position: fixed; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0); z-index: 300; visibility: hidden; transition: background .25s, visibility .25s; }
.ovl.on { background: rgba(0,0,0,.45); visibility: visible; }
.sheet { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 40rpx 40rpx 0 0; padding: 0 0 72rpx; transform: translateY(100%); transition: transform .28s cubic-bezier(.32,.72,0,1); }
.ovl.on .sheet { transform: translateY(0); }
.shandle { width: 72rpx; height: 8rpx; background: var(--N200); border-radius: 4rpx; margin: 20rpx auto 0; }
.stitle { font-size: var(--fs-16); font-weight: 600; color: var(--N900); padding: 28rpx 32rpx 24rpx; border-bottom: 1px solid var(--N50); display: block; text-align: center; }
.sbody2 { padding: 32rpx; display: flex; flex-direction: column; }
.sbody2 > * + * { margin-top: 24rpx; }
.smsg { font-size: var(--fs-13); color: var(--N500); text-align: center; line-height: 1.6; display: block; }
.sheet-textarea { width: 100%; min-height: 144rpx; padding: 20rpx 24rpx; border: 1.5px solid var(--N200); border-radius: 24rpx; font-size: var(--fs-13); color: var(--N900); background: var(--white); box-sizing: border-box; }
.brow { display: flex; }
.brow > * + * { margin-left: 16rpx; }
</style>
