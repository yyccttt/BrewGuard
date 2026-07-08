<template>
  <div class="ai-assistant">
    <!-- 触发按钮 -->
    <button
      class="ai-trigger"
      :class="{ 'is-open': isOpen }"
      :aria-label="t('ai.openChat')"
      @click="isOpen = !isOpen"
    >
      <svg v-if="!isOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a3 3 0 0 1 3 3v1h1a3 3 0 0 1 3 3v3a7 7 0 0 1-7 7H8a3 3 0 0 1-3-3v-1H4a2 2 0 0 1-2-2v-2a3 3 0 0 1 3-3h1V5a3 3 0 0 1 3-3z" />
        <circle cx="9" cy="11" r="1" fill="currentColor" />
        <circle cx="15" cy="11" r="1" fill="currentColor" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>

    <!-- 聊天窗 -->
    <Transition name="ai-window">
      <div v-if="isOpen" class="ai-window">
        <!-- 头部 -->
        <div class="ai-header">
          <div class="ai-header-info">
            <span class="ai-header-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </span>
            <div>
              <div class="ai-header-title">{{ t('ai.title') }}</div>
              <div class="ai-header-status"><span class="ai-status-dot" />Online</div>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="ai-messages" ref="messagesRef">
          <!-- 欢迎语 -->
          <div class="ai-msg ai-msg--bot">
            <div class="ai-msg-bubble">{{ t('ai.welcome') }}</div>
          </div>

          <!-- 建议问题(首次显示) -->
          <div v-if="messages.length === 0" class="ai-suggestions">
            <button v-for="(s, i) in suggestions" :key="i" class="ai-suggestion" @click="sendQuick(s)">
              {{ s }}
            </button>
          </div>

          <!-- 对话消息 -->
          <div v-for="(msg, i) in messages" :key="i" class="ai-msg" :class="`ai-msg--${msg.role}`">
            <div class="ai-msg-bubble">{{ msg.content }}</div>
          </div>

          <!-- 加载中 -->
          <div v-if="loading" class="ai-msg ai-msg--bot">
            <div class="ai-msg-bubble ai-typing">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="ai-input-area">
          <input
            v-model="input"
            class="ai-input"
            :placeholder="t('ai.placeholder')"
            :disabled="loading"
            @keyup.enter="send()"
          />
          <button class="ai-send" :disabled="!input.trim() || loading" @click="send()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { post } from '@/utils/http';
import './AiAssistant.css';

const { t, tm } = useI18n();

const isOpen = ref(false);
const input = ref('');
const loading = ref(false);
const messages = ref<Array<{ role: 'user' | 'bot'; content: string }>>([]);
const messagesRef = ref<HTMLElement | null>(null);

const suggestions = tm('ai.suggestions') as unknown as string[];

async function scrollToBottom() {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
}

async function sendQuick(text: string) {
  input.value = text;
  await send();
}

async function send() {
  const text = input.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: 'user', content: text });
  input.value = '';
  loading.value = true;
  await scrollToBottom();

  try {
    const res = await post<any>('/ai/chat', { message: text });
    const reply = res.data?.reply || t('ai.error');
    messages.value.push({ role: 'bot', content: reply });
  } catch {
    messages.value.push({ role: 'bot', content: t('ai.error') });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
}

watch(isOpen, () => {
  if (isOpen.value) {
    nextTick(scrollToBottom);
  }
});
</script>
