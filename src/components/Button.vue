<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary'; as?: string }>(), {
  variant: 'primary',
  as: 'button',
})
</script>

<template>
  <component :is="as" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold transition active:scale-[0.98] shadow-soft whitespace-nowrap"
    :class="{
      'bg-brand-primary text-white': variant === 'primary',
      'bg-brand-secondary text-white': variant === 'secondary',
    }">
    <slot />
  </component>
</template>
