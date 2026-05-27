<template>
  <view class="page">
    <SNavBar title="消息中心" :showBack="true">
      <template #right>
        <text class="nav-action" @click="onMarkAllRead">全部已读</text>
        <text class="nav-action danger" @click="onClearAll">清空</text>
      </template>
    </SNavBar>
    <scroll-view scroll-y class="sbody">
      <view class="sc">
        <!-- Toolbar -->
        <view class="toolbar">
          <text class="toolbar-unread">未读 {{ unreadCount }}</text>
        </view>

        <!-- Message Cards -->
        <view
          class="card"
          :class="{ unread: !msg.read, read: msg.read, swiped: swipedId === msg.id }"
          v-for="msg in messages"
          :key="msg.id"
          @touchstart="onTouchStart($event, msg.id)"
          @touchend="onTouchEnd($event, msg.id)"
          @click="onCardClick(msg)"
        >
          <view class="delete-action" @click.stop="onDelete(msg.id)">删除</view>
          <view class="card-bd">
            <view class="msg-head">
              <view class="msg-left">
                <view class="msg-dot" v-if="!msg.read" />
                <text class="msg-type" :style="{ color: msg.color }">{{ msg.icon }} {{ msg.type }}</text>
              </view>
              <view class="msg-right">
                <text class="msg-time">{{ msg.time }}</text>
                <view class="msg-close" @click.stop="onDelete(msg.id)">
                  <text class="close-icon">✕</text>
                </view>
              </view>
            </view>
            <text class="msg-body">{{ msg.content }}</text>
          </view>
        </view>

        <SEmpty v-if="messages.length === 0" text="暂无消息通知" />
      </view>
    </scroll-view>

    <!-- Delete Confirmation Modal -->
    <view v-if="showDeleteConfirm" class="ovl on" @click="showDeleteConfirm = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">删除消息</text>
        <view class="sbody2">
          <text class="smsg">确认删除该条消息通知？删除后不可恢复。</text>
          <view class="brow">
            <view class="btn-e" @click="showDeleteConfirm = false">
              <text>取消</text>
            </view>
            <view class="btn-p" @click="confirmDelete">
              <text>确认删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Clear All Confirmation Modal -->
    <view v-if="showClearConfirm" class="ovl on" @click="showClearConfirm = false">
      <view class="sheet" @click.stop>
        <view class="shandle" />
        <text class="stitle">清空通知</text>
        <view class="sbody2">
          <text class="smsg">确认清空所有消息通知？清空后不可恢复。</text>
          <view class="brow">
            <view class="btn-e" @click="showClearConfirm = false">
              <text>取消</text>
            </view>
            <view class="btn-p" @click="confirmClearAll">
              <text>确认清空</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <SBottomSheet v-model="showDetail" title="消息详情">
      <view v-if="currentMessage" class="detail-body">
        <view class="detail-title-row">
          <text class="detail-title">{{ currentMessage.type }}</text>
          <text class="detail-time">{{ currentMessage.time }}</text>
        </view>
        <text class="detail-content">{{ currentMessage.content }}</text>
      </view>
      <template #footer>
        <view class="detail-close" @click="showDetail = false">关闭</view>
      </template>
    </SBottomSheet>
  </view>
</template>

<script>
import SNavBar from './SNavBar.vue'
import SEmpty from './SEmpty.vue'
import SBottomSheet from './SBottomSheet.vue'
import {
  getMessages,
  markMessageRead,
  markAllMessagesRead,
  deleteMessage,
  clearAllMessages
} from '@/utils/businessState.js'
import { messageApi } from '@/common/api/message.js'

