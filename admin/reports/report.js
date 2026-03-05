document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('filterForm');
  const showAllBtn = document.getElementById('showAllBtn');
  const message = document.getElementById('message');
  const tbody = document.querySelector('#reportTable tbody');

  async function fetchReport(startDate = '', endDate = '') {
    try {
      message.textContent = '';
      let url = '/api/report';
      if (startDate && endDate) {
        `url += ?start=${startDate}&end=${endDate}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch report data');

      const data = await res.json();
      renderTable(data);
    } catch (err) {
      message.textContent = 'Error loading report data.';
      console.error(err);
    }
  }

  function renderTable(data) {
    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No data available</td></tr>';
      return;
    }
    data.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${row.date}</td>
        <td>${row.totalVehicles}</td>
        <td>${row.totalAmount}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
      message.textContent = 'Please select both start and end dates.';
      return;
    }
    if (startDate > endDate) {
      message.textContent = 'Start date cannot be after end date.';
      return;
    }
    fetchReport(startDate, endDate);
  });

  showAllBtn.addEventListener('click', () => {
    // Clear filters
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    message.textContent = '';
    // Fetch full report without filters
    fetchReport();
  });

  // Load full report by default on page load (newest first)
  fetchReport();
});