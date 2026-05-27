<template>
  <view class="page">
    <SNavBar title="用品发放" :showBack="true" />
    <scroll-view scroll-y class="body">
      <view class="sc">
        <view class="card" v-for="(item, i) in list" :key="i">
          <view class="card-bd">
            <view class="li">
              <view class="li-ico">{{ item.avatar }}</view>
              <view class="li-info">
                <text class="li-name">{{ item.name }}</text>
                <text class="li-meta">{{ item.id }} · {{ item.items }}</text>
              </view>
              <SBadge :color="item.done ? 'ok' : 'wa'">{{ item.done ? '已发放' : '待发放' }}</SBadge>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script>
import SNavBar from '@/components/shared/SNavBar.vue'
import SBadge from '@/components/shared/SBadge.vue'
export default {
  name: 'TeacherSupply',
  components: { SNavBar, SBadge },
  data() {
    return {
      list: [
        { name: '刘晓华', id: '2026010001', items: '床上用品 · 军训服 · 教材', done: true, avatar: '刘' },
        { name: '王磊', id: '2026010015', items: '床上用品 · 军训服 · 教材', done: false, avatar: '王' },
        { name: '张欣怡', id: '2026010022', items: '床上用品 · 军训服', done: true, avatar: '张' },
        { name: '李明', id: '2026010030', items: '床上用品 · 军训服 · 教材', done: false, avatar: '李' }
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.body { height: 0; flex: 1; }
.sc { padding: 28rpx; display: flex; flex-direction: column; }
.sc > * + * { margin-top: 20rpx; }
.card { background: var(--white); border-radius: var(--r-14); box-shadow: var(--card-shadow); overflow: hidden; }
.card-bd { padding: var(--card-body-padding); }
.li { display: flex; align-items: center; }
.li > * + * { margin-left: 20rpx; }
.li-ico { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--brand-t); color: var(--brand); display: flex; align-items: center; justify-content: center; font-size: var(--fs-16); font-weight: 600; flex-shrink: 0; }
.li-info { flex: 1; min-width: 0; }
.li-name { font-size: var(--fs-14); font-weight: 600; color: var(--N900); display: block; }
.li-meta { font-size: var(--fs-11); color: var(--N500); display: block; margin-top: 4rpx; }
</style>
