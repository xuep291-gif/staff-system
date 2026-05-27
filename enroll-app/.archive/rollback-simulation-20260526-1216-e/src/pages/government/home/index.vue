<template>
  <view class="page">
    <scroll-view scroll-y class="page-body">
      <!-- 2. Banner section -->
      <view class="banner">
        <view class="banner-avatar">李</view>
        <view class="banner-info">
          <text class="banner-name">李明远</text>
          <text class="banner-sub">政务处 · 审批专员</text>
        </view>
        <view class="banner-bell" @click="goMessages">
          <text class="bell-icon">🔔</text>
          <view class="bell-dot" v-if="unreadCount > 0" />
        </view>
        <view class="banner-gear" @click="goSettings">
          <text class="gear-icon">⚙</text>
        </view>
      </view>

      <!-- 3. Float Card -->
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

      <!-- 4. Todo Card -->
      <view class="sc">
        <view class="card">
          <view class="card-hd">
            <text class="card-ttl">待办事项</text>
            <SBadge color="er">{{ todoTotal }}</SBadge>
          </view>
          <view class="card-bd">
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
          </view>
        </view>

        <!-- Quick Functions Card -->
        <view class="card">
          <view class="card-hd">
            <text class="card-ttl">快捷功能</text>
          </view>
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
        </view>
      </view>
    </scroll-view>

    <!-- 5. Bottom TabBar -->
    <STabBar :items="tabItems" v-model="activeTab" @change="onTabSwitch" />
  </view>
</template>

<script>
import SFloatCard from '@/components/shared/SFloatCard.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import SAlertBar from '@/components/shared/SAlertBar.vue'
import STabBar from '@/components/shared/STabBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
import { getClassSummary, getUnreadCount } from '@/utils/businessState.js'

