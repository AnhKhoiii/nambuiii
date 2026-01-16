fetch("http://localhost:3000/api/history")
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("historyList");

    if (data.length === 0) {
      list.innerHTML = "<p>Chưa có trận đấu nào</p>";
      return;
    }

    data.forEach(item => {
      const li = document.createElement("li");
      li.className = "history-item";

      li.innerHTML = `
        <div class="history-info">
          <div> ${new Date(item.created_at).toLocaleString()}</div>
          <div>Chế độ: <span class="badge ${item.mode}">${item.mode.toUpperCase()}</span></div>
        </div>
        <div class="badge ${item.winner}">
          ${item.winner}
        </div>
      `;

      list.appendChild(li);
    });
  });

  function deleteHistory() {
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đấu không?");

  if (!confirmDelete) return;

  fetch("http://localhost:3000/api/history", {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      alert("Đã xóa lịch sử đấu!");
      location.reload(); // load lại trang
    })
    .catch(err => {
      console.error(err);
      alert("Lỗi khi xóa lịch sử");
    });
}
