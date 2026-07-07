<template>
  <main>
    <LangToggle />
    <LandingLoader v-if="!loaded" :hiding="hiding" />

    <section :class="['landing-wrapper no-side-fades', revealed ? 'ln-loaded' : 'ln-loading']">
      <Hero />
      <StatsBar />
      <BrewingFeatures />
      <Marquee />
      <HowItWorks />
      <DataPreview />
      <Industries />
      <CTASection />
      <Footer />
    </section>
  </main>
</template>

<script setup lang="ts">
import Footer from '@/components/landing/Footer/Footer.vue';
import Hero from '@/components/landing/Hero/Hero.vue';
import LandingLoader from '@/components/landing/LandingLoader/LandingLoader.vue';
import BrewingFeatures from '@/components/landing/BrewingFeatures/BrewingFeatures.vue';
import Marquee from '@/components/landing/Marquee/Marquee.vue';
import StatsBar from '@/components/landing/StatsBar/StatsBar.vue';
import HowItWorks from '@/components/landing/HowItWorks/HowItWorks.vue';
import DataPreview from '@/components/landing/DataPreview/DataPreview.vue';
import Industries from '@/components/landing/Industries/Industries.vue';
import CTASection from '@/components/landing/CTASection/CTASection.vue';
import LangToggle from '@/components/common/LangToggle.vue';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const MIN_LOADER_MS = 800;

const loaded = ref(false);
const hiding = ref(false);
const revealed = ref(false);

function reveal() {
  hiding.value = true;
  revealed.value = true;
  setTimeout(() => {
    loaded.value = true;
  }, 600);
}

watch(
  loaded,
  value => {
    if (value) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    } else {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
  },
  { immediate: true }
);

onMounted(() => {
  const start = Date.now();

  const fontsReady = 'fonts' in document ? document.fonts.ready : Promise.resolve();

  fontsReady.then(() => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_LOADER_MS - elapsed);

    setTimeout(reveal, remaining);
  });
});

onUnmounted(() => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});
</script>
