import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import uiReducer, {
  setTheme, toggleSidebar, setSidebarOpen,
  addNotification, markNotificationAsRead,
  markAllNotificationsAsRead, removeNotification,
  addToast, removeToast, clearToasts,
} from "@/src/store/uiSlice";

const makeStore = () => configureStore({ reducer: { ui: uiReducer } });

describe("uiSlice", () => {
  it("setTheme updates theme", () => {
    const store = makeStore();
    store.dispatch(setTheme("dark"));
    expect(store.getState().ui.theme).toBe("dark");
    store.dispatch(setTheme("light"));
    expect(store.getState().ui.theme).toBe("light");
  });

  it("toggleSidebar flips sidebarOpen", () => {
    const store = makeStore();
    const initial = store.getState().ui.sidebarOpen;
    store.dispatch(toggleSidebar());
    expect(store.getState().ui.sidebarOpen).toBe(!initial);
    store.dispatch(toggleSidebar());
    expect(store.getState().ui.sidebarOpen).toBe(initial);
  });

  it("setSidebarOpen sets to specific value", () => {
    const store = makeStore();
    store.dispatch(setSidebarOpen(false));
    expect(store.getState().ui.sidebarOpen).toBe(false);
    store.dispatch(setSidebarOpen(true));
    expect(store.getState().ui.sidebarOpen).toBe(true);
  });

  it("addNotification increments unread count", () => {
    const store = makeStore();
    store.dispatch(addNotification({
      id: "1", type: "info", title: "Test", message: "Hello",
      read: false, createdAt: "", updatedAt: "",
    }));
    expect(store.getState().ui.unreadNotifications).toBe(1);
    expect(store.getState().ui.notifications).toHaveLength(1);
  });

  it("markNotificationAsRead decrements unread count", () => {
    const store = makeStore();
    store.dispatch(addNotification({
      id: "1", type: "info", title: "Test", message: "Hello",
      read: false, createdAt: "", updatedAt: "",
    }));
    store.dispatch(markNotificationAsRead("1"));
    expect(store.getState().ui.unreadNotifications).toBe(0);
    expect(store.getState().ui.notifications[0].read).toBe(true);
  });

  it("markAllNotificationsAsRead clears all unread", () => {
    const store = makeStore();
    for (let i = 0; i < 3; i++) {
      store.dispatch(addNotification({
        id: String(i), type: "info", title: "N", message: "M",
        read: false, createdAt: "", updatedAt: "",
      }));
    }
    store.dispatch(markAllNotificationsAsRead());
    expect(store.getState().ui.unreadNotifications).toBe(0);
  });

  it("addToast adds with unique id", () => {
    const store = makeStore();
    store.dispatch(addToast({ type: "success", title: "Done", message: "OK" }));
    store.dispatch(addToast({ type: "error", title: "Fail", message: "Err" }));
    const toasts = store.getState().ui.toasts;
    expect(toasts).toHaveLength(2);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it("removeToast removes by id", () => {
    const store = makeStore();
    store.dispatch(addToast({ type: "info", title: "T", message: "M" }));
    const id = store.getState().ui.toasts[0].id;
    store.dispatch(removeToast(id));
    expect(store.getState().ui.toasts).toHaveLength(0);
  });

  it("clearToasts removes all toasts", () => {
    const store = makeStore();
    store.dispatch(addToast({ type: "info", title: "A", message: "1" }));
    store.dispatch(addToast({ type: "success", title: "B", message: "2" }));
    store.dispatch(clearToasts());
    expect(store.getState().ui.toasts).toHaveLength(0);
  });
});
