document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('staffTableBody');
  try {
    const response = await fetch('/api/staff');
    const data = await response.json();
    tbody.innerHTML = '';
    data.forEach(staff => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${staff._id}</td>
        <td><a href="staff_detail.html?id=${staff._id}">${staff.name}</a></td>
        <td>${staff.age}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="3">Failed to fetch staff data</td></tr>';
  }
});
tr.innerHTML = `
  <td>${staff.staffId}</td>  <!-- display staffId -->
  <td><a href="staff_detail.html?id=${staff._id}">${staff.name}</a></td>
  <td>${staff.age}</td>
`;