let upload_type = "";

function setUploadType(type) {
  upload_type = type;
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    document.getElementById('message').textContent = 'Please choose a file first.';
    // Only open file dialog, don't upload yet
    fileInput.value = ""; // Reset so change always fires
    fileInput.click();
  } else {
    handleUpload(fileInput.files[0]);
  }
}

document.getElementById("jsonBtn").onclick = () => setUploadType("json");
document.getElementById("pdfBtn").onclick = () => setUploadType("pdf");
document.getElementById("sqlBtn").onclick = () => setUploadType("sql");

// Only open file dialog, don't set upload_type here
document.querySelector('.custom-file-label').onclick = function(e) {
  e.preventDefault();
  document.getElementById('fileInput').value = ""; // Reset so change always fires
  document.getElementById('fileInput').click();
};

document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && upload_type) {
    handleUpload(file);
  } else {
    document.getElementById('message').textContent = 'Please select a conversion type first.';
  }
});

function handleUpload(file) {
  const formData = new FormData();
  formData.append("file", file);

  switch (upload_type) {
    case "json":
      fetch(`/upload/json`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          const jsonStr = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonStr], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "data.json";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          document.getElementById('message').textContent = 'JSON file downloaded!';
        })
        .catch((error) => {
          document.getElementById('message').textContent = 'JSON download failed.';
          console.error("Error:", error);
        });
      break;

    case "pdf":
      fetch(`/upload/pdf`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "report.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          document.getElementById('message').textContent = 'PDF file downloaded!';
        })
        .catch((error) => {
          document.getElementById('message').textContent = 'PDF download failed.';
          console.error("Error:", error);
        });
      break;

    case "sql":
      fetch(`/upload/sql`, {
        method: "POST",
        body: formData,
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed');
          return res.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'excel_data.sql';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          document.getElementById('message').textContent = 'SQL file downloaded!';
        })
        .catch(() => {
          document.getElementById('message').textContent = 'SQL download failed.';
        });
      break;
  }
}
