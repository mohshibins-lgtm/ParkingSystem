document.addEventListener('DOMContentLoaded', () => {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const filterBtn = document.getElementById('filterBtn');
  const clearBtn = document.getElementById('clearBtn');
  const filterStatus = document.getElementById('filterStatus');
  const historyBody = document.getElementById('historyBody');

  async function fetchHistory(startDate, endDate) {
    historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';
    let url = '/api/history';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if ([...params].length) url += `?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch history data');
      const data = await response.json();

      filterStatus.textContent =
        (startDate || endDate)
          ? `Filtered by date${startDate ? ' from ' + startDate : ''}${endDate ? ' to ' + endDate : ''}`: "";
          

      if (data.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No records found.</td></tr>';
        return;
      }

      historyBody.innerHTML = '';
      data.forEach(record => {
        const tr = document.createElement('tr');
        const entryDate = new Date(record.entryTime);
        const formatDate = d => d.toLocaleDateString();

        tr.innerHTML = `
          <td>${record.slotName}</td>
          <td>${record.vehicleNumber}</td>
          <td>${formatDate(entryDate)}</td>
          <td>${record.totalTimeSpent}</td>
        `;
        historyBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error loading history:', error);
      historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: red;">Error loading data.</td></tr>';
    }
  }

  filterBtn.addEventListener('click', () => {
    fetchHistory(startDateInput.value, endDateInput.value);
  });

  clearBtn.addEventListener('click', () => {
    startDateInput.value = '';
    endDateInput.value = '';
    fetchHistory();
  });

  fetchHistory();
});