document
  .getElementById("fileInput")
  .addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append("file",file);

        fetch("/upload/import", {
        method: "POST",
    
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // Convert JSON to a Blob
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        // Create a download link and trigger it
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "data.json"; // Set the file name
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error:", error);
      });
    }
  });
