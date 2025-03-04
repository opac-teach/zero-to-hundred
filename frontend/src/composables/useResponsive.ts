import { ref, onMounted, onUnmounted } from 'vue';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

export function useResponsive() {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(false);
  const currentBreakpoint = ref<Breakpoint>('sm');

  function updateBreakpoint() {
    const width = window.innerWidth;

    if (width < breakpoints.sm) {
      currentBreakpoint.value = 'sm';
      isMobile.value = true;
      isTablet.value = false;
      isDesktop.value = false;
    } else if (width < breakpoints.md) {
      currentBreakpoint.value = 'md';
      isMobile.value = false;
      isTablet.value = true;
      isDesktop.value = false;
    } else if (width < breakpoints.lg) {
      currentBreakpoint.value = 'lg';
      isMobile.value = false;
      isTablet.value = true;
      isDesktop.value = false;
    } else if (width < breakpoints.xl) {
      currentBreakpoint.value = 'xl';
      isMobile.value = false;
      isTablet.value = false;
      isDesktop.value = true;
    } else {
      currentBreakpoint.value = '2xl';
      isMobile.value = false;
      isTablet.value = false;
      isDesktop.value = true;
    }
  }

  function isBreakpoint(breakpoint: Breakpoint): boolean {
    return window.innerWidth >= breakpoints[breakpoint];
  }

  function isBreakpointOrLarger(breakpoint: Breakpoint): boolean {
    return window.innerWidth >= breakpoints[breakpoint];
  }

  function isBreakpointOrSmaller(breakpoint: Breakpoint): boolean {
    return window.innerWidth <= breakpoints[breakpoint];
  }

  onMounted(() => {
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoint);
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
    isBreakpoint,
    isBreakpointOrLarger,
    isBreakpointOrSmaller,
  };
} 