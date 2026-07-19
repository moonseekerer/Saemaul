async function listStorageFiles() {
  const buckets = ['saemaul-sdgs.appspot.com', 'saemaul-sdgs.firebasestorage.app'];
  
  for (const bucket of buckets) {
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o`;
    console.log(`\nQuerying bucket: ${bucket}...`);
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        console.log(`Success! Found ${data.items ? data.items.length : 0} items.`);
        if (data.items) {
          data.items.forEach(item => {
            console.log(`- Name: ${item.name}`);
            console.log(`  Download URL: https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(item.name)}?alt=media&token=${item.metadata?.firebaseStorageDownloadTokens || ''}`);
          });
        }
      } else {
        console.log(`Failed (Status ${res.status}):`, data.error?.message || data);
      }
    } catch (err) {
      console.error("Error querying bucket:", err.message);
    }
  }
}

listStorageFiles();
