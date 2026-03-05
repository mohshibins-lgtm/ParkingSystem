
document.addEventListener('DOMContentLoaded', function () {
  // Login form handler
  const loginForm = document.getElementById("loginform");
  if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
      event.preventDefault();
      let username = document.getElementById("username").value.trim();
      let password = document.getElementById("password").value.trim();
      let entry = document.getElementById("entrypage").checked;
      let exit = document.getElementById("exitpage").checked;

      if(username === "" || password === ""){ 
          alert("Please enter username and password!");
          return;
      }

      if(entry){
          window.location.href = "/entry.html";
      } else if(exit){
          window.location.href = "/remove-slot.html";
      } else {
          alert("Select Your Station");
      }
    });
  }

  const vehicleInput = document.getElementById('vehicleNumber');
  if (vehicleInput) {
    console.log('🚗 Entry page detected - Auto + Manual ready');
    
    const autoBtn = document.getElementById('autoAllocateBtn');
    const messageDiv = document.getElementById('message');
    
    if (autoBtn) {
      autoBtn.addEventListener('click', handleAutoAllocate);
    }
    vehicleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAutoAllocate();
    });

    const toggleMode = document.getElementById('toggleMode');
    const autoMode = document.getElementById('autoMode');
    const manualMode = document.getElementById('manualMode');
    let currentMode = 'auto';

    if (toggleMode) {
      toggleMode.addEventListener('click', () => {
        if (currentMode === 'auto') {
          currentMode = 'manual';
          autoMode.style.display = 'none';
          manualMode.style.display = 'block';
          toggleMode.textContent = '🤖 Auto Mode';
          loadSlots(); 
        } else {
          currentMode = 'auto';
          manualMode.style.display = 'none';
          autoMode.style.display = 'block';
          toggleMode.textContent = '📋 Manual Mode';
        }
      });
    }

    async function handleAutoAllocate() {
      const vehicleNumber = vehicleInput.value.trim().toUpperCase();
      
      if (!vehicleNumber) {
        showMessage(messageDiv, 'Enter vehicle number', 'error');
        return;
      }

      try {
        messageDiv.textContent = 'Finding slot...';
        const response = await fetch('/api/allocate-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleNumber })
        });
        
        const data = await response.json();
        
        if (data.success) {
          showBillModal(data.slotName, vehicleNumber, data.entryTime);
          vehicleInput.value = '';
        } else {
          showMessage(messageDiv, data.message || 'No slots', 'error');
        }
      } catch (error) {
        showMessage(messageDiv, 'Server error', 'error');
        console.error('Auto allocate error:', error);
      }
    }
  }

  const manualVehicleInput = document.getElementById('manualVehicleNumber');
  if (manualVehicleInput) {
    const manualBtn = document.getElementById('manualBookBtn');
    manualBtn.addEventListener('click', handleManualBook);
    manualVehicleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleManualBook();
    });

    async function handleManualBook() {
      const vehicleNumber = manualVehicleInput.value.trim().toUpperCase();
      const message = document.getElementById('manualMessage');
      const selectedSlot = document.querySelector('.slot.selected');
      
      if (!vehicleNumber || !selectedSlot) {
        showMessage(message, 'Select slot + vehicle', 'error');
        return;
      }

      try {
        message.textContent = 'Booking...';
        const response = await fetch('/api/book-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            slotName: selectedSlot.dataset.slot, 
            vehicleNumber 
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          showBillModal(data.slotName, vehicleNumber, data.entryTime);
          manualVehicleInput.value = '';
          loadSlots(); 
          message.textContent = "Success";
        } else {
          showMessage(message, data.message, 'error');
        }
      } catch (error) {
        showMessage(message, 'Server error', 'error');
      }
    }
  }

  async function loadSlots() {
    const slotGrid = document.getElementById('slotGrid');
    if (!slotGrid) return;
    
    try {
      const response = await fetch('/api/slots');
      const slots = await response.json();
      
      slotGrid.innerHTML = '';
      slots.forEach(slot => {
        const slotEl = document.createElement('div');
        slotEl.className = `slot ${slot.status === 'free' ? 'available' : 'booked'}`;
        slotEl.textContent = slot.slotName;
        slotEl.dataset.slot = slot.slotName;
        
        if (slot.status === 'free') {
          slotEl.addEventListener('click', () => {
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
            slotEl.classList.add('selected');
            document.getElementById('manualBookBtn').disabled = false;
          });
        }
        slotGrid.appendChild(slotEl);
      });
    } catch (error) {
      console.error('Slots load error:', error);
    }
  }

  const exitForm = document.getElementById('exitForm');
  if (exitForm) {
    exitForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const slotName = document.getElementById('slotName').value.trim();
      const messageDiv = document.getElementById('message');

      if (!slotName) {
        showMessage(messageDiv, 'Enter slot name', 'error');
        return;
      }

      try {
        messageDiv.textContent = 'Checking slot...';
        const response = await fetch('/api/remove-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slotName })
        });
        
        const data = await response.json();

        if (data.success) {
          document.getElementById('slotNumber').textContent = data.slot;
          document.getElementById('vehicleNumber').textContent = data.vehicle || 'N/A';
          document.getElementById('entryTime').textContent = data.entryTime;
          document.getElementById('exitTime').textContent = new Date().toLocaleString();
          document.getElementById('totalTime').textContent = data.duration;
          document.getElementById('totalAmount').textContent = `₹${data.amount}`;
          
          document.getElementById('checkoutModal').style.display = 'block';
          showMessage(messageDiv, 'Ready for payment', 'success');
        } else {
          showMessage(messageDiv, data.error || 'Slot not found', 'error');
        }
      } catch (error) {
        showMessage(messageDiv, 'Server error', 'error');
      }
    });
  }

  const billModal = document.getElementById('billModal');
  if (billModal) {
    const printBtn = document.getElementById('printBill');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        showSuccessMessage();
        billModal.style.display = 'none'; 
      });
      
      printBtn.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') printBtn.click();
      });
    }

    document.querySelector('.close')?.addEventListener('click', () => {
      billModal.style.display = 'none';
    });
    
    billModal.addEventListener('click', (e) => {
      if (e.target === billModal) billModal.style.display = 'none';
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => window.location.href = 'index.html');
  }

  const adminBtn = document.getElementById('adminBtn');
  if (adminBtn) {
    adminBtn.addEventListener('click', showAdminLogin);
  }
});

