let upload_type = "";

function jsonfile() {
  upload_type = "json";
}

function pdffile() {
  upload_type = "pdf";
}

document
  .getElementById("fileInput")
  .addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      switch (upload_type) {
        case "json":
          fetch(`/upload/${upload_type}`, {
            method: "POST",

            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              // Convert JSON to a Blob
              const jsonStr = JSON.stringify(data, null, 2);
              const blob = new Blob([jsonStr], { type: "application/json" });
              // Create a download link and trigger it
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "data.json"; // Set the file name
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
          break;

        case "pdf":
          fetch(`/upload/${upload_type}`, {
            method: "POST",

            body: formData,
          })
            .then((response) => response.blob())
            .then((blob) => {
              // Create a download link and trigger it for PDF
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "report.pdf"; // Set the file name
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
          break;
      }
    }
  });
