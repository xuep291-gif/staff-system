<template>
  <view class="page">
    <!-- §6.4 Banner 横幅 -->
    <SBanner :avatar="teacher.avatar" :name="teacher.name" :sub="teacher.subtitle">
      <template #actions>
        <view class="banner-bell" @click="goMessages">
          <text class="bell-icon">🔔</text>
          <view class="bell-dot" v-if="unreadCount > 0" />
        </view>
        <view class="banner-gear" @click="goSettings">
          <text class="gear-icon">⚙</text>
        </view>
      </template>
    </SBanner>

    <!-- §6.5 浮动卡片 FloatCard -->
    <SFloatCard>
      <view class="fc-stats">
        <view class="fc-stat">
          <text class="fc-num">{{ feeStats.paid }}</text>
          <text class="fc-lbl">已缴费</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num wa">{{ feeStats.unpaid }}</text>
          <text class="fc-lbl">未缴费</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num">{{ feeStats.partial }}</text>
          <text class="fc-lbl">部分缴费</text>
        </view>
        <view class="fc-stat">
          <text class="fc-num">{{ feeStats.channel }}</text>
          <text class="fc-lbl">绿色通道</text>
        </view>
      </view>
      <view class="fc-prog">
        <SProgressBar
          :percent="payRate"
          color="brand"
          :headLabel="'班级缴费完成率'"
          :headPercent="true"
        />
        <view class="due-row">
          <text>欠费总金额</text>
          <text class="due-amount">¥{{ feeStats.outstandingAmount.toLocaleString() }}</text>
        </view>
      </view>
    </SFloatCard>

    <!-- §7.1 内容区 -->
    <view class="sc">
      <!-- §6.14 待办事项卡片 -->
      <SCard title="待办事项" :actionText="'共' + todoTotal + '项'">
        <view class="todo-item" v-for="todo in todos" :key="todo.key" @click="goTodo(todo.key)">
          <view class="todo-ico" :style="{ background: todo.bg }">{{ todo.icon }}</view>
          <view class="todo-body">
            <text class="todo-ttl">{{ todo.label }}</text>
            <text class="todo-sub">{{ todo.desc }}</text>
          </view>
          <SBadge :color="todo.badgeColor">{{ todo.count }}</SBadge>
          <text class="todo-arrow">›</text>
        </view>
      </SCard>

      <!-- §6.12 快捷功能卡片（分隔线网格模式 B） -->
      <SCard title="快捷功能">
        <view class="grid-3">
          <view class="grid-item" v-for="fn in quickFns" :key="fn.key" @click="goTodo(fn.key)">
            <text class="grid-ico">{{ fn.icon }}</text>
            <text class="grid-lbl">{{ fn.label }}</text>
          </view>
        </view>
      </SCard>
    </view>

    <!-- §6.3 底部 TabBar -->
    <STabBar :items="tabItems" v-model="activeTab" @change="onTabSwitch" />
  </view>
</template>

<script>
import SBanner from '@/components/shared/SBanner.vue'
import SFloatCard from '@/components/shared/SFloatCard.vue'
import SCard from '@/components/shared/SCard.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import STabBar from '@/components/shared/STabBar.vue'
import { getClassSummary, getUnreadCount } from '@/utils/businessState.js'

