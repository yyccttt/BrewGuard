<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';

import DotField from '@/content/Backgrounds/DotField/DotField.vue';
import Aurora from '@/content/Backgrounds/Aurora/Aurora.vue';
import DecryptedText from '@/content/TextAnimations/DecryptedText/DecryptedText.vue';
import GradientText from '@/content/TextAnimations/GradientText/GradientText.vue';
import HeroBand from './HeroBand.vue';

import { preloadSounds } from '@/utils/audio';
import { hexToHsv, hsvToHex, parseHexRgb } from '@/utils/color';

import './Hero.css';

export type PropDef = {
  name: string;
  type: 'color' | 'number' | 'boolean';
  default: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
};

export type SnippetDef = {
  label: string;
  component: string;
  props: PropDef[];
};

const SNIPPET_DEFS: SnippetDef[] = [
  {
    label: 'ColorBends',
    component: 'ColorBends',
    props: [
      { name: 'color', type: 'color', default: '#00ffa9' },
      { name: 'speed', type: 'number', default: 0.2, min: 0.1, max: 1, step: 0.1 },
      { name: 'frequency', type: 'number', default: 1, min: 1, max: 3, step: 0.1 },
      { name: 'noise', type: 'number', default: 0.15, min: 0, max: 0.9, step: 0.01 },
      { name: 'bandWidth', type: 'number', default: 0.14, min: 0.1, max: 1, step: 0.01 },
      { name: 'rotation', type: 'number', default: 90, min: 0, max: 360, step: 1 },
      { name: 'fadeTop', type: 'number', default: 0.75, min: 0.4, max: 1, step: 0.05 },
      { name: 'iterations', type: 'number', default: 1, min: 1, max: 2, step: 1 },
      { name: 'intensity', type: 'number', default: 1.25, min: 0.1, max: 2, step: 0.1 }
    ]
  },
  {
    label: 'DotField',
    component: 'DotField',
    props: [
      { name: 'dotRadius', type: 'number', default: 1.5, min: 1, max: 3, step: 0.1 },
      { name: 'dotSpacing', type: 'number', default: 14, min: 10, max: 40, step: 1 },
      { name: 'cursorRadius', type: 'number', default: 500, min: 50, max: 1000, step: 10 },
      { name: 'cursorForce', type: 'number', default: 0.1, min: 0, max: 1, step: 0.01 },
      { name: 'bulgeOnly', type: 'boolean', default: true },
      { name: 'bulgeStrength', type: 'number', default: 67, min: 1, max: 200, step: 1 },
      { name: 'glowRadius', type: 'number', default: 160, min: 50, max: 500, step: 10 },
      { name: 'sparkle', type: 'boolean', default: false },
      { name: 'waveAmplitude', type: 'number', default: 0, min: 0, max: 20, step: 1 }
    ]
  }
];

function makeDefaults(): Record<string, string | number | boolean>[] {
  return SNIPPET_DEFS.map(def => Object.fromEntries(def.props.map(p => [p.name, p.default])));
}

const activeSnippet = ref(0);
const dropdownOpen = ref(false);

const propValues = ref<Record<string, string | number | boolean>[]>(makeDefaults());

const dropdownEl = ref<HTMLDivElement | null>(null);

function handlePropChange(name: string, value: string | number | boolean) {
  propValues.value[activeSnippet.value] = {
    ...propValues.value[activeSnippet.value],
    [name]: value
  };
}

function resetProps() {
  propValues.value = makeDefaults();
}

const hasChanges = computed(() => {
  const def = SNIPPET_DEFS[activeSnippet.value];
  const vals = propValues.value[activeSnippet.value];

  return def.props.some(p => vals[p.name] !== p.default);
});

const onClickOutside = (e: PointerEvent) => {
  if (dropdownEl.value && !dropdownEl.value.contains(e.target as Node)) {
    dropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('pointerdown', onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onClickOutside);
});

const accentColor = computed(() => propValues.value[0].color as string);

const accentDerived = computed(() => {
  const [ar, ag, ab] = parseHexRgb(accentColor.value);

  const lum = (0.2126 * ar + 0.7152 * ag + 0.0722 * ab) / 255;

  return {
    accentFg: lum > 0.5 ? '#000' : '#fff',

    dotGradientFrom: `rgba(${ar}, ${ag}, ${ab}, 0.35)`,

    dotGradientTo: `rgba(${Math.min(ar + 12, 255)}, ${Math.min(ag + 66, 255)}, ${Math.min(ab + 16, 255)}, 0.25)`
  };
});

