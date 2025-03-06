import { createTestingPinia } from "@pinia/testing";
import { createRouter, createWebHistory } from "vue-router";
import { mount } from "@vue/test-utils";
import type { Component } from "vue";
import { vi } from "vitest";

export function createTestWrapper(component: Component, options = {}) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: "/",
        component: { template: "<div>Home</div>" },
      },
      {
        path: "/login",
        component: { template: "<div>Login</div>" },
      },
      {
        path: "/register",
        component: { template: "<div>Register</div>" },
      },
      {
        path: "/user",
        component: { template: "<div>Profile</div>" },
      },
      {
        path: "/wallet",
        component: { template: "<div>Wallet</div>" },
      },
      {
        path: "/market",
        component: { template: "<div>Market</div>" },
      },
      {
        path: "/leaderboard",
        component: { template: "<div>Leaderboard</div>" },
      },
      {
        path: "/create-memecoin",
        component: { template: "<div>Create Memecoin</div>" },
      },
    ],
  });

  return mount(component, {
    global: {
      plugins: [
        router,
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            auth: {
              user: null,
              isAuthenticated: false,
            },
          },
        }),
      ],
    },
    ...options,
  });
}
