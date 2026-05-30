<template>
  <view class="page">
    <SNavBar title="校外住宿审核" :showBack="true" />
    <scroll-view scroll-y class="body" v-if="item">
      <!-- Student Info Card -->
      <view class="student-card">
        <view class="avatar">{{ item.avatar || item.name.charAt(0) }}</view>
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="meta">{{ item.id }} · 计算机学院 2026级1班</text>
        </view>
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

      <!-- Application Info -->
      <SCard title="申请信息" :padding="16">
        <SInfoRow label="申请人">{{ item.name }}</SInfoRow>
        <SInfoRow label="学号">{{ item.id }}</SInfoRow>
        <SInfoRow label="校外地址">{{ item.address }}</SInfoRow>
        <SInfoRow label="申请原因">
          <text class="reason-text">家庭住址距学校较近，为节省住宿费用，申请校外住宿</text>
        </SInfoRow>
        <SInfoRow label="家长意见">同意学生校外住宿申请</SInfoRow>
        <SInfoRow label="申请时间">2026-05-12 10:30</SInfoRow>
      </SCard>

      <!-- Bank Card Info -->
      <SCard title="银行卡信息" :padding="16">
        <SInfoRow label="开户银行">中国工商银行</SInfoRow>
        <SInfoRow label="银行卡号">6222 0219 0301 2453 091</SInfoRow>
        <SInfoRow label="开户人">{{ item.name }}</SInfoRow>
      </SCard>

      <!-- Materials -->
      <SCard title="佐证材料">
        <view class="material-grid">
          <view v-for="(m, idx) in materials" :key="idx" class="material-item">
            <view class="material-thumb">
              <text class="material-icon">{{ m.icon }}</text>
            </view>
            <text class="material-label">{{ m.label }}</text>
          </view>
        </view>
      </SCard>

      <!-- Review Form -->
      <SCard title="班主任审核意见" :padding="16">
        <view class="form-group">
          <text class="form-label">审核意见</text>
          <textarea class="opinion-textarea" v-model="form.opinion" placeholder="请输入审核意见…" />
        </view>
      </SCard>

      <!-- Action Buttons -->
      <view class="action-row">
        <view class="btn-e-outline" @click="showReject = true">
          <text>不予通过</text>
        </view>
        <view class="btn-p" :class="{ 'btn-done': submitDone }" @click="onApprove">
          <text>{{ submitDone ? '已提交 ✓' : '通过审核' }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Reject BottomSheet -->
    <view v-if="showReject" class="ovl on" @click="showReject = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">退回原因</text>
        <view class="sbody2">
          <text class="smsg">请输入退回原因，方便学生修改后重新提交</text>
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

const STORAGE_KEY = 'teacher_nondorm_list'
const SYNC_KEYS = ['gov_nondorm_list']

function loadItem(uid) {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw).find(i => i.uid === uid) || null
    }
  } catch (e) { /* ignore */ }
  return null
}

function saveToStorage(key, list) {
  try { uni.setStorageSync(key, JSON.stringify(list)) } catch (e) { /* ignore */ }
}

function saveItemStatus(uid, status, badgeColor, info) {
  try {
    let raw = uni.getStorageSync(STORAGE_KEY)
    if (!raw) {
      const defaults = [
        { uid: 'tnd-1', name: '赵刚', id: '2026010008', address: '校园路12号', status: '待审核', badgeColor: 'wa', avatar: '赵' },
        { uid: 'tnd-2', name: '孙丽', id: '2026010019', address: '学府花园3栋', status: '待审核', badgeColor: 'wa', avatar: '孙' }
      ]
      saveToStorage(STORAGE_KEY, defaults)
      raw = JSON.stringify(defaults)
    }
    if (raw) {
      const list = JSON.parse(raw)
      const item = list.find(i => i.uid === uid)
      if (item) {
        item.status = status
        item.badgeColor = badgeColor
        if (info) item.info = info
        saveToStorage(STORAGE_KEY, list)
        SYNC_KEYS.forEach(sk => {
          try {
            const sRaw = uni.getStorageSync(sk)
            if (sRaw) {
              const sList = JSON.parse(sRaw)
              const sItem = sList.find(i => i.uid === uid)
              if (sItem) {
                sItem.status = '待政务审批'
                sItem.badgeColor = 'wa'
                saveToStorage(sk, sList)
              }
            }
          } catch (e) { /* ignore */ }
        })
      }
    }
  } catch (e) { /* ignore */ }
}

