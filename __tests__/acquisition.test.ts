import { describe, expect, it } from "vitest";
import { parseAcquisition } from "@/lib/acquisition";

describe("parseAcquisition", () => {
  it("lit les utm du lien en bio TikTok", () => {
    expect(
      parseAcquisition("?utm_source=TikTok&utm_medium=bio", "", "www.bluminoo.com"),
    ).toEqual({ utm_source: "tiktok", utm_medium: "bio" });
  });

  it("garde le domaine référent externe, sans www", () => {
    expect(
      parseAcquisition("", "https://www.tiktok.com/@bluminoo", "www.bluminoo.com"),
    ).toEqual({ referrer: "tiktok.com" });
  });

  it("ignore une navigation interne et une arrivée directe", () => {
    expect(
      parseAcquisition("", "https://bluminoo.com/pricing", "www.bluminoo.com"),
    ).toBeNull();
    expect(parseAcquisition("", "", "www.bluminoo.com")).toBeNull();
  });

  it("tronque une valeur trop longue", () => {
    const long = "a".repeat(500);
    expect(
      parseAcquisition(`?utm_campaign=${long}`, "", "bluminoo.com")?.utm_campaign,
    ).toHaveLength(100);
  });
});