export default {
  name: 'TeacherHome',
  components: { SBanner, SFloatCard, SCard, SBadge, SProgressBar, STabBar },
  data() {
    return {
      activeTab: 0,
      unreadCount: 0,
      teacher: {
        avatar: '刘',
        name: '刘晓华',
        subtitle: '计算机学院 · 2026级1班 班主任'
      },
      feeStats: { paid: 0, unpaid: 0, partial: 0, channel: 0, outstandingAmount: 0, payRate: 0 },
      todos: [
        { key: 'fee-home', label: '缴费催缴提醒', desc: '查看未缴及逾期学生', icon: '¥', bg: 'var(--er-bg)', badgeColor: 'er', count: 0 },
        { key: 'aid-home', label: '助学金进度查看', desc: '查看本班申请进度', icon: '助', bg: 'var(--wa-bg)', badgeColor: 'wa', count: 0 },
        { key: 'loan-home', label: '助学贷款进度查看', desc: '查看本班申请进度', icon: '贷', bg: 'var(--in-bg)', badgeColor: 'wa', count: 0 }
      ],
      quickFns: [
        { key: 'fee-home', icon: '¥', label: '缴费查看' },
        { key: 'aid-home', icon: '助', label: '助学金' },
        { key: 'loan-home', icon: '贷', label: '助学贷款' },
        { key: 'messages', icon: '信', label: '消息中心' }
      ],
      tabItems: [
        { text: '首页', icon: '🏠' },
        { text: '缴费', icon: '¥', badge: '0' },
        { text: '助学金', icon: '助' },
        { text: '助学贷款', icon: '贷' },
        { text: '消息', icon: '信' }
      ]
    }
  },
  onShow() {
    const summary = getClassSummary()
    const pending = {
      'aid-home': summary.aids.tabs[1].count,
      'fee-home': summary.fees.unpaid,
      'loan-home': summary.loans.tabs[1].count
    }
    this.unreadCount = getUnreadCount('teacher')
    this.teacher.totalStudents = summary.totalStudents
    this.feeStats = summary.fees
    this.todos = this.todos.map(todo => ({
      ...todo,
      count: pending[todo.key] ?? todo.count,
      desc: todo.key === 'fee-home'
        ? `${pending[todo.key] ?? 0} 名学生可发起催缴`
        : `${pending[todo.key] ?? 0} 条申请正在流转`
    }))
    this.tabItems = this.tabItems.map((item, index) => {
      if (index === 1) return { ...item, badge: String(summary.fees.unpaid) }
      return item
    })
  },
  computed: {
    payRate() { return this.feeStats.payRate || 0 },
    todoTotal() { return this.todos.reduce((s, t) => s + t.count, 0) }
  },
  methods: {
    goMessages() { uni.navigateTo({ url: '/pages/teacher/messages/index' }) },
    goSettings() { uni.navigateTo({ url: '/pages/teacher/settings/index' }) },
    goTodo(key) {
      const routes = {
        'fee-home': '/pages/teacher/fee-home/index',
        'aid-home': '/pages/teacher/aid-home/index',
        'loan-home': '/pages/teacher/loan-home/index',
        messages: '/pages/teacher/messages/index'
      }
      if (routes[key]) uni.navigateTo({ url: routes[key] })
    },
    onTabSwitch(idx) {
      const routes = [ null, '/pages/teacher/fee-home/index', '/pages/teacher/aid-home/index', '/pages/teacher/loan-home/index', '/pages/teacher/messages/index' ]
      if (idx > 0 && routes[idx]) uni.navigateTo({ url: routes[idx] })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
  padding-bottom: var(--tabbar-h);
}

/* §6.4 Banner 操作按钮 */
.banner-bell, .banner-gear {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,.15);
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}
.banner-gear:active { opacity: 0.7; }
.bell-icon, .gear-icon { font-size: var(--fs-20); }
.bell-dot {
  width: 16rpx; height: 16rpx;
  background: var(--er);
  border-radius: var(--r-full);
  position: absolute;
  top: 12rpx; right: 12rpx;
  border: 3rpx solid var(--brand);
}

/* ── FloatCard 统计行 (§6.7) ── */
.fc-stats { display: flex; }
.fc-stat {
  flex: 1; text-align: center; padding: 8rpx 0;
  border-right: 1px solid var(--N200);
}
.fc-stat:last-child { border-right: none; }
.fc-num {
  font-size: var(--fs-22);
  font-weight: 700;
  color: var(--brand);
  line-height: 1.2;
}
.fc-num.wa { color: var(--wa); }
.fc-lbl { font-size: var(--fs-10); color: var(--N400); margin-top: 4rpx; }

.fc-prog { margin-top: 24rpx; }
.due-row {
  display: flex; justify-content: space-between;
  margin-top: 18rpx;
  font-size: var(--fs-12); color: var(--N500);
}
.due-amount { color: var(--er); font-weight: 700; }

/* ── 内容区 (§7.2) ── */
.sc {
  padding: 28rpx 0 0;
  display: flex; flex-direction: column;
}
.sc > * + * { margin-top: 20rpx; }

/* §6.14 待办列表项 */
.todo-item {
  display: flex; align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
  > * + * { margin-left: 20rpx; }
}
.todo-item:last-child { border-bottom: none; }
.todo-item:active { background: var(--N50); }

.todo-ico {
  width: 72rpx; height: 72rpx; border-radius: var(--r-8);
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-20);
}
.todo-body { flex: 1; min-width: 0; }
.todo-ttl { font-size: var(--fs-13); font-weight: 600; color: var(--N900); display: block; }
.todo-sub { font-size: var(--fs-11); color: var(--N500); margin-top: 2rpx; display: block; }
.todo-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }

/* §6.12 快捷网格（分隔线模式 B） */
.grid-3 {
  display: flex; flex-wrap: wrap;
  background: var(--N50);
  > * { flex: 0 0 33.3333%; }
}
.grid-item {
  background: var(--white);
  padding: 28rpx 16rpx; text-align: center;
  border: 1px solid var(--N50);
  box-sizing: border-box;
}
.grid-ico { font-size: 44rpx; display: block; margin-bottom: 8rpx; }
.grid-lbl { font-size: var(--fs-11); font-weight: 600; color: var(--N700); display: block; }
</style>
