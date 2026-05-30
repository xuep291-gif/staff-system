<template>
  <view class="page">
    <SNavBar title="校外住宿审核" :showBack="true" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="(item, i) in list" :key="i" @click="goReview(item)">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.address }}</text>
              </view>
              <SBadge :color="item.badgeColor">{{ item.status }}</SBadge>
              <text class="li-arrow">›</text>
            </view>
          </view>
        </view>
        <view v-if="list.length === 0" style="padding: 48rpx 0; text-align: center;">
          <text style="color: var(--N400); font-size: var(--fs-13);">暂无校外住宿申请</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SBadge from '@/components/shared/SBadge.vue'

const STORAGE_KEY = 'teacher_nondorm_list'
const DEFAULT_LIST = [
  { uid: 'tnd-1', name: '赵刚', id: '2026010008', address: '校园路12号', status: '待审核', badgeColor: 'wa', avatar: '赵' },
  { uid: 'tnd-2', name: '孙丽', id: '2026010019', address: '学府花园3栋', status: '待审核', badgeColor: 'wa', avatar: '孙' }
]

function loadList() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  const defaultList = JSON.parse(JSON.stringify(DEFAULT_LIST))
  try { uni.setStorageSync(STORAGE_KEY, JSON.stringify(defaultList)) } catch (e) { /* ignore */ }
  return defaultList
}

export default {
  name: 'TeacherNonDorm',
  components: { SNavBar, SBadge },
  data() {
    return { list: [] }
  },
  onShow() {
    this.list = loadList()
  },
  methods: {
    goReview(item) {
      uni.navigateTo({ url: '/pages/teacher/non-dorm-review/index?uid=' + item.uid })
    }
  }
}
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.sc { padding: 28rpx; display: flex; flex-direction: column; }
.sc > view + view { margin-top: 20rpx; }
.card { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden; }
.card-bd { padding: var(--card-body-padding); }
.li { display: flex; align-items: center; }
.li > view + view { margin-left: 20rpx; }
.li-ico { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--brand-t); color: var(--brand); display: flex; align-items: center; justify-content: center; font-size: var(--fs-16); font-weight: 600; flex-shrink: 0; }
.li-info { flex: 1; min-width: 0; }
.li-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.li-meta { font-size: var(--fs-11); color: var(--N500); display: block; margin-top: 4rpx; }
.li-arrow { font-size: 28rpx; color: var(--N400); flex-shrink: 0; }
</style>