export default {
  name: 'GovernmentHome',
  components: { SFloatCard, SProgressBar, SAlertBar, STabBar, SBadge },
  data() {
    return {
      activeTab: 0,
      unreadCount: 0,
      checkinStats: { total: 0, checkedIn: 0, unchecked: 0, rate: 0 },
      todos: [
        {
          key: 'room-change',
          label: '换房审批',
          desc: '6 条待审批申请',
          barColor: 'var(--er)',
          badgeColor: 'er',
          count: 6
        },
        {
          key: 'aid-home',
          label: '助学金复审',
          desc: '3 条待复审申请',
          barColor: 'var(--wa)',
          badgeColor: 'wa',
          count: 3
        },
        {
          key: 'loan-home',
          label: '助学贷款复审',
          desc: '2 条待复审申请',
          barColor: 'var(--in)',
          badgeColor: 'in',
          count: 2
        }
      ],
      quickFns: [
        { key: 'room-change', icon: '🏠', label: '换房审批' },
        { key: 'aid-home', icon: '📄', label: '助学金审' },
        { key: 'loan-home', icon: '🏦', label: '贷款复审' },
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
    const summary = getClassSummary()
    const pending = {
      'room-change': summary.roomChanges.tabs[0].count,
      'aid-home': summary.aids.tabs[0].count,
      'loan-home': summary.loans.tabs[0].count
    }
    this.unreadCount = getUnreadCount('government')
    this.checkinStats = summary.checkin
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
    goMessages() {
      uni.navigateTo({ url: '/pages/government/messages/index' })
    },
    goSettings() {
      uni.navigateTo({ url: '/pages/government/settings/index' })
    },
    goTodo(key) {
      const routes = {
        'room-change': '/pages/government/room-change/index',
        'aid-home': '/pages/government/aid-home/index',
        'loan-home': '/pages/government/loan-home/index',
        checkin: '/pages/government/checkin/index',
        dorm: '/pages/government/dorm-home/index',
        messages: '/pages/government/messages/index'
      }
      if (routes[key]) {
        uni.navigateTo({ url: routes[key] })
      }
    },
    onTabSwitch(idx) {
      const routes = [
        null,
        '/pages/government/dorm-home/index',
        '/pages/government/aid-home/index',
        '/pages/government/checkin/index',
        '/pages/government/messages/index'
      ]
      if (idx > 0 && routes[idx]) {
        uni.navigateTo({ url: routes[idx] })
      }
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

.page-body {
  height: 0;
  flex: 1;
}

/* ── Banner ── */
.banner {
  background: var(--brand);
  padding: var(--banner-padding);
  display: flex;
  align-items: center;
  flex-shrink: 0;

  > * + * { margin-left: 24rpx; }
}
.banner-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: var(--r-full);
  background: rgba(255,255,255,0.2);
  border: 2rpx solid rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-20);
  font-weight: 700;
  color: var(--white);
  flex-shrink: 0;
}
.banner-info {
  flex: 1;
  min-width: 0;
}
.banner-name {
  font-size: var(--fs-18);
  font-weight: 700;
  color: var(--white);
  display: block;
}
.banner-sub {
  font-size: var(--fs-12);
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4rpx;
  display: block;
}
.banner-bell {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}
.bell-icon {
  font-size: var(--fs-20);
}
.bell-dot {
  width: 16rpx;
  height: 16rpx;
  background: var(--er);
  border-radius: var(--r-full);
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  border: 3rpx solid var(--brand);
}
.banner-gear {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255,255,255,0.15);
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.banner-bell:active,
.banner-gear:active { opacity: 0.7; }
.gear-icon {
  font-size: var(--fs-20);
}

/* ── Float Card ── */
.fc-label {
  font-size: var(--fs-12);
  color: var(--N400);
  display: block;
  margin-bottom: 4rpx;
}
.fc-amount {
  font-size: 56rpx;
  font-weight: 700;
  color: var(--brand);
}
.fc-stats {
  display: flex;
  margin-top: 24rpx;
}
.fc-stat {
  flex: 1;
  text-align: center;
  padding: 8rpx 0;
  border-right: 1px solid var(--N200);
}
.fc-stat:last-child {
  border-right: none;
}
.fc-num {
  font-size: var(--fs-16);
  font-weight: 700;
  color: var(--brand);
  line-height: 1.2;
}
.fc-num.wa {
  color: var(--wa);
}
.fc-lbl {
  font-size: var(--fs-10);
  color: var(--N400);
  margin-top: 4rpx;
}

/* ── Section ── */
.sc {
  padding: 28rpx;
  display: flex;
  flex-direction: column;

  > * + * { margin-top: 20rpx; }
}

/* ── Card ── */
.card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}
.card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--card-header-padding);
  border-bottom: 1px solid var(--N50);
}
.card-ttl {
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--N900);
}
.card-bd {
  padding: var(--card-body-padding);

  > * + * { margin-top: 0; }
}

/* ── Todo Items ── */
.todo-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);

  > * + * { margin-left: 20rpx; }
}
.todo-item:last-child {
  border-bottom: none;
}
.todo-item:active {
  background: var(--N50);
}
.todo-bar {
  width: 6rpx;
  height: 64rpx;
  border-radius: var(--r-3);
  flex-shrink: 0;
}
.todo-body {
  flex: 1;
  min-width: 0;
}
.todo-ttl {
  font-size: var(--fs-13);
  font-weight: 600;
  color: var(--N900);
  display: block;
}
.todo-sub {
  font-size: var(--fs-11);
  color: var(--N500);
  margin-top: 2rpx;
  display: block;
}
.todo-arrow {
  font-size: 28rpx;
  color: var(--N400);
  flex-shrink: 0;
}

/* ── Grid 3 ── */
.grid-3 {
  display: flex;
  flex-wrap: wrap;
  background: var(--N50);

  > * {
    width: calc(100% / 3);
  }
}
.grid-item {
  background: var(--white);
  padding: 28rpx 16rpx;
  text-align: center;
  border: 1px solid var(--N50);
  border-top: none;
  border-left: none;
  box-sizing: border-box;
}
.grid-item:nth-child(3n + 1) {
  border-left: none;
}
.grid-ico {
  font-size: 44rpx;
  display: block;
  margin-bottom: 8rpx;
}
.grid-lbl {
  font-size: var(--fs-11);
  font-weight: 600;
  color: var(--N700);
  display: block;
}
</style>
