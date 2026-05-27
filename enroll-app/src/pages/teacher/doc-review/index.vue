<template>
  <view class="page">
    <SNavBar title="资料初核" :showBack="true" />
    <scroll-view scroll-y class="body" v-if="item">
      <!-- Student Info Card -->
      <view class="student-card">
        <view class="avatar">{{ item.name.charAt(0) }}</view>
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="meta">{{ item.id }} · 计算机学院 2026级1班 · 提交于 {{ item.submittedAt || item.time }}</text>
        </view>
        <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
      </view>

      <!-- Status Steps -->
      <SCard title="审核进度" :padding="16">
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

      <SCard title="提交材料" :padding="16">
        <view class="preview-entry" @click="showPreview = true">
          <view class="preview-icon">📄</view>
          <view class="preview-main">
            <text class="preview-title">预览提交材料</text>
            <text class="preview-sub">查看该学生上传的全部材料</text>
          </view>
          <text class="preview-arrow">›</text>
        </view>
      </SCard>

      <!-- Review Opinion -->
      <SCard v-if="canSubmit" title="初核意见" :padding="16">
        <view class="form-group">
          <text class="form-label">审核意见</text>
          <textarea class="opinion-textarea" v-model="form.opinion" placeholder="补充审核说明…" />
        </view>
      </SCard>

      <SCard v-else title="审核结果" :padding="16">
        <view class="result-head">
          <SBadge :color="item.badgeColor">{{ item.statusLabel }}</SBadge>
          <text class="result-message">{{ lockedMessage }}</text>
        </view>
        <view class="logs" v-if="item.logs && item.logs.length">
          <view class="log" v-for="log in item.logs" :key="log.time + log.node">
            <text class="log-title">{{ log.node }} · {{ log.result }}</text>
            <text class="log-time">{{ log.time }}</text>
            <text class="log-remark" v-if="log.remark">{{ log.remark }}</text>
          </view>
        </view>
      </SCard>

      <!-- Action Buttons -->
      <view class="action-row" v-if="canSubmit">
        <view class="btn-e-outline" @click="showSheet = true">
          <text>退回重传</text>
        </view>
        <view class="btn-p" @click="onApprove">
          <text>初核通过</text>
        </view>
      </view>
    </scroll-view>

    <!-- Reject BottomSheet -->
    <view v-if="showSheet && canSubmit" class="ovl on" @click="showSheet = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">退回原因</text>
        <view class="sbody2">
          <text class="smsg">请输入退回原因，便于学生修改后重新提交</text>
          <textarea class="sheet-textarea" v-model="rejectReason" placeholder="请输入退回原因…" />
          <view class="brow">
            <view class="btn-e" @click="showSheet = false">
              <text>取消</text>
            </view>
            <view class="btn-p" @click="confirmReject">
              <text>确认退回</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showPreview" class="ovl on" @click="showPreview = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">提交材料预览</text>
        <view class="sbody2">
          <view class="material-preview" v-for="m in materials" :key="m.label">
            <text class="material-name">{{ m.label }}</text>
            <text class="material-state">{{ m.checked ? '已上传' : '待补充' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SBadge from '@/components/shared/SBadge.vue'
import { buildMaterialReviewSteps, getReviewItem, updateReview, MATERIAL_STATUS } from '@/utils/businessState.js'
import { documentApi } from '@/common/api/document.js'

export default {
  name: 'TeacherDocReview',
  components: { SNavBar, SCard, SBadge },
  data() {
    return {
      item: null,
      showSheet: false,
      showPreview: false,
      rejectReason: '',
      submitDone: false,
      animatingLine: -1,
      timers: [],
      materials: [
        { label: '身份证', checked: true },
        { label: '录取通知书', checked: true },
        { label: '户口本', checked: true },
        { label: '证件照', checked: true }
      ],
      form: { opinion: '' },
      statusSteps: []
    }
  },
  computed: {
    canSubmit() {
      return this.item && this.item.status === MATERIAL_STATUS.PENDING
    },
    lockedMessage() {
      if (!this.item) return ''
      if (this.item.status === MATERIAL_STATUS.REJECTED) return '资料已退回，当前审核记录不可重复处理。'
      return '教师审核已完成，审核意见不可再次修改。'
    }
  },
  async onLoad(options) {
    const uid = options.uid
    if (uid) {
      const localItem = getReviewItem('documents', uid)
      const res = await documentApi.getReviewDetail(uid)
      this.item = localItem || (res?.data?.code === 0 ? res.data.data : null)
      if (!this.item) {
        this.item = { uid: uid, name: '未知学生', id: '', submittedAt: '', status: MATERIAL_STATUS.PENDING, statusLabel: '待审核', badgeColor: 'wa' }
      }
    }
    if (this.item) {
      this.statusSteps = buildMaterialReviewSteps(this.item)
      this.submitDone = !this.canSubmit
    }
  },
  beforeUnmount() {
    this.timers.forEach(id => clearTimeout(id))
    this.timers = []
    this.showSheet = false
    this.showPreview = false
    this.submitDone = false
  },
  methods: {
    _setTimer(fn, delay) {
      const id = setTimeout(() => {
        this.timers = this.timers.filter(t => t !== id)
        fn()
      }, delay)
      this.timers.push(id)
      return id
    },
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
      this._setTimer(() => {
        this.statusSteps[currentIdx].popping = false
        this.animatingLine = -1
        if (currentIdx + 1 < this.statusSteps.length) {
          this.statusSteps[currentIdx + 1].current = true
          this.statusSteps[currentIdx + 1].popping = true
          this._setTimer(() => { this.statusSteps[currentIdx + 1].popping = false }, 400)
        }
      }, 400)
    },
    async onApprove() {
      if (!this.canSubmit || this.submitDone) return
      if (this.item) {
        await documentApi.approveReview(this.item.uid || this.item.documentReviewId, {
          opinion: this.form.opinion || '资料完整，审核通过'
        })
        updateReview('documents', this.item.uid, MATERIAL_STATUS.FIRST_PASS, {
          node: '教师审核', result: '审核通过', remark: this.form.opinion || '资料完整，审核通过'
        })
        this.item = getReviewItem('documents', this.item.uid) || this.item
        this.statusSteps = buildMaterialReviewSteps(this.item)
      }
      this.submitDone = true
      this._setTimer(() => {
        uni.showToast({ title: '初核通过', icon: 'success' })
      }, 500)
      this._setTimer(() => {
        uni.navigateBack()
      }, 1200)
    },
    async confirmReject() {
      if (!this.canSubmit) return
      this.showSheet = false
      if (this.item) {
        await documentApi.rejectReview(this.item.uid || this.item.documentReviewId, {
          rejectReason: this.rejectReason || '材料需要重新上传'
        })
        updateReview('documents', this.item.uid, MATERIAL_STATUS.REJECTED, {
          node: '教师审核', result: '已退回', remark: this.rejectReason || '材料需重新上传'
        })
        this.item = getReviewItem('documents', this.item.uid) || this.item
        this.statusSteps = buildMaterialReviewSteps(this.item)
      }
      uni.showToast({ title: '已退回，学生可重新提交', icon: 'none' })
      this._setTimer(() => {
        uni.navigateBack()
      }, 800)
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; padding-bottom: 48rpx; }

.student-card { display: flex; align-items: center; margin: 28rpx; padding: 28rpx; background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--brand-t); color: var(--brand); font-size: var(--fs-16); font-weight: 600; display: flex; align-items: center; justify-content: center; }
.info { flex: 1; margin-left: 24rpx; min-width: 0; }
.name { font-size: var(--fs-16); font-weight: 600; color: var(--N900); display: block; }
.meta { font-size: var(--fs-12); color: var(--N500); display: block; margin-top: 8rpx; }

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

.preview-entry { display: flex; align-items: center; min-height: 96rpx; }
.preview-entry > * + * { margin-left: 20rpx; }
.preview-icon { width: 72rpx; height: 72rpx; border-radius: var(--r-12); background: var(--brand-t); color: var(--brand); display: flex; align-items: center; justify-content: center; font-size: var(--fs-20); }
.preview-main { flex: 1; min-width: 0; }
.preview-title { display: block; font-size: var(--fs-14); color: var(--N900); font-weight: 600; }
.preview-sub { display: block; margin-top: 4rpx; font-size: var(--fs-11); color: var(--N500); }
.preview-arrow { color: var(--N400); font-size: 32rpx; }
.material-preview { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 0; border-bottom: 1px solid var(--N50); }
.material-name { font-size: var(--fs-13); color: var(--N900); font-weight: 600; }
.material-state { font-size: var(--fs-12); color: var(--brand); }

/* ── Form ── */
.form-group { display: flex; flex-direction: column; }
.form-label { font-size: var(--fs-13); font-weight: 600; color: var(--N700); margin-bottom: 12rpx; }
.opinion-textarea { width: 100%; min-height: 144rpx; padding: 20rpx 24rpx; border: 1.5px solid var(--N200); border-radius: 24rpx; font-size: var(--fs-13); color: var(--N900); background: var(--white); box-sizing: border-box; }
.result-head { display: flex; flex-direction: column; align-items: flex-start; }
.result-head > * + * { margin-top: 16rpx; }
.result-message { font-size: var(--fs-12); color: var(--N500); line-height: 1.6; }
.logs { margin-top: 24rpx; padding-top: 24rpx; border-top: 1px solid var(--N200); }
.log + .log { margin-top: 20rpx; }
.log-title { display: block; font-size: var(--fs-13); font-weight: 600; color: var(--N900); }
.log-time { display: block; margin-top: 4rpx; font-size: var(--fs-11); color: var(--N400); }
.log-remark { display: block; margin-top: 6rpx; font-size: var(--fs-12); color: var(--N500); line-height: 1.5; }

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
