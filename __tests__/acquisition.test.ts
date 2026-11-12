import { describe, expect, it } from "vitest";
import { parseAcquisition } from "@/lib/acquisition";

const IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";
const UA = {
  instagram: `${IOS} Instagram 307.0.0.34.111 (iPhone14,5; iOS 17_0; fr_FR; fr; scale=3.00; 1170x2532; 532277333)`,
  tiktokIos: `${IOS} musical_ly_33.1.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/fr Region/FR`,
  tiktokAndroid:
    "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 trill_330003 AppName/musical_ly BytedanceWebview/d8a21c6",
  snapchat: `${IOS} Snapchat/12.60.0.42 (like Safari/8617.1.17.10.12, panda)`,
  facebook: `${IOS} [FBAN/FBIOS;FBAV/440.0.0.33.117;FBBV/575678340;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS]`,
  safari: `${IOS} Version/17.0 Safari/604.1`,
};

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

  it("reconnaît le navigateur intégré d'Instagram, TikTok, Snapchat, Facebook", () => {
    for (const [ua, source] of [
      [UA.instagram, "instagram"],
      [UA.tiktokIos, "tiktok"],
      [UA.tiktokAndroid, "tiktok"],
      [UA.snapchat, "snapchat"],
      [UA.facebook, "facebook"],
    ]) {
      expect(parseAcquisition("", "", "bluminoo.com", ua)).toEqual({
        utm_source: source,
        utm_medium: "in-app",
      });
    }
  });

  it("laisse gagner le lien utm et ignore un navigateur ordinaire", () => {
    expect(
      parseAcquisition("?utm_source=ig&utm_medium=bio", "", "bluminoo.com", UA.tiktokIos),
    ).toEqual({ utm_source: "ig", utm_medium: "bio" });
    expect(parseAcquisition("", "", "bluminoo.com", UA.safari)).toBeNull();
  });

  it("tronque une valeur trop longue", () => {
    const long = "a".repeat(500);
    expect(
      parseAcquisition(`?utm_campaign=${long}`, "", "bluminoo.com")?.utm_campaign,
    ).toHaveLength(100);
  });
});
