async function fetchDashboardData() {
  try {

    const response = await fetch('/api/dashboard-data');
    const data = await response.json();

    // Update counters
    document.getElementById('totalSlots').textContent = data.totalSlots;
    document.getElementById('occupiedSlots').textContent = data.occupiedSlots;
    document.getElementById('freeSlots').textContent = data.freeSlots;

    // Vehicle List
    const vehicleList = document.getElementById('vehicleList');
    vehicleList.innerHTML = '';

    data.currentParked.forEach(vehicle => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${vehicle.slotName}</td>
        <td>${vehicle.vehicleNumber}</td>
        <td>${new Date(vehicle.entryTime).toLocaleString()}</td>
      `;
      vehicleList.appendChild(tr);
    });

    // Slot UI (ONLY DATABASE STATUS)
    data.allSlots.forEach(slot => {

      const slotEl = document.getElementById(slot.slotName);
      if (!slotEl) return;

      if (slot.status === 'free') {
        slotEl.innerHTML = '';
        slotEl.className = '';
      }

      else if (slot.status === 'booked') {
        slotEl.innerHTML = `BOOKED<br>${slot.vehicleNumber}`;
        slotEl.className = 'booked';
      }

      else if (slot.status === 'occupied') {
        slotEl.innerHTML = `OCCUPIED<br>${slot.vehicleNumber || ''}`;
        slotEl.className = 'occupied';
      }

      else if (slot.status === 'wrongparking') {
        slotEl.innerHTML = `${slot.slotName}<br>WRONG PARKING`;
        slotEl.className = 'wrong-park';
      }

    });

  } catch (error) {
    console.error('Dashboard error:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardData();
  setInterval(fetchDashboardData, 3000);
});