export default {
  name: 'SMessageCenter',
  components: { SNavBar, SEmpty, SBottomSheet },
  props: {
    role: { type: String, required: true }
  },
  data() {
    return {
      messages: [],
      touchStartX: 0,
      swipedId: '',
      showDeleteConfirm: false,
      showClearConfirm: false,
      pendingDeleteId: '',
      showDetail: false,
      currentMessage: null
    }
  },
  computed: {
    unreadCount() {
      return this.messages.filter(m => !m.read).length
    }
  },
  async onShow() {
    await this.refresh()
  },
  methods: {
    async refresh() {
      const res = await messageApi.getMessageList({ role: this.role, pageSize: 100 })
      this.messages = res?.data?.code === 0 ? (res.data.data.list || res.data.data.items || []) : getMessages(this.role)
    },
    async onCardClick(msg) {
      this.currentMessage = msg
      this.showDetail = true
      if (!msg.read) {
        await messageApi.markRead(msg.messageId || msg.id)
        markMessageRead(this.role, msg.messageId || msg.id)
        await this.refresh()
        this.currentMessage = this.messages.find(item => (item.messageId || item.id) === (msg.messageId || msg.id)) || { ...msg, read: true }
        if (typeof uni.$emit === 'function') uni.$emit('message-count-change', { role: this.role, count: this.unreadCount })
      }
    },
    async onMarkAllRead() {
      await messageApi.markAllRead({ role: this.role })
      markAllMessagesRead(this.role)
      await this.refresh()
      if (typeof uni.$emit === 'function') uni.$emit('message-count-change', { role: this.role, count: this.unreadCount })
      uni.showToast({ title: '已全部标为已读', icon: 'success' })
    },
    onDelete(id) {
      this.pendingDeleteId = id
      this.showDeleteConfirm = true
    },
    async confirmDelete() {
      this.showDeleteConfirm = false
      if (this.pendingDeleteId) {
        await messageApi.deleteMessage(this.pendingDeleteId)
        deleteMessage(this.role, this.pendingDeleteId)
        await this.refresh()
        if (this.currentMessage && (this.currentMessage.id === this.pendingDeleteId || this.currentMessage.messageId === this.pendingDeleteId)) {
          this.currentMessage = null
          this.showDetail = false
        }
        this.pendingDeleteId = ''
      }
      if (typeof uni.$emit === 'function') uni.$emit('message-count-change', { role: this.role, count: this.unreadCount })
      uni.showToast({ title: '已删除', icon: 'none' })
    },
    onClearAll() {
      if (this.messages.length === 0) return
      this.showClearConfirm = true
    },
    async confirmClearAll() {
      this.showClearConfirm = false
      await messageApi.clearMessages({ role: this.role })
      clearAllMessages(this.role)
      await this.refresh()
      this.currentMessage = null
      this.showDetail = false
      if (typeof uni.$emit === 'function') uni.$emit('message-count-change', { role: this.role, count: this.unreadCount })
      uni.showToast({ title: '已清空', icon: 'none' })
    },
    onTouchStart(e, id) {
      this.touchStartX = e.changedTouches?.[0]?.clientX || 0
      if (this.swipedId && this.swipedId !== id) this.swipedId = ''
    },
    onTouchEnd(e, id) {
      const endX = e.changedTouches?.[0]?.clientX || 0
      const diff = endX - this.touchStartX
      if (diff < -36) this.swipedId = id
      if (diff > 36) this.swipedId = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--N50); display: flex; flex-direction: column; }
.sbody { height: 0; flex: 1; }
.sc { padding: 28rpx; display: flex; flex-direction: column; }
.sc > * + * { margin-top: 20rpx; }

/* ── NavBar actions ── */
.nav-action { font-size: var(--fs-13); color: var(--N700); margin-left: 20rpx; }
.nav-action.danger { color: var(--er); }

/* ── Toolbar ── */
.toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0 4rpx 0; }
.toolbar-unread { font-size: var(--fs-12); color: var(--N500); }

/* ── Card ── */
.card {
  background: var(--white); border-radius: var(--r-14);
  box-shadow: var(--card-shadow); overflow: hidden;
  transition: border-color .3s, opacity .3s; position: relative;
}
.card.unread { border-left: 6rpx solid var(--brand); }
.card.read { opacity: .72; }
.card.swiped .card-bd { transform: translateX(-132rpx); }

