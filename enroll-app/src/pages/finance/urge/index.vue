<template>
  <view class="page">
    <SNavBar title="催缴任务" :showBack="true" fallbackUrl="/pages/finance/home/index" />
    <scroll-view scroll-y class="sbody">
      <view class="sc">
        <!-- Business Rule Alerts -->
        <SAlertBar type="warning" message="⏰ 每日发送时段：09:00–20:00 | 📋 同一学生同一账单 7 天内仅催缴 1 次 | 📦 单次任务上限 1000 条" :show="true" />
        <SAlertBar type="info" message="📨 发送失败自动重试 3 次（间隔 5 分钟）· 发送记录保留 180 天 · 失败通知可手动重发" :show="true" />

        <!-- Running Tasks -->
        <SCard v-if="runningTasks.length" title="进行中的任务">
          <view v-for="task in runningTasks" :key="task.id">
            <text class="task-title">{{ task.name }}</text>
            <text class="task-sub">发送对象：{{ task.targetCount }}名未缴/逾期学生 · {{ task.createdAt }}</text>
            <view class="task-stats">
              <view class="stat-chip ok">{{ task.paidCount }} 已缴</view>
              <view class="stat-chip wa" v-if="task.failCount">{{ task.failCount }} 失败</view>
            </view>
            <view class="task-prog">
              <view class="prog-head">
                <text class="prog-lbl">回款进度</text>
                <text class="prog-pct">{{ task.paidCount }}/{{ task.targetCount }} ({{ runningProgress(task) }}%)</text>
              </view>
              <view class="prog-track">
                <view class="prog-fill" :style="{ width: runningProgress(task) + '%' }" />
              </view>
            </view>
            <view class="task-actions" v-if="task.failCount">
              <SButton variant="warning" size="sm" @click="onRetryFailed(task)">重发失败通知</SButton>
            </view>
          </view>
        </SCard>

        <!-- History -->
        <SCard v-if="completedTasks.length" title="历史任务">
          <view class="task-item" v-for="task in completedTasks" :key="task.id">
            <view class="task-info">
              <text class="t-name">{{ task.name }}</text>
              <text class="t-meta">{{ task.targetCount }}名 · {{ task.createdAt }} · 完成率 {{ runningProgress(task) }}%</text>
            </view>
            <SBadge color="ok">完成</SBadge>
          </view>
        </SCard>

        <SEmpty v-if="!tasks.length" text="暂无催缴任务" />
      </view>
    </scroll-view>

    <view class="btn-area">
      <SButton variant="primary" block @tap="openCreate">+ 新建催缴任务</SButton>
    </view>

    <!-- Create Sheet -->
    <SBottomSheet v-model="showSheet" title="新建催缴任务">
      <view class="sheet-form">
        <SFormGroup label="任务名称" required>
          <input class="form-input" v-model="form.name" :placeholder="autoBatchName" />
        </SFormGroup>
        <SFormGroup label="催缴范围">
          <view class="scope-options">
            <view class="scope-opt" :class="{ on: !form.overdueOnly }" @click="form.overdueOnly = false">
              <text>全部未缴/逾期</text><text class="opt-num">{{ eligibleCount }}人</text>
            </view>
            <view class="scope-opt" :class="{ on: form.overdueOnly }" @click="form.overdueOnly = true">
              <text>仅逾期</text><text class="opt-num">{{ overdueCount }}人</text>
            </view>
          </view>
        </SFormGroup>
        <SFormGroup label="发送范围">
          <input class="form-input" v-model="form.scope" placeholder="如：计算机学院" />
        </SFormGroup>
        <SFormGroup label="预计发送人数" hint="上限 1000 人">
          <text class="form-count">{{ form.overdueOnly ? overdueCount : eligibleCount }} 人</text>
        </SFormGroup>
        <view v-if="timeBlocked" class="time-block-hint">
          <text class="tb-text">⚠️ 当前时间不在发送时段内（09:00–20:00），任务将在明早 09:00 自动发送</text>
        </view>
        <view v-if="eligibleCount > 1000" class="limit-hint">
          <text class="lh-text">⚠️ 符合条件的学生超过 1000 人上限，系统将自动截取前 1000 人</text>
        </view>
      </view>
      <template #footer>
        <view class="sheet-actions">
          <SButton variant="secondary" @tap="showSheet = false">取消</SButton>
          <SButton variant="primary" @tap="onCreate">创建{{ timeBlocked ? '并定时' : '并发送' }}</SButton>
        </view>
      </template>
    </SBottomSheet>

    <!-- Retry Sheet -->
    <SBottomSheet v-model="showRetry" title="重发失败通知">
      <view class="retry-body" v-if="retryTask">
        <text class="retry-info">任务「{{ retryTask.name }}」中有 {{ retryTask.failCount }} 条通知发送失败</text>
        <text class="retry-detail">系统已自动重试 3 次（间隔 5 分钟），以下失败记录需手动处理</text>
        <view class="retry-failures">
          <view class="rf-item" v-for="(f, idx) in retryTask.failures || sampleFailures" :key="idx">
            <text class="rf-name">{{ f.studentName || '学生' }}</text>
            <text class="rf-reason">{{ f.reason || '运营商返回错误' }}</text>
          </view>
        </view>
      </view>
      <template #footer>
        <view class="sheet-actions">
          <SButton variant="secondary" @click="showRetry = false">取消</SButton>
          <SButton variant="primary" @click="onConfirmRetry">确认重发</SButton>
        </view>
      </template>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SButton from '@/components/shared/SButton.vue'
