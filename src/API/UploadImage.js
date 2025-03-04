
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));



export async function localFileToURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

export async function getImages() {
    await delay();
    return JSON.parse(localStorage.getItem('images') || '[]');
  }
  
  export async function saveImage(file) {
    await delay();
    const url = await localFileToURL(file);
    const images = JSON.parse(localStorage.getItem('images') || '[]');
    images.push({
      id: Date.now().toString(),
      url,
    });
    localStorage.setItem('images', JSON.stringify(images));
  }