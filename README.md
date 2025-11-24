# Vision Data Extractor

This project is a Blazor WebAssembly application that uses a client-side AI model (via Transformers.js) to extract structured data from images based on user-defined prompts. It provides a modern, responsive interface for uploading images, defining data fields, running the extraction, and exporting the results as JSON.

## How to Run the App

1.  **Open the project in a compatible web-based IDE like Firebase Studio.**
2.  The development environment will be automatically configured based on the `.idx/dev.nix` file.
3.  Once the environment is ready, the application should start automatically.
4.  Open the web preview in a new browser tab to use the application.

## Key Features

-   **Client-Side AI:** All processing happens in the browser. No data is sent to a server.
-   **Custom Data Extraction:** Define the exact data points you want to pull from an image using natural language prompts.
-   **Responsive UI:** Works on both desktop and mobile devices.
-   **JSON Export:** Download the extracted data in a structured JSON format.
-   **Choice of Models:** Select from different model sizes based on your performance needs.

## Browser Compatibility

This application relies on modern web technologies, including WebAssembly and Web Workers, which are required by Transformers.js for running the AI model.

-   **Recommended:** Chrome, Edge (latest versions)
-   **Supported:** Firefox (latest versions)
-   **Not Supported:** Safari (due to potential issues with full IndexedDB support for large model caching in some versions).

## AI Model Information

The app uses pre-trained, quantized Document Question Answering models from the Hugging Face community. Quantization reduces the model size and improves performance in the browser.

-   **Default Model:** [onnx-community/SmolVLM-256M-Instruct](https://huggingface.co/onnx-community/SmolVLM-256M-Instruct)
    -   **Size:** ~500MB
    -   A good balance of performance and accuracy.
-   **Alternative Model:** [onnx-community/SmolVLM-500M-Instruct](https://huggingface.co/onnx-community/SmolVLM-500M-Instruct)
    -   **Size:** ~1GB
    -   Larger and potentially more accurate, but will have a longer initial download time.

The first time you select a model, it will be downloaded and cached in your browser's IndexedDB. Subsequent visits will load the model from the cache for a much faster startup time.

## Troubleshooting

-   **Model Download Fails:**
    -   Check your internet connection.
    -   Ensure you have sufficient disk space for the browser to cache the model (~1GB).
    -   Open the browser's developer console (F12) to see detailed error messages from the Transformers.js library.
-   **App is Slow or Unresponsive:**
    -   Running large AI models in the browser is resource-intensive. Ensure your computer has sufficient RAM.
    -   Close other demanding applications or browser tabs.
-   **Extraction Quality is Poor:**
    -   Try rephrasing your prompts to be more specific.
    -   Ensure the image is clear and the text is legible.
    -   For complex documents, the larger model may yield better results.


## Publishing for Github Pages
Publishing to 'doc' folders withch will be acutomaticalle be picked up on github pages.

```
.\publishToGitHubPagesDocFolder.ps1
```

## Demo URL
https://adrianlfns.github.io/visiondataextractor/