import SAlertBar from '@/components/shared/SAlertBar.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import SCard from '@/components/shared/SCard.vue'
import SFormGroup from '@/components/shared/SFormGroup.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import { createUrgeTask, getUrgeTasks, getFeeList } from '@/utils/businessState.js'

const sampleFailures = [
  { studentName: '学生A', reason: '运营商通道异常' },
  { studentName: '学生B', reason: '手机号已停机' },
  { studentName: '学生C', reason: '微信模板消息发送超限' }
]

export default {
  name: 'FinanceUrge',
  components: { SNavBar, SBadge, SButton, SAlertBar, SBottomSheet, SCard, SFormGroup, SEmpty },
  data() {
    return {
      showSheet: false,
      showRetry: false,
      tasks: [],
      retryTask: null,
      form: { name: '', scope: '', overdueOnly: false },
      sampleFailures
    }
  },
  computed: {
    runningTasks() { return this.tasks.filter(t => t.status === 'running') },
    completedTasks() { return this.tasks.filter(t => t.status === 'completed') },
    allEligible() {
      return getFeeList().filter(f => ['unpaid', 'overdue', 'partial'].includes(f.payStatus))
    },
    eligibleCount() { return this.allEligible.length },
    overdueCount() { return this.allEligible.filter(f => f.payStatus === 'overdue').length },
    autoBatchName() {
      const m = new Date().getMonth() + 1
      return `学费逾期催缴 - ${m}月批次`
    },
    timeBlocked() {
      const h = new Date().getHours()
      return h < 9 || h >= 20
    }
  },
  onShow() { this.tasks = getUrgeTasks() },
  methods: {
    runningProgress(task) {
      return task && task.targetCount ? Math.round((task.paidCount || 0) / task.targetCount * 100) : 0
    },
    openCreate() {
      this.form = { name: '', scope: '全校未缴及逾期学生', overdueOnly: false }
      this.showSheet = true
    },
    onCreate() {
      const count = Math.min(this.form.overdueOnly ? this.overdueCount : this.eligibleCount, 1000)
      if (count === 0) {
        uni.showToast({ title: '没有需要催缴的学生', icon: 'none' })
        return
      }

      createUrgeTask({
        name: this.form.name.trim() || '',
        scope: this.form.scope.trim() || '全校未缴及逾期学生',
        overdueOnly: this.form.overdueOnly
      })
      this.tasks = getUrgeTasks()
      this.showSheet = false
      uni.showToast({ title: '催缴任务已创建，状态：进行中', icon: 'success' })
    },
    onRetryFailed(task) {
      this.retryTask = task
      this.showRetry = true
    },
    onConfirmRetry() {
      if (!this.retryTask) return
      this.tasks = getUrgeTasks()
      this.showRetry = false
      this.retryTask = null
      uni.showToast({ title: '失败通知已重新发送', icon: 'success' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); }
.sbody { height: calc(100vh - 104rpx); }
.sc { padding: 28rpx; display: flex; flex-direction: column; }
.sc > * + * { margin-top: 20rpx; }

.task-title { font-size: var(--fs-15); font-weight: 600; color: var(--N900); display: block; }
.task-sub { font-size: var(--fs-11); color: var(--N500); margin-top: 4rpx; display: block; }
.task-stats { display: flex; gap: 12rpx; margin-top: 12rpx; }
.stat-chip { padding: 4rpx 14rpx; border-radius: var(--r-20); font-size: var(--fs-10); font-weight: 600; }
.stat-chip.ok { background: var(--ok-bg); color: var(--ok); }
.stat-chip.wa { background: var(--wa-bg); color: var(--wa); }

.task-prog { margin-top: 16rpx; }
.prog-head { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
.prog-lbl { font-size: var(--fs-11); color: var(--N500); }
.prog-pct { font-size: var(--fs-11); color: var(--N500); font-weight: 600; }
.prog-track { height: 12rpx; background: var(--N200); border-radius: 6rpx; overflow: hidden; }
.prog-fill { height: 100%; border-radius: 6rpx; background: var(--brand); transition: width 0.6s; }

.task-actions { margin-top: 16rpx; padding-top: 16rpx; border-top: 1px solid var(--N50); }

.task-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 0; border-bottom: 1px solid var(--N50);
}
.task-item:last-child { border-bottom: none; }
.task-info { flex: 1; min-width: 0; }
.t-name { font-size: var(--fs-13); font-weight: 600; color: var(--N900); display: block; }
.t-meta { font-size: var(--fs-11); color: var(--N500); margin-top: 4rpx; display: block; }

.btn-area { padding: 20rpx 28rpx 40rpx; background: var(--N50); }

/* ── Sheet ── */
.sheet-form { display: flex; flex-direction: column; gap: 24rpx; }
.form-input {
  width: 100%; height: 88rpx; padding: 0 24rpx;
  border: 1.5px solid var(--N200); border-radius: var(--r-12);
  font-size: var(--fs-13); color: var(--N900); background: var(--white); box-sizing: border-box;
}
.form-input::placeholder { color: var(--N400); }
.scope-options { display: flex; gap: 16rpx; }
.scope-opt { flex: 1; padding: 16rpx 20rpx; border-radius: var(--r-10); border: 1.5px solid var(--N200); background: var(--white); display: flex; justify-content: space-between; align-items: center; }
.scope-opt.on { border-color: var(--brand); background: var(--brand-t); }
.scope-opt text { font-size: var(--fs-13); color: var(--N700); }
.scope-opt.on text { color: var(--brand); font-weight: 600; }
.opt-num { font-size: var(--fs-11) !important; color: var(--N400) !important; }
.scope-opt.on .opt-num { color: var(--brand) !important; }

.form-count { font-size: var(--fs-18); font-weight: 700; color: var(--brand); }
.time-block-hint {
  padding: 16rpx 20rpx; border-radius: var(--r-8); background: var(--wa-bg);
}
.tb-text { font-size: var(--fs-11); color: var(--wa); line-height: 1.5; }
.limit-hint {
  padding: 16rpx 20rpx; border-radius: var(--r-8); background: var(--er-bg);
}
.lh-text { font-size: var(--fs-11); color: var(--er); line-height: 1.5; }

.sheet-actions { display: flex; }
.sheet-actions > * { flex: 1; }
.sheet-actions > * + * { margin-left: 16rpx; }

/* ── Retry ── */
.retry-body { padding: 8rpx 0; }
.retry-info { font-size: var(--fs-13); color: var(--N900); display: block; margin-bottom: 8rpx; }
.retry-detail { font-size: var(--fs-11); color: var(--N500); display: block; line-height: 1.5; }
.retry-failures { margin-top: 20rpx; }
.rf-item {
  padding: 16rpx 0; border-bottom: 1px solid var(--N50);
  display: flex; justify-content: space-between; align-items: center;
}
.rf-name { font-size: var(--fs-13); color: var(--N900); font-weight: 500; }
.rf-reason { font-size: var(--fs-11); color: var(--er); }
</style>
