<template>
  <div style="display:none;"></div>
</template>

<script>
import { mapState } from 'vuex';

// 旧：10文字の擬似名を発行するだけ → ルートにIDがあれば使う
function shortRandomId() {
  return Math.random().toString(36).slice(2, 12);
}

// ルートから来たIDを拾う（param名はプロジェクトのrouter定義に合わせて調整）
function getRoomIdFromRoute(vm) {
  const p = vm.$route?.params || {};
  // よくあるパターン（/room/:roomId）
  return p.roomId || p.id || p.roomName || null;
}

export default {
  name: 'CardRoomName',
  computed: {
    ...mapState('settingsStore', ['roomName']),
  },
  mounted() {
    // 1) 招待リンク（URL）で来た場合：そのIDで検索のみ
    const fromRoute = getRoomIdFromRoute(this);
    if (fromRoute) {
      // 親やストアに反映（v-model系を使っているならemitしておく）
      this.$emit('input', fromRoute);
      this.$emit('update:roomName', fromRoute);

      this.$store.dispatch('settingsStore/searchRoom', fromRoute)
        .finally(() => this.$emit('next'));
      return;
    }

    // 2) すでにストアにroomNameがある場合：それを使う
    if (this.roomName) {
      this.$store.dispatch('settingsStore/searchRoom', this.roomName)
        .finally(() => this.$emit('next'));
      return;
    }

    // 3) 新規作成フローのみ：擬似名を発行して検索へ
    const pseudoName = shortRandomId();
    this.$emit('input', pseudoName);
    this.$emit('update:roomName', pseudoName);

    this.$store.dispatch('settingsStore/searchRoom', pseudoName)
      .finally(() => this.$emit('next'));
  },
};
</script>
