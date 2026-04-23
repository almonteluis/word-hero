import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadAnalytics,
  loadEventCounts,
  loadProfiles,
  saveProfiles,
  loadKidProgress,
  saveKidProgress,
  loadLang,
  saveLang,
  trackEvent,
} from "../utils/storage";

beforeEach(() => {
  localStorage.clear();
});

// ─── Profile storage ────────────────────────────────────────

describe("loadProfiles / saveProfiles", () => {
  it("returns null when no profiles exist", () => {
    expect(loadProfiles()).toBeNull();
  });

  it("round-trips profile data", () => {
    const profiles = [{ id: "kid-1", name: "Alice", avatar: "🦊" }];
    saveProfiles(profiles);
    expect(loadProfiles()).toEqual(profiles);
  });

  it("handles malformed JSON gracefully", () => {
    localStorage.setItem("word-hero-profiles", "{invalid");
    expect(loadProfiles()).toBeNull();
  });
});

// ─── Kid progress storage ───────────────────────────────────

describe("loadKidProgress / saveKidProgress", () => {
  it("returns null when no progress exists", () => {
    expect(loadKidProgress("kid-1")).toBeNull();
  });

  it("round-trips progress data", () => {
    const progress = { mastered: { the: Date.now() }, learning: {}, wordStats: {} };
    saveKidProgress("kid-1", progress);
    expect(loadKidProgress("kid-1")).toEqual(progress);
  });

  it("keeps progress separate per kid", () => {
    saveKidProgress("kid-1", { mastered: { the: 1 } });
    saveKidProgress("kid-2", { mastered: { and: 2 } });
    expect(loadKidProgress("kid-1").mastered).toHaveProperty("the");
    expect(loadKidProgress("kid-2").mastered).toHaveProperty("and");
  });
});

// ─── Language storage ───────────────────────────────────────

describe("loadLang / saveLang", () => {
  it("defaults to 'en' when no language is saved", () => {
    expect(loadLang("kid-1")).toBe("en");
  });

  it("round-trips language preference", () => {
    saveLang("kid-1", "es");
    expect(loadLang("kid-1")).toBe("es");
  });

  it("keeps language separate per kid", () => {
    saveLang("kid-1", "es");
    saveLang("kid-2", "en");
    expect(loadLang("kid-1")).toBe("es");
    expect(loadLang("kid-2")).toBe("en");
  });

  it("still returns default if localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(loadLang("kid-1")).toBe("en");
    vi.restoreAllMocks();
  });
});

// ─── Lightweight analytics storage ─────────────────────────

describe("loadAnalytics / trackEvent", () => {
  it("tracks counts and keeps the newest events first", () => {
    trackEvent("challenge_share_clicked", { mode: "flash" });
    trackEvent("challenge_share_clicked", { mode: "find" });
    trackEvent("challenge_link_opened", { mode: "find" });

    expect(loadEventCounts()).toEqual({
      challenge_share_clicked: 2,
      challenge_link_opened: 1,
    });
    expect(loadAnalytics().events[0].name).toBe("challenge_link_opened");
    expect(loadAnalytics().events[1].name).toBe("challenge_share_clicked");
  });

  it("recovers gracefully from malformed analytics data", () => {
    localStorage.setItem("word-hero-analytics", "{broken");
    expect(loadEventCounts()).toEqual({});

    trackEvent("challenge_share_clicked");
    expect(loadEventCounts()).toEqual({ challenge_share_clicked: 1 });
  });
});
