document.addEventListener('DOMContentLoaded', () => {
  const settingsForm = document.getElementById('settingsForm');
  const message = document.getElementById('message');

  // Fetch existing settings on page load
  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();

      document.getElementById('perHourMoney').value = data.perHourMoney ?? '';
      document.getElementById('initialMoney').value = data.initialMoney ?? '';
      document.getElementById('initialMoneyTime').value = data.initialMoneyTime ?? '';
    } catch (err) {
      message.style.color = 'red';
      message.textContent = 'Error loading settings';
      console.error(err);
    }
  }

  // Handle form submission
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.textContent = '';

    const perHourMoney = +document.getElementById('perHourMoney').value;
    const initialMoney = +document.getElementById('initialMoney').value;
    const initialMoneyTime = +document.getElementById('initialMoneyTime').value;

    // Basic validation
    if ([perHourMoney, initialMoney, initialMoneyTime].some(v => isNaN(v) || v < 0)) {
      message.style.color = 'red';
      message.textContent = 'Please enter valid non-negative numbers for all fields.';
      return;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perHourMoney, initialMoney, initialMoneyTime }),
      });

      const result = await res.json();

      if (res.ok) {
        message.style.color = 'green';
        message.textContent = 'Settings updated successfully';
      } else {
        message.style.color = 'red';
        message.textContent = result.message || 'Failed to update settings';
      }
    } catch (err) {
      message.style.color = 'red';
      message.textContent = 'Error updating settings';
      console.error(err);
    }
  });

  loadSettings();
});