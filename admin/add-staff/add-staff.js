document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addStaffForm');
  const message = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const staffData = {
      name: form.name.value.trim(),
      age: parseInt(form.age.value, 10),
      place: form.place.value.trim(),
      gender: form.gender.value,
      password: form.password.value,
      joinedDate: form.joinedDate.value,
    };

    // Basic validation
    if (!staffData.name || !staffData.age || !staffData.place || !staffData.gender || !staffData.password || !staffData.joinedDate) {
      message.textContent = 'Please fill out all fields.';
      message.style.color = 'red';
      return;
    }

    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      });
      const result = await response.json();

      if (response.ok) {
        message.style.color = 'green';
        message.textContent = 'Staff successfully added! Redirecting...';
        setTimeout(() => window.location.href = 'staff.html', 2000);
      } else {
        message.style.color = 'red';
        message.textContent = result.message || 'Failed to add staff.';
      }
    } catch (error) {
      message.style.color = 'red';
      message.textContent = 'Error adding staff.';
      console.error(error);
    }
  });
});