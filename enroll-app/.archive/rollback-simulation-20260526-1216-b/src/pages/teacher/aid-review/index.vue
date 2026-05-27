<template>
  <view class="page">
    <SNavBar title="助学金申请详情" :showBack="true" />
    <scroll-view scroll-y class="body" v-if="item">
      <!-- Student Info Card -->
      <view class="student-card">
        <view class="avatar">{{ item.avatar || item.name.charAt(0) }}</view>
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="meta">{{ item.sid }} · 计算机学院 2026级1班</text>
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
            <view v-if="idx < statusSteps.length - 1" class="step-line" :class="{ done: step.done }" />
          </view>
        </view>
      </SCard>

      <!-- Application Info -->
      <SCard title="申请信息" :padding="16">
        <SInfoRow label="助学金档位">{{ item.type || '特殊困难助学金' }}</SInfoRow>
        <SInfoRow label="申请档位">
          <text class="amount-highlight">¥{{ item.amount || '4,000' }}</text>
        </SInfoRow>
        <SInfoRow label="家庭情况">{{ item.familySituation || '农村低保家庭' }}</SInfoRow>
        <SInfoRow label="申请原因">
          <text class="reason-text">{{ item.reason || '家庭经济困难，申请助学金以完成入学缴费。' }}</text>
        </SInfoRow>
      </SCard>

      <SCard title="佐证材料" :padding="16">
        <view class="preview-entry" @click="showPreview = true">
          <view class="preview-icon">📄</view>
          <view class="preview-main">
            <text class="preview-title">预览材料</text>
            <text class="preview-sub">查看学生提交的佐证材料</text>
          </view>
          <text class="preview-arrow">›</text>
        </view>
      </SCard>

      <SCard title="审核结果" :padding="16">
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

    </scroll-view>

    <view v-if="showPreview" class="ovl on" @click="showPreview = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">材料预览</text>
        <view class="sbody2">
          <text class="smsg">学生端提交的助学金佐证材料将在此统一预览。</text>
          <view class="preview-file">
            <text class="preview-file-name">申请材料包</text>
            <SBadge color="in">可预览</SBadge>
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
import { adaptReviewStatus, buildFundingReviewSteps, getReviewItem, REVIEW_STATUS } from '@/utils/businessState.js'
import { scholarshipApi } from '@/common/api/scholarship.js'

const STORAGE_KEY = 'teacher_aid_list'

function loadItem(uid) {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw).find(i => i.uid === uid) || null
    }
  } catch (e) { /* ignore */ }
  return null
}

export default {
  name: 'TeacherAidReview',
  components: { SNavBar, SCard, SInfoRow, SBadge },
  data() {
    return {
      item: null,
      showPreview: false,
      statusSteps: []
    }
  },
  computed: {
    lockedMessage() {
      if (!this.item) return ''
      if ([REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED].includes(this.item.status)) return '流程已完结，仅供查看。'
      if (this.item.status === REVIEW_STATUS.REJECTED) return '申请已驳回，仅供查看。'
      return '教师端仅查看本班助学金申请进度，审批操作由授权职工完成。'
    }
  },
  async onLoad(options) {
    const uid = options.uid
    const localItem = uid ? getReviewItem('aids', uid) : null
    if (uid) this.item = adaptReviewStatus(localItem || loadItem(uid) || { name: '孙文浩', sid: '2026010039', uid: 'aid-1', type: '特殊困难助学金', amount: '4,000', avatar: '孙', status: REVIEW_STATUS.PENDING })
    if (uid) {
      const detailRes = await scholarshipApi.getScholarshipDetail(uid)
      if (!localItem && detailRes?.data?.code === 0 && detailRes.data.data) this.item = adaptReviewStatus(detailRes.data.data)
    }
    if (this.item) {
      this.statusSteps = buildFundingReviewSteps(this.item)
    }
  },
  methods: {
    stepClass(idx) {
      const s = this.statusSteps[idx]
      return { done: s.done, cur: s.current }
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
.step-line { position: absolute; left: 24rpx; top: 48rpx; bottom: 0; width: 4px; border-radius: 2px; background: var(--N200); transition: background .5s ease, box-shadow .5s ease; }
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

/* ── Highlights ── */
.amount-highlight { color: var(--er); font-weight: 700; font-size: var(--fs-15); }
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

.result-head { display: flex; flex-direction: column; align-items: flex-start; }
.result-head > * + * { margin-top: 16rpx; }
.result-message { font-size: var(--fs-12); color: var(--N500); line-height: 1.6; }
.logs { margin-top: 24rpx; padding-top: 24rpx; border-top: 1px solid var(--N200); }
.log + .log { margin-top: 20rpx; }
.log-title { display: block; font-size: var(--fs-13); font-weight: 600; color: var(--N900); }
.log-time { display: block; margin-top: 4rpx; font-size: var(--fs-11); color: var(--N400); }
.log-remark { display: block; margin-top: 6rpx; font-size: var(--fs-12); color: var(--N500); line-height: 1.5; }

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
</style>