.delete-action {
  position: absolute; top: 0; right: 0; bottom: 0; width: 132rpx;
  background: var(--er); color: #fff; display: flex;
  align-items: center; justify-content: center;
  font-size: var(--fs-13); font-weight: 600;
}

.card-bd {
  padding: 24rpx 28rpx; background: var(--white);
  position: relative; z-index: 1;
  transition: transform .22s cubic-bezier(.32,.72,0,1);
}

/* ── Message Head ── */
.msg-head { display: flex; justify-content: space-between; align-items: center; }
.msg-head { margin-bottom: 12rpx; }
.msg-left { display: flex; align-items: center; }
.msg-dot {
  width: 12rpx; height: 12rpx; border-radius: 50%;
  background: var(--er); margin-right: 12rpx; flex-shrink: 0;
  transition: opacity .3s;
}
.msg-type { font-size: var(--fs-12); font-weight: 600; }
.msg-right { display: flex; align-items: center; }
.msg-right > * + * { margin-left: 16rpx; }
.msg-time { font-size: var(--fs-11); color: var(--N400); }
.msg-close {
  width: 36rpx; height: 36rpx; border-radius: 50%;
  background: var(--N200); display: flex;
  align-items: center; justify-content: center;
}
.msg-close:active { background: var(--N400); }
.close-icon { font-size: var(--fs-10); color: var(--N400); }

/* ── Message Body ── */
.msg-body { font-size: var(--fs-13); color: var(--N700); line-height: 1.5; display: block; }

.detail-body { display: flex; flex-direction: column; }
.detail-body > * + * { margin-top: 24rpx; }
.detail-title-row { display: flex; align-items: center; justify-content: space-between; }
.detail-title { font-size: var(--fs-15); color: var(--N900); font-weight: 600; }
.detail-time { font-size: var(--fs-11); color: var(--N400); }
.detail-content { display: block; font-size: var(--fs-13); color: var(--N700); line-height: 1.6; }
.detail-close {
  height: 88rpx; background: var(--brand); color: var(--white);
  border-radius: var(--r-8); display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-14); font-weight: 600;
}

/* ── BottomSheet (shared) ── */
.ovl {
  position: fixed; top: 0; right: 0; bottom: 0; left: 0;
  background: rgba(0,0,0,0); z-index: 300; visibility: hidden;
  transition: background .25s, visibility .25s;
}
.ovl.on { background: rgba(0,0,0,.45); visibility: visible; }
.sheet {
  position: absolute; bottom: 0; left: 0; right: 0; background: #fff;
  border-radius: 40rpx 40rpx 0 0; padding: 0 0 72rpx;
  transform: translateY(100%);
  transition: transform .28s cubic-bezier(.32,.72,0,1);
}
.ovl.on .sheet { transform: translateY(0); }
.shandle {
  width: 72rpx; height: 8rpx; background: var(--N200);
  border-radius: 4rpx; margin: 20rpx auto 0;
}
.stitle {
  font-size: var(--fs-16); font-weight: 600; color: var(--N900);
  padding: 28rpx 32rpx 24rpx; border-bottom: 1px solid var(--N50);
  display: block; text-align: center;
}
.sbody2 { padding: 32rpx; display: flex; flex-direction: column; }
.sbody2 > * + * { margin-top: 24rpx; }
.smsg { font-size: var(--fs-13); color: var(--N500); text-align: center; line-height: 1.6; display: block; }
.brow { display: flex; }
.brow > * + * { margin-left: 16rpx; }
.btn-e {
  flex: 1; height: var(--btn-h); border-radius: var(--btn-radius);
  background: var(--er-bg); color: var(--er);
  font-size: var(--fs-15); font-weight: 600;
  border: 1px solid var(--er-bd);
  display: flex; align-items: center; justify-content: center;
}
.btn-e:active { background: var(--er); color: #fff; }
.btn-p {
  flex: 1; height: var(--btn-h); background: var(--brand); color: var(--white);
  border-radius: var(--btn-radius); font-size: var(--fs-14); font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.btn-p:active { background: var(--brand-d); }
</style>
