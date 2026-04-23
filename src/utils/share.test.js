import { describe, expect, it } from "vitest";
import {
  buildChallengeShare,
  parseChallengeFromSearch,
  stripChallengeParamsFromUrl,
} from "../utils/share";

describe("buildChallengeShare", () => {
  it("builds a challenge link with score context", () => {
    const share = buildChallengeShare({
      score: 8,
      total: 10,
      mode: "find",
      kidName: "Ava Hero",
      baseUrl: "https://wordhero.app/play?tab=home#top",
    });

    expect(share.modeLabel).toBe("Find It");
    expect(share.pct).toBe(80);
    expect(share.text).toContain("Ava just finished Word Hero!");
    expect(share.url).toBe(
      "https://wordhero.app/play?challenge=1&mode=find&score=8&total=10&src=challenge-share",
    );
  });
});

describe("parseChallengeFromSearch", () => {
  it("parses valid challenge params", () => {
    expect(
      parseChallengeFromSearch(
        "?challenge=1&mode=flash&score=24&total=30&src=challenge-share",
      ),
    ).toEqual({
      mode: "flash",
      modeLabel: "Flash Training",
      score: 24,
      total: 30,
      pct: 80,
    });
  });

  it("ignores invalid or incomplete params", () => {
    expect(parseChallengeFromSearch("?challenge=1&mode=oops")).toBeNull();
    expect(parseChallengeFromSearch("?mode=find&score=8&total=10")).toBeNull();
  });
});

describe("stripChallengeParamsFromUrl", () => {
  it("removes only share-related params", () => {
    expect(
      stripChallengeParamsFromUrl(
        "https://wordhero.app/play?challenge=1&mode=find&score=8&total=10&src=challenge-share&tab=profile#done",
      ),
    ).toBe("/play?tab=profile#done");
  });
});
