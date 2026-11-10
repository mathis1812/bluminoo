import { describe, expect, it } from "vitest";
import { cleanUtm, deviceOf, isBot, normalizePath } from "@/lib/track";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const IPAD = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
const ANDROID_TABLET = "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Safari/537.36";
const WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36";

describe("mesure des visites : chemin de page", () => {
  it("garde le chemin sans query ni ancre", () => {
    expect(normalizePath("/templates/police?utm_source=tiktok#top")).toBe("/templates/police");
  });

  it("refuse ce qui n'est pas un chemin du site", () => {
    expect(normalizePath("https://evil.example/")).toBeNull();
    expect(normalizePath("//evil.example")).toBeNull();
    expect(normalizePath(42)).toBeNull();
    expect(normalizePath("/" + "a".repeat(300))).toBeNull();
  });
});

describe("mesure des visites : appareil et robots", () => {
  it("distingue téléphone, tablette et ordinateur", () => {
    expect(deviceOf(IPHONE)).toBe("mobile");
    expect(deviceOf(IPAD)).toBe("tablet");
    expect(deviceOf(ANDROID_TABLET)).toBe("tablet");
    expect(deviceOf(WINDOWS)).toBe("desktop");
  });

  it("écarte les robots et les agents vides", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("Mozilla/5.0 HeadlessChrome/130.0")).toBe(true);
    expect(isBot("")).toBe(true);
    expect(isBot(IPHONE)).toBe(false);
  });
});

describe("mesure des visites : paramètres utm", () => {
  it("met en minuscules et tronque", () => {
    expect(cleanUtm("  TikTok ")).toBe("tiktok");
    expect(cleanUtm("x".repeat(300))).toHaveLength(100);
  });

  it("renvoie null pour une valeur absente ou vide", () => {
    expect(cleanUtm(undefined)).toBeNull();
    expect(cleanUtm("   ")).toBeNull();
    expect(cleanUtm({ a: 1 })).toBeNull();
  });
});
