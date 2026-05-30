<template>
  <view class="page">
    <SNavBar title="统计概览" :showBack="true" />

    <scroll-view scroll-y class="body">
      <!-- 数据范围标签 -->
      <view class="scope-tag">
        <text>{{ scopeLabel }}</text>
      </view>

      <!-- 报到统计 -->
      <view class="card">
        <text class="card-title">报到统计</text>
        <view class="stats-row">
          <view class="stat-item">
            <text class="st-num">{{ stats.checkin.total }}</text>
            <text class="st-lbl">总人数</text>
          </view>
          <view class="stat-item">
            <text class="st-num ok">{{ stats.checkin.checkedIn }}</text>
            <text class="st-lbl">已报到</text>
          </view>
          <view class="stat-item">
            <text class="st-num wa">{{ stats.checkin.unchecked }}</text>
            <text class="st-lbl">未报到</text>
          </view>
          <view class="stat-item">
            <text class="st-num brand">{{ stats.checkin.rate }}%</text>
            <text class="st-lbl">报到率</text>
          </view>
        </view>
        <SProgressBar :percent="stats.checkin.rate" color="brand" />
      </view>

      <!-- 缴费统计 -->
      <view class="card">
        <text class="card-title">缴费统计</text>
        <view class="stats-row">
          <view class="stat-item">
            <text class="st-num">¥{{ fmtAmount(stats.fees.total) }}</text>
            <text class="st-lbl">应缴总额</text>
          </view>
          <view class="stat-item">
            <text class="st-num ok">¥{{ fmtAmount(stats.fees.paid) }}</text>
            <text class="st-lbl">已缴总额</text>
          </view>
          <view class="stat-item">
            <text class="st-num wa">{{ stats.fees.paidCount }}</text>
            <text class="st-lbl">已缴人数</text>
          </view>
          <view class="stat-item">
            <text class="st-num er">{{ stats.fees.unpaidCount }}</text>
            <text class="st-lbl">未缴人数</text>
          </view>
        </view>
        <SProgressBar :percent="stats.fees.rate" color="ok" />
      </view>

      <!-- 助学金统计 -->
      <view class="card">
        <text class="card-title">助学金统计</text>
        <view class="stats-row">
          <view class="stat-item">
            <text class="st-num">{{ stats.aids.total }}</text>
            <text class="st-lbl">申请总数</text>
          </view>
          <view class="stat-item">
            <text class="st-num ok">{{ stats.aids.approved }}</text>
            <text class="st-lbl">已通过</text>
          </view>
          <view class="stat-item">
            <text class="st-num wa">{{ stats.aids.pending }}</text>
            <text class="st-lbl">待审核</text>
          </view>
          <view class="stat-item">
            <text class="st-num er">{{ stats.aids.rejected }}</text>
            <text class="st-lbl">已驳回</text>
          </view>
        </view>
      </view>

      <!-- 贷款统计 -->
      <view class="card">
        <text class="card-title">助学贷款统计</text>
        <view class="stats-row">
          <view class="stat-item">
            <text class="st-num">{{ stats.loans.total }}</text>
            <text class="st-lbl">申请总数</text>
          </view>
          <view class="stat-item">
            <text class="st-num ok">{{ stats.loans.approved }}</text>
            <text class="st-lbl">已通过</text>
          </view>
          <view class="stat-item">
            <text class="st-num wa">{{ stats.loans.pending }}</text>
            <text class="st-lbl">待审核</text>
          </view>
          <view class="stat-item">
            <text class="st-num er">{{ stats.loans.rejected }}</text>
            <text class="st-lbl">已驳回</text>
          </view>
        </view>
      </view>

      <!-- 宿舍统计 -->
      <view class="card">
        <text class="card-title">住宿统计</text>
        <view class="stats-row">
          <view class="stat-item">
            <text class="st-num">{{ stats.dorm.total }}</text>
            <text class="st-lbl">住宿人数</text>
          </view>
          <view class="stat-item">
            <text class="st-num wa">{{ stats.dorm.changes }}</text>
            <text class="st-lbl">换房申请</text>
          </view>
          <view class="stat-item">
            <text class="st-num ok">{{ stats.dorm.nonDorm }}</text>
            <text class="st-lbl">校外住宿</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import { getClassSummary } from '@/utils/businessState.js'
import { getSubRole, getDataScope, SUB_ROLES } from '@/utils/permissions.js'