function showBillModal(slotName, vehicleNumber, entryTime) {
  const billModal = document.getElementById('billModal');
  if (!billModal) {
    alert(`✅ Slot ${slotName} allocated for ${vehicleNumber}`);
    return;
  }

  document.getElementById('billSlot').textContent = slotName;
  document.getElementById('billVehicle').textContent = vehicleNumber;
  document.getElementById('billDate').textContent = new Date().toLocaleDateString('en-IN');
  document.getElementById('billEntryTime').textContent = new Date(entryTime).toLocaleTimeString('en-IN');
  
  const qrContainer = document.getElementById('qrCode');
  if (qrContainer) {
    qrContainer.innerHTML = `
      <div style="width: 180px; height: 180px; margin: 20px auto; background: linear-gradient(45deg, #27ae60, #2ecc71); 
                   border-radius: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                   color: white; font-weight: bold; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
        <div style="font-size: 24px; margin-bottom: 5px;">${slotName}</div>
        <div style="font-size: 12px;">${vehicleNumber}</div>
      </div>
    `;
  }
  
  billModal.style.display = 'block';
}

function showMessage(element, text, type) {
  if (element) {
    element.textContent = text;
    element.className = `message ${type}`;
  }
}

function showSuccessMessage() {
  const messageDiv = document.getElementById('message');
  showMessage(messageDiv, '✅ Slot booked successfully!', 'success');
}

function closeModal() {
  document.getElementById('checkoutModal')?.style.setProperty('display', 'none');
  document.getElementById('billModal')?.style.setProperty('display', 'none');
}

window.onclick = function(event) {
  if (event.target.id === 'checkoutModal' || event.target.id === 'billModal') {
    event.target.style.display = 'none';
  }
};

document.addEventListener('click', function(e) {
  if (e.target.id === 'upiBtn' || e.target.id === 'cashBtn') {
    document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('selected'));
    e.target.classList.add('selected');
    document.getElementById('proceedBtn').disabled = false;
  }
  
  if (e.target.id === 'proceedBtn') {
    alert('✅ Payment successful! Slot freed.');
    closeModal();
    document.getElementById('slotName').value = '';
  }
});

function showAdminLogin() {
  if (document.getElementById("adminPrompt")) return;
  
  const popup = document.createElement("div");
  popup.id = "adminPrompt";
  popup.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 1000; display: block; min-width: 300px;`;
  
  popup.innerHTML = `
    <h3>🔐 Admin Login</h3>
    <input type="password" id="adminPassword" placeholder="Admin Password" style="width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #ddd; border-radius: 6px;" />
    <div id="adminError" style="color: #e74c3c; min-height: 1.2em;"></div>
    <button id="adminSubmit" style="padding: 12px 24px; margin-right: 10px; background: #2a9d8f; color: white; border: none; border-radius: 6px;">Submit</button>
    <button id="adminCancel" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 6px;">Cancel</button>
  `;
  
  document.body.appendChild(popup);
  
  document.getElementById("adminSubmit").onclick = async () => {
    const pass = document.getElementById("adminPassword").value.trim();
    const errorDiv = document.getElementById("adminError");
    
    if (!pass) {
      errorDiv.textContent = "Enter password";
      return;
    }
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const result = await res.json();
      
      if (res.ok && result.success) {
        window.location.href = "/admin/home.html";
      } else {
        errorDiv.textContent = "❌ Wrong password";
      }
    } catch (err) {
      errorDiv.textContent = "❌ Network error";
    }
  };
  
  document.getElementById("adminCancel").onclick = () => {
    document.body.removeChild(popup);
  };
}
