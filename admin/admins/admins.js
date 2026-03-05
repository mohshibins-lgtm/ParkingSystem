document.addEventListener('DOMContentLoaded', () => {
  const currentNameSpan = document.getElementById('currentName');
  const currentPasswordSpan = document.getElementById('currentPassword');
  const changeNameForm = document.getElementById('changeNameForm');
  const changePasswordForm = document.getElementById('changePasswordForm');
  const message = document.getElementById('message');

  // Fetch current admin info
  async function fetchAdminInfo() {
    try {
      const res = await fetch('/api/admin');
      if (!res.ok) throw new Error('Failed to fetch admin info');
      const data = await res.json();
      currentNameSpan.textContent = data.name || 'Unknown';
    } catch (err) {
      currentNameSpan.textContent = 'Error loading';
      console.error(err);
    }
  }

  // Update Admin Name
  changeNameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = document.getElementById('newName').value.trim();
    if (!newName) {
      message.style.color = 'red';
      message.textContent = 'Name cannot be empty.';
      return;
    }
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      const result = await res.json();
      if (res.ok) {
        message.style.color = 'green';
        message.textContent = 'Admin name updated successfully';
        currentNameSpan.textContent = newName;
        changeNameForm.reset();
      } else {
        message.style.color = 'red';
        message.textContent = result.message || 'Update failed';
      }
    } catch (err) {
      message.style.color = 'red';
      message.textContent = 'Error updating name';
      console.error(err);
    }
  });

  // Update Admin Password
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword) {
      message.style.color = 'red';
      message.textContent = 'Password cannot be empty.';
      return;
    }
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const result = await res.json();
      if (res.ok) {
        message.style.color = 'green';
        message.textContent = 'Password updated successfully';
        changePasswordForm.reset();
      } else {
        message.style.color = 'red';
        message.textContent = result.message || 'Update failed';
      }
    } catch (err) {
      message.style.color = 'red';
      message.textContent = 'Error updating password';
      console.error(err);
    }
  });

  fetchAdminInfo();
});