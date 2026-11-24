import { Capacitor } from "@capacitor/core";
import { LiveUpdate } from "@capawesome/capacitor-live-update";

const MANIFEST_URL = "https://ujjval-samiti.web.app/latest.json";

export async function startLiveUpdates() {
  if (Capacitor.getPlatform() !== "android") return;

  try {
    // पहले मौजूदा ऐप को सुरक्षित रूप से Ready घोषित करें
    await LiveUpdate.ready();

    // नया अपडेट उपलब्ध है या नहीं, जाँचें
    const response = await fetch(
      `${MANIFEST_URL}?t=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response.ok) return;

    const update = await response.json();

    if (
      typeof update.bundleId !== "string" ||
      !/^[a-zA-Z0-9._-]{1,80}$/.test(update.bundleId) ||
      typeof update.url !== "string" ||
      !update.url.startsWith("https://ujjval-samiti.web.app/") ||
      typeof update.checksum !== "string" ||
      !/^[a-fA-F0-9]{64}$/.test(update.checksum)
    ) {
      console.error("Live Update manifest गलत है");
      return;
    }

    const current = await LiveUpdate.getCurrentBundle();

    if (current.bundleId === update.bundleId) {
      console.log("ऐप पहले से नवीनतम संस्करण पर है");
      return;
    }

    // ZIP डाउनलोड और SHA-256 जाँच
    await LiveUpdate.downloadBundle({
      artifactType: "zip",
      bundleId: update.bundleId,
      url: update.url,
      checksum: update.checksum
    });

    // अगली बार के लिए अपडेट सेट करें
    await LiveUpdate.setNextBundle({
      bundleId: update.bundleId
    });

    // नया संस्करण लागू करें
    await LiveUpdate.reload();

  } catch (error) {
    console.error("Live Update error:", error);
  }
}
