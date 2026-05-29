<template>
  <view class="page">
    <scroll-view scroll-y class="page-body">
      <!-- §6.4 Banner -->
      <SBanner :avatar="gov.avatar" :name="gov.name" :sub="gov.subtitle">
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

      <!-- §6.5 Float Card -->
      <SFloatCard>
        <text class="fc-label">今日报到统计</text>
        <text class="fc-amount">{{ checkinStats.total }}</text>
        <view class="fc-stats">
          <view class="fc-stat">
            <text class="fc-num">{{ checkinStats.checkedIn }}</text>
            <text class="fc-lbl">已报到</text>
          </view>
          <view class="fc-stat">
            <text class="fc-num wa">{{ checkinStats.unchecked }}</text>
            <text class="fc-lbl">待报到</text>
          </view>
          <view class="fc-stat">
            <text class="fc-num">{{ checkinStats.rate }}%</text>
            <text class="fc-lbl">报到率</text>
          </view>
        </view>
        <SProgressBar :percent="checkinStats.rate" color="brand" />
      </SFloatCard>

      <!-- §7.1 Content -->
      <view class="sc">
        <SCard title="待办事项" :actionText="'共' + todoTotal + '项'">
          <view
            v-for="todo in todos"
            :key="todo.key"
            class="todo-item"
            @click="goTodo(todo.key)"
          >
            <view class="todo-bar" :style="{ background: todo.barColor }" />
            <view class="todo-body">
              <text class="todo-ttl">{{ todo.label }}</text>
              <text class="todo-sub">{{ todo.desc }}</text>
            </view>
            <SBadge :color="todo.badgeColor" customStyle="flex-shrink: 0">{{ todo.count }}</SBadge>
            <text class="todo-arrow">›</text>
          </view>
        </SCard>

        <SCard title="快捷功能">
          <view class="grid-3">
            <view
              v-for="fn in quickFns"
              :key="fn.key"
              class="grid-item"
              @click="goTodo(fn.key)"
            >
              <text class="grid-ico">{{ fn.icon }}</text>
              <text class="grid-lbl">{{ fn.label }}</text>
            </view>
          </view>
        </SCard>
      </view>
    </scroll-view>

    <!-- §6.3 Bottom TabBar -->
    <STabBar :items="tabItems" v-model="activeTab" @change="onTabSwitch" />
  </view>
</template>

<script>
import SBanner from '@/components/shared/SBanner.vue'
import SFloatCard from '@/components/shared/SFloatCard.vue'
import SCard from '@/components/shared/SCard.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import STabBar from '@/components/shared/STabBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
import { getClassSummary, getUnreadCount } from '@/utils/businessState.js'
import { getSubRole, getDataScope, SUB_ROLES } from '@/utils/permissions.js'