export default {
  name: 'GovernmentStats',
  components: { SNavBar, SProgressBar },
  data() {
    return {
      scopeLabel: '全校数据',
      stats: {
        checkin: { total: 0, checkedIn: 0, unchecked: 0, rate: 0 },
        fees: { total: 0, paid: 0, paidCount: 0, unpaidCount: 0, rate: 0 },
        aids: { total: 0, approved: 0, pending: 0, rejected: 0 },
        loans: { total: 0, approved: 0, pending: 0, rejected: 0 },
        dorm: { total: 0, changes: 0, nonDorm: 0 }
      }
    }
  },
  onShow() {
    const subRole = getSubRole()
    const scope = getDataScope()
    const summary = getClassSummary()

    if (subRole === SUB_ROLES.COLLEGE_DEAN) {
      this.scopeLabel = scope.collegeId ? `本院数据（${scope.collegeId}）` : '本院数据'
    } else {
      this.scopeLabel = '全校数据'
    }

    this.stats = {
      checkin: summary.checkin,
      fees: {
        total: summary.fees.tabs.reduce((s, t) => s + t.count, 0),
        paid: summary.fees.tabs[2] ? summary.fees.tabs[2].count : 0,
        paidCount: summary.fees.tabs[2] ? summary.fees.tabs[2].count : 0,
        unpaidCount: (summary.fees.tabs[0] ? summary.fees.tabs[0].count : 0) + (summary.fees.tabs[1] ? summary.fees.tabs[1].count : 0),
        rate: summary.checkin.total > 0 ? Math.round((summary.fees.tabs[2] ? summary.fees.tabs[2].count : 0) / summary.checkin.total * 100) : 0
      },
      aids: {
        total: summary.aids.tabs.reduce((s, t) => s + t.count, 0),
        approved: summary.aids.tabs[2] ? summary.aids.tabs[2].count : 0,
        pending: (summary.aids.tabs[0] ? summary.aids.tabs[0].count : 0) + (summary.aids.tabs[1] ? summary.aids.tabs[1].count : 0),
        rejected: summary.aids.tabs[3] ? summary.aids.tabs[3].count : 0
      },
      loans: {
        total: summary.loans.tabs.reduce((s, t) => s + t.count, 0),
        approved: summary.loans.tabs[2] ? summary.loans.tabs[2].count : 0,
        pending: (summary.loans.tabs[0] ? summary.loans.tabs[0].count : 0) + (summary.loans.tabs[1] ? summary.loans.tabs[1].count : 0),
        rejected: summary.loans.tabs[3] ? summary.loans.tabs[3].count : 0
      },
      dorm: {
        total: summary.checkin.total || 0,
        changes: summary.roomChanges ? summary.roomChanges.tabs[0].count : 0,
        nonDorm: summary.roomChanges ? (summary.roomChanges.tabs[1] ? summary.roomChanges.tabs[1].count : 0) : 0
      }
    }
  },
  methods: {
    fmtAmount(v) {
      return Number(v || 0).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--N50);
}

.body {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  > view + view { margin-top: 20rpx; }
}

.scope-tag {
  display: flex;
  justify-content: center;
  padding: 4rpx 0;
}

.scope-tag text {
  font-size: var(--fs-12);
  color: var(--brand);
  background: var(--brand-t);
  padding: 8rpx 24rpx;
  border-radius: var(--r-full);
  font-weight: 600;
}

.card {
  background: var(--white);
  border-radius: var(--r-14);
  padding: 28rpx;
  box-shadow: var(--card-shadow);
  > view + view { margin-top: 20rpx; }
}

.card-title {
  font-size: var(--fs-15);
  font-weight: 700;
  color: var(--N900);
  display: block;
}

.stats-row {
  display: flex;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 8rpx;
  border-right: 1px solid var(--N50);
}
.stat-item:last-child { border-right: none; }

.st-num {
  font-size: var(--fs-22);
  font-weight: 700;
  color: var(--N900);
  line-height: 1.2;
  display: block;
}
.st-num.ok { color: var(--ok); }
.st-num.wa { color: var(--wa); }
.st-num.er { color: var(--er); }
.st-num.brand { color: var(--brand); }

.st-lbl {
  font-size: var(--fs-10);
  color: var(--N400);
  margin-top: 6rpx;
  display: block;
}
</style>
