import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import { setPageTitle } from "@/composables/title";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/HomeView.vue"),
      meta: { title: "Home" },
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/auth/LoginView.vue"),
      meta: { requiresGuest: true, title: "Login" },
    },
    {
      path: "/register",
      name: "Register",
      component: () => import("@/views/auth/RegisterView.vue"),
      meta: { requiresGuest: true, title: "Register" },
    },
    {
      path: "/onboarding",
      name: "Onboarding",
      component: () => import("@/views/OnboardingView.vue"),
      meta: { requiresAuth: true, title: "Onboarding" },
    },
    {
      path: "/memecoins",
      name: "Memecoins",
      component: () => import("@/views/MarketView.vue"),
      meta: { title: "Memecoins Market" },
    },
    {
      path: "/memecoin/:symbol",
      name: "Memecoin Details",
      component: () => import("@/views/MemecoinDetailsView.vue"),
      meta: { title: "Memecoin Details" },
    },
    {
      path: "/leaderboard",
      name: "Leaderboard",
      component: () => import("@/views/LeaderboardView.vue"),
      meta: { title: "Leaderboard" },
    },
    {
      path: "/create-memecoin",
      name: "Create Memecoin",
      component: () => import("@/views/CreateMemecoinView.vue"),
      meta: { requiresAuth: true, title: "Create Memecoin" },
    },
    {
      path: "/user",
      name: "User",
      component: () => import("@/views/UserProfileView.vue"),
      meta: { requiresAuth: true, title: "My Profile" },
    },
    {
      path: "/user/:username",
      name: "User Profile",
      component: () => import("@/views/UserProfileView.vue"),
      meta: { title: "User Profile" },
    },
    {
      path: "/user/edit",
      name: "User Edit",
      component: () => import("@/views/UserProfileEditView.vue"),
      meta: { requiresAuth: true, title: "Edit Profile" },
    },
    {
      path: "/wallet",
      name: "Wallet",
      component: () => import("@/views/WalletView.vue"),
      meta: { requiresAuth: true, title: "My Wallet" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "Not Found",
      component: () => import("@/views/NotFoundView.vue"),
      meta: { title: "Page Not Found" },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // Handle unauthenticated users trying to access protected routes
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  // Handle authenticated users trying to access guest-only routes
  if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next({ name: "home" });
    return;
  }

  if (to.name === "user" && userStore.currentUser) {
    next({ name: "user-profile", params: { username: userStore.currentUser.username } });
    return;
  }

  // Set page title based on route meta
  if (to.meta.title) {
    setPageTitle(to.meta.title as string);
  } else {
    setPageTitle();
  }

  // Allow navigation to proceed
  next();
});

export default router;
