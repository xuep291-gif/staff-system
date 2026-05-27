<template>
  <view class="page">
    <SNavBar title="催缴任务" :showBack="true" />
    <scroll-view scroll-y class="sbody">
      <view class="sc">
        <SAlertBar type="warning" message="⚠️ 同一学生 7 天内最多催缴 1 次，超出频次将自动拦截" :show="true" />

        <view class="card" v-if="runningTasks.length">
          <view class="card-hd"><text class="card-ttl">进行中的任务</text></view>
          <view class="card-bd">
            <text class="task-title">{{ runningTasks[0].name }}</text>
            <text class="task-sub">发送对象：{{ runningTasks[0].targetCount }}名未缴/逾期学生 · {{ runningTasks[0].createdAt }}</text>
            <view class="task-prog">
              <view class="prog-head">
                <text class="prog-lbl">已缴纳</text>
                <text class="prog-pct">{{ runningTasks[0].paidCount }}/{{ runningTasks[0].targetCount }}</text>
              </view>
              <view class="prog-track">
                <view class="prog-fill" :style="{ width: runningProgress + '%' }" />
              </view>
            </view>
          </view>
        </view>

        <view class="card">
          <view class="card-hd"><text class="card-ttl">历史任务</text></view>
          <view class="card-bd">
            <view class="task-item" v-for="task in completedTasks" :key="task.id">
              <view class="task-info">
                <text class="t-name">{{ task.name }}</text>
                <text class="t-meta">发送对象：{{ task.targetCount }}名 · {{ task.createdAt }}</text>
              </view>
              <SBadge color="ok">完成</SBadge>
            </view>
          </view>
        </view>

        <view class="btn-area">
          <SButton variant="primary" block @click="showSheet = true">+ 新建催缴任务</SButton>
        </view>
      </view>
    </scroll-view>

    <SBottomSheet v-model="showSheet" title="新建催缴任务">
      <view class="sheet-form">
        <view class="form-g">
          <text class="form-lbl">任务名称</text>
          <input class="form-input" v-model="form.name" placeholder="输入任务名称" placeholder-style="color: var(--N400)" />
        </view>
        <view class="form-g">
          <text class="form-lbl">发送对象</text>
          <input class="form-input" v-model="form.scope" placeholder="例如：全校未缴及逾期学生" placeholder-style="color: var(--N400)" />
        </view>
      </view>
      <template #footer>
        <view class="sheet-actions">
          <SButton variant="secondary" @click="showSheet = false">取消</SButton>
          <SButton variant="primary" @click="onCreate">创建并发送</SButton>
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
import { createUrgeTask, getUrgeTasks } from '@/utils/businessState.js'

export default {
  name: 'FinanceUrge',
  components: { SNavBar, SBadge, SButton, SAlertBar, SBottomSheet },
  data() {
    return { showSheet: false, tasks: [], form: { name: '', scope: '全校未缴及逾期学生' } }
  },
  computed: {
    runningTasks() {
      return this.tasks.filter(item => item.status === 'running')
    },
    completedTasks() {
      return this.tasks.filter(item => item.status === 'completed')
    },
    runningProgress() {
      const item = this.runningTasks[0]
      return item && item.targetCount ? Math.round(item.paidCount / item.targetCount * 100) : 0
    }
  },
  onShow() {
    this.tasks = getUrgeTasks()
  },
  methods: {
    onCreate() {
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请输入任务名称', icon: 'none' })
        return
      }
      createUrgeTask(this.form)
      this.tasks = getUrgeTasks()
      this.showSheet = false
      this.form = { name: '', scope: '全校未缴及逾期学生' }
      uni.showToast({ title: '催缴任务已创建', icon: 'success' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); }
.sbody { height: calc(100vh - 104rpx); }
.sc { padding: 28rpx; display: flex; flex-direction: column; > * + * { margin-top: 20rpx; } }

.card {
  background: var(--white);
  border-radius: var(--r-14);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}
.card-hd {
  display: flex;
  align-items: center;
  padding: var(--card-header-padding);
  border-bottom: 1px solid var(--N50);
}
.card-ttl { font-size: var(--fs-15); font-weight: 600; color: var(--N900); }
.card-bd { padding: var(--card-body-padding); }

.task-title { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.task-sub { font-size: var(--fs-11); color: var(--N500); margin-top: 4rpx; display: block; }
.task-prog { margin-top: 20rpx; }
.prog-head { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
.prog-lbl { font-size: var(--fs-11); color: var(--N500); }
.prog-pct { font-size: var(--fs-11); color: var(--N500); font-weight: 600; }
.prog-track { height: var(--prog-h); background: var(--N200); border-radius: var(--prog-radius); overflow: hidden; }
.prog-fill { height: 100%; border-radius: var(--prog-radius); background: var(--brand); }

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
}
.task-item:last-child { border-bottom: none; }
.task-info { flex: 1; min-width: 0; }
.t-name { font-size: var(--fs-13); font-weight: 600; color: var(--N900); display: block; }
.t-meta { font-size: var(--fs-11); color: var(--N500); margin-top: 4rpx; display: block; }

.btn-area { padding-top: 8rpx; }

.sheet-form { > * + * { margin-top: 24rpx; } }
.form-g { > * + * { margin-top: 12rpx; } }
.form-lbl { font-size: var(--fs-13); font-weight: 600; color: var(--N700); display: block; }
.form-input {
  width: 100%; height: 88rpx; padding: 0 24rpx;
  border: 1.5px solid var(--N200); border-radius: var(--r-12);
  font-size: var(--fs-13); color: var(--N900); background: var(--white); box-sizing: border-box;
}
.sheet-actions { display: flex; > * { flex: 1; } > * + * { margin-left: 16rpx; } }
</style>