export default {
  name: 'TeacherNonDormReview',
  components: { SNavBar, SCard, SInfoRow },
  data() {
    return {
      item: null,
      showReject: false,
      rejectReason: '',
      submitDone: false,
      animatingLine: -1,
      materials: [
        { icon: '📄', label: '校外住宿申请表' },
        { icon: '📋', label: '家长同意书' },
        { icon: '🏠', label: '居住证明' },
        { icon: '🆔', label: '身份证复印件' }
      ],
      form: { opinion: '材料齐全，理由合理，同意校外住宿申请。' },
      statusSteps: [
        { label: '学生提交', sub: '2026-05-12', done: true, current: false, popping: false },
        { label: '班主任审核', sub: '当前步骤', done: false, current: true, popping: false },
        { label: '政务处审批', sub: '待进行', done: false, current: false, popping: false },
        { label: '备案完成', sub: '待进行', done: false, current: false, popping: false }
      ]
    }
  },
  onLoad(options) {
    const uid = options.uid
    if (uid) {
      this.item = loadItem(uid) || { uid: 'tnd-1', name: '赵刚', id: '2026010008', address: '校园路12号', avatar: '赵' }
    } else {
      this.item = { uid: 'tnd-1', name: '赵刚', id: '2026010008', address: '校园路12号', avatar: '赵' }
    }
    if (this.item) {
      if (this.item.status === '初审通过') {
        this.submitDone = true
        this.statusSteps = [
          { label: '学生提交', sub: '2026-05-12', done: true, current: false, popping: false },
          { label: '班主任审核', sub: '已通过', done: true, current: false, popping: false },
          { label: '政务处审批', sub: '当前步骤', done: false, current: true, popping: false },
          { label: '备案完成', sub: '待进行', done: false, current: false, popping: false }
        ]
      } else if (this.item.status === '已驳回') {
        this.submitDone = true
        this.statusSteps = [
          { label: '学生提交', sub: '2026-05-12', done: true, current: false, popping: false },
          { label: '班主任审核', sub: '已驳回', done: false, current: true, popping: false },
          { label: '政务处审批', sub: '待进行', done: false, current: false, popping: false },
          { label: '备案完成', sub: '待进行', done: false, current: false, popping: false }
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
    onApprove() {
      if (this.submitDone) return
      if (this.item) saveItemStatus(this.item.uid, '初审通过', 'in', '已转政务处审批（' + new Date().toLocaleDateString() + '）')
      this.submitDone = true
      this.animateStep(1)
      setTimeout(() => {
        uni.showToast({ title: '审核已提交', icon: 'success' })
        setTimeout(() => { uni.navigateBack() }, 800)
      }, 600)
    },
    confirmReject() {
      this.showReject = false
      if (this.item) saveItemStatus(this.item.uid, '已驳回', 'er')
      this.submitDone = true
      this.statusSteps = [
        { label: '学生提交', sub: this.statusSteps[0].sub, done: true, current: false, popping: false },
        { label: '班主任审核', sub: '已驳回', done: false, current: true, popping: false },
        { label: '政务处审批', sub: '待进行', done: false, current: false, popping: false },
        { label: '备案完成', sub: '待进行', done: false, current: false, popping: false }
      ]
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

/* ── Highlights ── */
.reason-text { color: var(--N500); font-size: var(--fs-12); line-height: 1.6; }

/* ── Materials ── */
.material-grid { display: flex; flex-wrap: wrap; }
.material-item { width: 25%; display: flex; flex-direction: column; align-items: center; padding: 12rpx 0; }
.material-thumb { width: 140rpx; height: 140rpx; border-radius: var(--r-12); background: var(--N50); border: 2px solid var(--N200); display: flex; align-items: center; justify-content: center; }
.material-icon { font-size: 52rpx; }
.material-label { font-size: var(--fs-11); color: var(--N500); margin-top: 10rpx; }

/* ── Form ── */
.form-group { display: flex; flex-direction: column; }
.form-label { font-size: var(--fs-13); font-weight: 600; color: var(--N700); margin-bottom: 12rpx; }
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