watchEffect(onCleanup => {
  const hsv = hexToHsv(accentColor.value);

  const dark = hsvToHex(hsv.h, Math.min(hsv.s + 0.1, 1), Math.max(hsv.v * 0.7, 0));

  const light = hsvToHex((hsv.h + 30) % 360, Math.max(hsv.s * 0.8, 0), Math.min(hsv.v * 1.15, 1));

  const [r, g, b] = parseHexRgb(accentColor.value);

  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  const root = document.documentElement;

  root.style.setProperty('--pro-dark', dark);
  root.style.setProperty('--pro-base', accentColor.value);
  root.style.setProperty('--pro-light', light);
  root.style.setProperty('--pro-glow', `${r}, ${g}, ${b}`);
  root.style.setProperty('--pro-fg', lum > 0.5 ? '#000' : '#fff');

  onCleanup(() => {
    root.style.removeProperty('--pro-dark');
    root.style.removeProperty('--pro-base');
    root.style.removeProperty('--pro-light');
    root.style.removeProperty('--pro-glow');
    root.style.removeProperty('--pro-fg');
  });
});

const bandProps = computed(() => propValues.value[0] as Record<string, number | string>);

const dotProps = computed(() => propValues.value[1] as Record<string, number | boolean>);
</script>

<template>
  <section class="ln-hero">
    <div class="ln-hero-dots" aria-hidden="true">
      <DotField
        :dot-radius="dotProps.dotRadius as number"
        :dot-spacing="dotProps.dotSpacing as number"
        :cursor-radius="dotProps.cursorRadius as number"
        :cursor-force="dotProps.cursorForce as number"
        :bulge-only="dotProps.bulgeOnly as boolean"
        :bulge-strength="dotProps.bulgeStrength as number"
        :glow-radius="dotProps.glowRadius as number"
        :sparkle="dotProps.sparkle as boolean"
        :wave-amplitude="dotProps.waveAmplitude as number"
        :gradient-from="accentDerived.dotGradientFrom"
        :gradient-to="accentDerived.dotGradientTo"
        glow-color="#14110E"
      />
    </div>
    <div class="ln-hero-aurora" aria-hidden="true">
      <Aurora :colorStops="['#0b0b0b', '#1a3d2e', '#0b0b0b']" :amplitude="0.8" :blend="0.4" :speed="0.6" />
    </div>

    <HeroBand
      class="ln-hero-band"
      :color="bandProps.color as string"
      :speed="bandProps.speed as number"
      :frequency="bandProps.frequency as number"
      :noise="bandProps.noise as number"
      :band-width="bandProps.bandWidth as number"
      :rotation="bandProps.rotation as number"
      :fade-top="bandProps.fadeTop as number"
      :iterations="bandProps.iterations as number"
      :intensity="bandProps.intensity as number"
      :scale="1"
      :warp-strength="1"
      :y-offset="0.3"
      :mouse-influence="0.3"
    />

    <svg class="ln-hero-bottom-fade" preserveAspectRatio="none" viewBox="0 0 1 1">
      <defs>
        <linearGradient id="hero-bottom-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#14110E" stop-opacity="0" />
          <stop offset="50%" stop-color="#14110E" stop-opacity="0" />
          <stop offset="60%" stop-color="#14110E" stop-opacity="0.03" />
          <stop offset="68%" stop-color="#14110E" stop-opacity="0.1" />
          <stop offset="74%" stop-color="#14110E" stop-opacity="0.22" />
          <stop offset="80%" stop-color="#14110E" stop-opacity="0.38" />
          <stop offset="85%" stop-color="#14110E" stop-opacity="0.55" />
          <stop offset="90%" stop-color="#14110E" stop-opacity="0.72" />
          <stop offset="94%" stop-color="#14110E" stop-opacity="0.87" />
          <stop offset="97%" stop-color="#14110E" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#14110E" stop-opacity="1" />
        </linearGradient>
      </defs>

      <rect width="1" height="1" fill="url(#hero-bottom-fade)" />
    </svg>

    <div class="ln-hero-content">
      <div class="ln-hero-left">
        <span class="ln-hero-tag">
          <span
            class="ln-hero-tag-new"
            :style="{
              background: accentColor,
              color: accentDerived.accentFg
            }"
          >
            {{ $t('hero.badge') }}
          </span>

          {{ $t('hero.platform') }}

          <svg width="10" height="10" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
            <path
              d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
            />
          </svg>
        </span>

        <h1 class="ln-hero-headline">
          <span class="ln-hero-headline-line">
            <DecryptedText :text="$t('hero.titleLine1')" animateOn="view" :speed="60" :maxIterations="8" />
          </span>

          <br />

          <span class="ln-hero-headline-line">
            <DecryptedText :text="$t('hero.titleLine2')" animateOn="view" :speed="50" :maxIterations="6" useOriginalCharsOnly />
          </span>
        </h1>

        <p class="ln-hero-description">
          <GradientText :colors="['#7cff67', '#3da86a', '#7cff67']" :animationSpeed="6" direction="horizontal">
            {{ $t('hero.subtitle') }}
          </GradientText>
        </p>

        <div class="ln-hero-buttons">
          <a
            href="#features"
            class="ln-hero-btn ln-hero-btn-primary"
            :style="{
              background: accentColor,
              borderColor: accentColor,
              color: accentDerived.accentFg
            }"
          >
            {{ $t('hero.cta') }}
          </a>
        </div>
      </div>

    </div>
  </section>
</template>
