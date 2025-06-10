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

function saveLocalFile(name, dataUrl) {
  const files = JSON.parse(localStorage.getItem('excel_local_files') || '{}');
  files[name] = dataUrl;
  localStorage.setItem('excel_local_files', JSON.stringify(files));
}

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
          // Save to LocalStorage
          const reader = new FileReader();
          reader.onload = function(evt) {
            saveLocalFile("data.json", evt.target.result);
          };
          reader.readAsDataURL(blob);
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
          // Save to LocalStorage
          const reader = new FileReader();
          reader.onload = function(evt) {
            saveLocalFile("report.pdf", evt.target.result);
          };
          reader.readAsDataURL(blob);
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
          // Save to LocalStorage
          const reader = new FileReader();
          reader.onload = function(evt) {
            saveLocalFile('excel_data.sql', evt.target.result);
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {
          document.getElementById('message').textContent = 'SQL download failed.';
        });
      break;
  }
}

// Style for styled buttons
function createStyledButton(text, onClick) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.background = 'var(--primary)';
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.padding = '10px 22px';
  btn.style.borderRadius = '30px';
  btn.style.fontWeight = '600';
  btn.style.cursor = 'pointer';
  btn.style.transition = 'all 0.3s ease';
  btn.style.marginLeft = '10px';
  btn.onmouseover = () => {
    btn.style.background = 'var(--secondary)';
    btn.style.transform = 'translateY(-2px)';
    btn.style.boxShadow = '0 5px 15px rgba(243, 73, 30, 0.4)';
  };
  btn.onmouseleave = () => {
    btn.style.background = 'var(--primary)';
    btn.style.transform = '';
    btn.style.boxShadow = '0 3px 8px rgba(241, 166, 99, 0.3)';
  };
  if (onClick) btn.onclick = onClick;
  return btn;
}

// In renderLocalFiles, use styled buttons for Delete
function renderLocalFiles() {
  const files = getLocalFiles();
  const list = document.getElementById('local-files-list');
  list.innerHTML = '';
  Object.keys(files).forEach(name => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = files[name];
    link.download = name;
    link.textContent = name;
    link.style.marginRight = '10px';
    li.appendChild(link);
    const delBtn = createStyledButton('Delete', () => removeLocalFile(name));
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Style the Clear All button on page load
window.addEventListener('DOMContentLoaded', () => {
  const clearBtn = document.querySelector('button[onclick="clearLocalFiles()"]');
  if (clearBtn) {
    clearBtn.classList.add('styled-btn');
    clearBtn.style.background = 'var(--primary)';
    clearBtn.style.color = 'white';
    clearBtn.style.border = 'none';
    clearBtn.style.padding = '10px 22px';
    clearBtn.style.borderRadius = '30px';
    clearBtn.style.fontWeight = '600';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.transition = 'all 0.3s ease';
    clearBtn.onmouseover = () => {
      clearBtn.style.background = 'var(--secondary)';
      clearBtn.style.transform = 'translateY(-2px)';
      clearBtn.style.boxShadow = '0 5px 15px rgba(243, 73, 30, 0.4)';
    };
    clearBtn.onmouseleave = () => {
      clearBtn.style.background = 'var(--primary)';
      clearBtn.style.transform = '';
      clearBtn.style.boxShadow = '0 3px 8px rgba(241, 166, 99, 0.3)';
    };
  }
});
