# Vue

> Based on Vue 3.5. Always use Composition API with `<script setup lang="ts">`.

## Preferences

- Prefer TypeScript over JavaScript
- Prefer `<script setup lang="ts">` over `<script>`
- For performance, prefer `shallowRef` over `ref` if deep reactivity is not needed
- Always use Composition API over Options API
- Discourage using Reactive Props Destructure

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Script Setup & Macros | `<script setup>`, defineProps, defineEmits, defineModel, defineExpose, defineOptions, defineSlots, generics | [script-setup-macros](references/script-setup-macros.md) |
| Reactivity & Lifecycle | ref, shallowRef, computed, watch, watchEffect, effectScope, lifecycle hooks, composables | [core-new-apis](references/core-new-apis.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| Built-in Components & Directives | Transition, Teleport, Suspense, KeepAlive, v-memo, custom directives | [advanced-patterns](references/advanced-patterns.md) |

## Quick Reference

### Component Template

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  update: [value: string]
}>()

const model = defineModel<string>()

const doubled = computed(() => (props.count ?? 0) * 2)

watch(() => props.title, (newVal) => {
  console.log('Title changed:', newVal)
})

onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div>{{ title }} - {{ doubled }}</div>
</template>
```

### Key Imports

```ts
// Reactivity
import { ref, shallowRef, computed, reactive, readonly, toRef, toRefs, toValue } from 'vue'

// Watchers
import { watch, watchEffect, watchPostEffect, onWatcherCleanup } from 'vue'

// Lifecycle
import { onMounted, onUpdated, onUnmounted, onBeforeMount, onBeforeUpdate, onBeforeUnmount } from 'vue'

// Utilities
import { nextTick, defineComponent, defineAsyncComponent } from 'vue'
```

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `nitro` | [`references/skills/nitro/SKILL.md`](references/skills/nitro/SKILL.md) | Nitro is the framework-agnostic server toolkit (powering Nuxt) for building and deploying web servers anywhere. Use when working with nitro.config, server routes/event handlers, route rules, caching, storage, tasks, websockets, or deploying to Node/Bun/Deno/Cloudflare/Vercel. |
| `nuxt` | [`references/skills/nuxt/SKILL.md`](references/skills/nuxt/SKILL.md) | Nuxt full-stack Vue framework with SSR, auto-imports, and file-based routing. Use when working with Nuxt apps, server routes, useFetch, middleware, or hybrid rendering. |
| `pinia` | [`references/skills/pinia/SKILL.md`](references/skills/pinia/SKILL.md) | Pinia official Vue state management library, type-safe and extensible. Use when defining stores, working with state/getters/actions, or implementing store patterns in Vue apps. |
| `slidev` | [`references/skills/slidev/SKILL.md`](references/skills/slidev/SKILL.md) | Create and present web-based slidedecks for developers using Slidev with Markdown, Vue components, code highlighting, animations, and interactive features. Use when building technical presentations, conference talks, code walkthroughs, teaching materials, or developer decks. |
| `vue-best-practices` | [`references/skills/vue-best-practices/SKILL.md`](references/skills/vue-best-practices/SKILL.md) | MUST be used for Vue.js tasks. Strongly recommends Composition API with `<script setup>` and TypeScript as the standard approach. Covers Vue 3, SSR, Volar, vue-tsc. Load for any Vue, .vue files, Vue Router, Pinia, or Vite with Vue work. ALWAYS use Composition API unless the project explicitly requires Options API. |
| `vue-router-best-practices` | [`references/skills/vue-router-best-practices/SKILL.md`](references/skills/vue-router-best-practices/SKILL.md) | Vue Router 4 patterns, navigation guards, route params, and route-component lifecycle interactions. |
| `vue-testing-best-practices` | [`references/skills/vue-testing-best-practices/SKILL.md`](references/skills/vue-testing-best-practices/SKILL.md) | Use for Vue.js testing. Covers Vitest, Vue Test Utils, component testing, mocking, testing patterns, and Playwright for E2E testing. |
| `vueuse-functions` | [`references/skills/vueuse-functions/SKILL.md`](references/skills/vueuse-functions/SKILL.md) | Apply VueUse composables where appropriate to build concise, maintainable Vue.js / Nuxt features. |
<!-- folded-skills:auto:end -->