export default {
  name: 'GovernmentHome',
  components: { SBanner, SFloatCard, SCard, SProgressBar, STabBar, SBadge },
  data() {
    return {
      activeTab: 0,
      unreadCount: 0,
      isSchool: false,
      gov: {
        avatar: '李',
        name: '李明远',
        subtitle: '政务处 · 学工处负责人'
      },
      checkinStats: { total: 0, checkedIn: 0, unchecked: 0, rate: 0 },
      todos: [
        { key: 'room-change', label: '换房审批', desc: '6 条待审批申请', barColor: 'var(--er)', badgeColor: 'er', count: 6 },
        { key: 'aid-home', label: '助学金终审', desc: '3 条待终审申请', barColor: 'var(--wa)', badgeColor: 'wa', count: 3 },
        { key: 'loan-home', label: '助学贷款终审', desc: '2 条待终审申请', barColor: 'var(--in)', badgeColor: 'in', count: 2 }
      ],
      quickFns: [
        { key: 'room-change', icon: '🏠', label: '换房审批' },
        { key: 'aid-home', icon: '📄', label: '助学金审' },
        { key: 'loan-home', icon: '🏦', label: '贷款终审' },
        { key: 'checkin', icon: '✅', label: '报到统计' },
        { key: 'stats', icon: '📊', label: '统计概览' },
        { key: 'messages', icon: '🔔', label: '消息通知' }
      ],
      tabItems: [
        { text: '首页', icon: '🏠' },
        { text: '住宿', icon: '🏢' },
        { text: '助学金', icon: '📄' },
        { text: '报到', icon: '✅' },
        { text: '消息', icon: '🔔' }
      ]
    }
  },
  onShow() {
    let subRole = getSubRole()
    if (!subRole) {
      // 直接从独立 key 兜底
      try { subRole = uni.getStorageSync('staff_sub_role') || '' } catch (e) {}
    }
    const scope = getDataScope()
    this.isSchool = subRole === SUB_ROLES.STUDENT_AFFAIRS
    const summary = getClassSummary()
    const pending = {
      'room-change': summary.roomChanges.tabs[0].count,
      'aid-home': summary.aids.tabs[0].count,
      'loan-home': summary.loans.tabs[0].count
    }
    this.unreadCount = getUnreadCount('government')
    this.checkinStats = summary.checkin

    // 按子角色动态配置
    if (subRole === SUB_ROLES.STUDENT_AFFAIRS) {
      this.gov = { avatar: '李', name: '李明远', subtitle: '学工处 · 学工处负责人' }
      this.todos = [
        { key: 'room-change', label: '换房审批', desc: '待审批申请', barColor: 'var(--er)', badgeColor: 'er', count: 6 },
        { key: 'aid-home', label: '助学金学工处审批', desc: '学院复审已通过，待学工处审批', barColor: 'var(--wa)', badgeColor: 'wa', count: 3 },
        { key: 'loan-home', label: '助学贷款终审', desc: '待终审申请', barColor: 'var(--in)', badgeColor: 'in', count: 2 }
      ]
      this.quickFns = [
        { key: 'room-change', icon: '🏠', label: '换房审批' },
        { key: 'aid-home', icon: '📄', label: '助学金审批' },
        { key: 'loan-home', icon: '🏦', label: '贷款终审' },
        { key: 'checkin', icon: '✅', label: '报到统计' },
        { key: 'stats', icon: '📊', label: '统计概览' },
        { key: 'messages', icon: '🔔', label: '消息通知' }
      ]
    } else if (subRole === SUB_ROLES.COLLEGE_DEAN) {
      this.gov = { avatar: '张', name: '张教授', subtitle: '计算机学院 · 学院负责人' }
      this.todos = [
        { key: 'room-change', label: '换房审批(本院)', desc: '待审批申请', barColor: 'var(--er)', badgeColor: 'er', count: 6 },
        { key: 'aid-home', label: '助学金学院复审', desc: '辅导员初审已通过，待学院复审', barColor: 'var(--wa)', badgeColor: 'wa', count: 3 },
        { key: 'loan-home', label: '助学贷款复审(本院)', desc: '待复审申请', barColor: 'var(--in)', badgeColor: 'in', count: 2 }
      ]
      this.quickFns = [
        { key: 'room-change', icon: '🏠', label: '换房审批' },
        { key: 'aid-home', icon: '📄', label: '助学金复审' },
        { key: 'loan-home', icon: '🏦', label: '贷款复审' },
        { key: 'checkin', icon: '✅', label: '报到统计' },
        { key: 'messages', icon: '🔔', label: '消息通知' }
      ]
    }

    this.todos = this.todos.map(todo => ({
      ...todo,
      count: pending[todo.key] ?? todo.count,
      desc: `${pending[todo.key] ?? todo.count} 条待审批申请`
    }))
  },
  computed: {
    todoTotal() {
      return this.todos.reduce((sum, t) => sum + t.count, 0)
    }
  },
  methods: {
    goMessages() { uni.navigateTo({ url: '/pages/government/messages/index' }) },
    goSettings() { uni.navigateTo({ url: '/pages/government/settings/index' }) },
    goTodo(key) {
      const routes = {
        'room-change': '/pages/government/room-change/index',
        'aid-home': this.isSchool ? '/pages/government/aid-final-home/index' : '/pages/government/aid-home/index',
        'loan-home': '/pages/government/loan-home/index',
        checkin: '/pages/government/checkin/index',
        dorm: '/pages/government/dorm-home/index',
        messages: '/pages/government/messages/index',
        stats: '/pages/government/stats/index'
      }
      if (routes[key]) { uni.navigateTo({ url: routes[key] }) }
    },
    onTabSwitch(idx) {
      const routes = [null, '/pages/government/dorm-home/index', this.isSchool ? '/pages/government/aid-final-home/index' : '/pages/government/aid-home/index', '/pages/government/checkin/index', '/pages/government/messages/index']
      if (idx > 0 && routes[idx]) { uni.navigateTo({ url: routes[idx] }) }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
  display: flex;
  flex-direction: column;
  padding-bottom: var(--tabbar-h);
}

.page-body { height: 0; flex: 1; }

/* Banner actions */
.banner-bell, .banner-gear {
  width: 72rpx; height: 72rpx;
  background: rgba(255,255,255,.15);
  border-radius: var(--r-full);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.banner-bell { position: relative; }
.banner-bell:active, .banner-gear:active { opacity: 0.7; }
.bell-icon, .gear-icon { font-size: var(--fs-20); }
.bell-dot {
  width: 16rpx; height: 16rpx;
  background: var(--er);
  border-radius: var(--r-full);
  position: absolute;
  top: 12rpx; right: 12rpx;
  border: 3rpx solid var(--brand);
}

/* Float Card */
.fc-label { font-size: var(--fs-12); color: var(--N400); display: block; margin-bottom: 4rpx; }
.fc-amount { font-size: 56rpx; font-weight: 700; color: var(--brand); }
.fc-stats { display: flex; margin-top: 24rpx; }
.fc-stat {
  flex: 1; text-align: center; padding: 8rpx 0;
  border-right: 1px solid var(--N200);
}
.fc-stat:last-child { border-right: none; }
.fc-num { font-size: var(--fs-16); font-weight: 700; color: var(--brand); line-height: 1.2; }
.fc-num.wa { color: var(--wa); }
.fc-lbl { font-size: var(--fs-10); color: var(--N400); margin-top: 4rpx; }

/* Content */
.sc { padding: 28rpx; display: flex; flex-direction: column; }
.sc > * + * { margin-top: 20rpx; }

/* Todo items */
.todo-item {
  display: flex; align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
  > * + * { margin-left: 20rpx; }
}
.todo-item:last-child { border-bottom: none; }
.todo-item:active { background: var(--N50); }
.todo-bar {
  width: 6rpx; height: 64rpx;
  border-radius: var(--r-3);
  flex-shrink: 0;
}
.todo-body { flex: 1; min-width: 0; }
.todo-ttl { font-size: var(--fs-13); font-weight: 600; color: var(--N900); display: block; }
.todo-sub { font-size: var(--fs-11); color: var(--N500); margin-top: 2rpx; display: block; }
.todo-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }

/* Grid 3 */
.grid-3 {
  display: flex; flex-wrap: wrap;
  background: var(--N50);
  > * { width: calc(100% / 3); }
}
.grid-item {
  background: var(--white);
  padding: 28rpx 16rpx; text-align: center;
  border: 1px solid var(--N50);
  border-top: none; border-left: none;
  box-sizing: border-box;
}
.grid-item:nth-child(3n + 1) { border-left: none; }
.grid-ico { font-size: 44rpx; display: block; margin-bottom: 8rpx; }
.grid-lbl { font-size: var(--fs-11); font-weight: 600; color: var(--N700); display: block; }
</style>
