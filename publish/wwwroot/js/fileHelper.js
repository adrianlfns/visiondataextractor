// Helper function to read file from input element as data URL
export async function readFileAsDataUrl(inputId) {
    try {
        const inputElement = document.getElementById(inputId);
        if (!inputElement || inputElement.files.length === 0) {
            return null;
        }

        const file = inputElement.files[0];
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error("Error reading file:", error);
        return null;
    }
}
