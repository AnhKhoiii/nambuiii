document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
});

function loadHistory() {
  const listElement = document.getElementById("history-list");

  fetch("http://localhost:3000/api/history")
    .then(response => {
      if (!response.ok) {
        throw new Error("Không thể kết nối đến server");
      }
      return response.json();
    })
    .then(data => {
      if (data.length === 0) {
        listElement.innerHTML = '<p class="empty-msg">Chưa có trận đấu nào được ghi lại.</p>';
        return;
      }

      const html = data.map(item => {
        const dateObj = new Date(item.playedAt);
        const dateStr = dateObj.toLocaleString('vi-VN', {
          hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const modeClass = (item.mode === 'PvE' || item.mode === 'bot') ? 'pve' : 'pvp';
        const modeName = (item.mode === 'PvE' || item.mode === 'bot') ? 'Đấu Máy' : 'Đấu Người';

        return `
          <div class="history-item">
            <div class="match-info">
              <div class="match-players">
                ${escapeHtml(item.player1)} 
                <span class="score-badge">${item.score1} - ${item.score2}</span> 
                ${escapeHtml(item.player2)}
              </div>
              <div class="match-meta">
                <span class="mode-tag ${modeClass}">${modeName}</span>
                <span>${dateStr}</span>
              </div>
            </div>
          </div>
        `;
      }).join("");

      listElement.innerHTML = html;
    })
    .catch(error => {
      console.error("Lỗi:", error);
      listElement.innerHTML = '<p class="empty-msg" style="color:red">Lỗi tải dữ liệu! Hãy đảm bảo Server (backend) đang chạy.</p>';
    });
}

function goBack() {
  window.location.href = "home.html";
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}