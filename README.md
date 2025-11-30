


<p align="center">
  <img src="logo.svg" alt="Vision Data Extractor" width="200">
</p>


# Vision Data Extractor

This project is a Blazor WebAssembly application that uses a client-side AI model (via Transformers.js) to extract structured data from images based on user-defined prompts. It provides a modern, responsive interface for uploading images, defining data fields, running the extraction, and exporting the results as JSON.

## How to Run the App locally 
1. Open a powershell terminal.
2. Navigate to the folder VisionDataExtractor. Inside that folder, you should be able to see a file named VisionDataExtractor.csproj.
3. On the terminal type the command `dotnet watch`
4. The browser should open automatically. If it does not, check the console. You should see something similar to "Now listening on: http://localhost:5269". Put that URL in your browser and you should be able to run the site locally.



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

## Important code snippets

#### Loading the model based in the model key. Located in the vision-interop.js file.
```js vision-interop.js

    async loadModel(modelId, dotNetRef) {
        try {
            // 1. Check for WebGPU support
            if (!navigator.gpu) {
                const message = 'WebGPU is not supported in your browser. Please use a modern browser like Chrome or Edge (version 113+).';
                console.error(message);
                return { error: message };
            }
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                 const message = 'WebGPU supported, but no compatible adapter found.';
                 console.error(message);
                 return { error: message };
            }
            console.log('WebGPU is supported and adapter is available.');

            // 2. Import necessary components from Transformers.js (using @latest)
            const { AutoProcessor, AutoModelForVision2Seq, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.0');

            // 3. Configure environment
            env.allowLocalModels = false;

            // 4. Load processor and model
            console.log(`Loading processor for: ${modelId}`);
            this.processor = await AutoProcessor.from_pretrained(modelId, {
                progress_callback: (data) => this.handleProgress(data, dotNetRef)
            });

            console.log(`Loading model: ${modelId}`);                    


            this.model = await AutoModelForVision2Seq.from_pretrained(modelId, {
                dtype: {
                  embed_tokens: 'fp32',
                  vision_encoder: 'q4',
                  decoder_model_merged: 'q4',
                },
                device: 'webgpu',
                progress_callback: (data) => this.handleProgress(data, dotNetRef)
            });
            
            // 5. Finalize and report success
            if (dotNetRef) {
                dotNetRef.invokeMethodAsync('UpdateProgress', 100);
            }
            localStorage.setItem(`model_cached_${modelId}`, 'true');
            console.log('Model and processor loaded successfully with WebGPU.');
            return true;

        } catch (error) {
            console.error('Error loading model:', error);
            return { error: `Failed to load model: ${error.message}` };
        }
    }

```

#### Prompting the model with image as the context. Located in the vision-interop.js file.
```js vision-interop.js
  async extractData(imageDataUrl, prompt) {
        try {
            if (!this.model || !this.processor) {
                throw new Error('The model and processor are not loaded. Please call loadModel first.');
            }
            console.log(`Extracting data with prompt: "${prompt}"`);

            // Import RawImage from @latest
            const {RawImage} = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.0'); 

              const image = await RawImage.fromURL(imageDataUrl);


            const messages = [
                {
                role: 'user',
                content: [
                    { type: 'image' },
                    { type: 'text', text: prompt }
                ]
                }
            ];

            const text = this.processor.apply_chat_template(messages, {
                add_generation_prompt: true,
            });

            console.log('Processing inputs...');
            const inputs = await this.processor(text, [image], {
                do_image_splitting: false,
            });
            
            console.log('Generating response...');
            const generatedIds = await this.model.generate({
                ...inputs,
                max_new_tokens: 100,
            });

            console.log('Decoding output...');
            const output = this.processor.batch_decode(
                generatedIds.slice(null, [inputs.input_ids.dims.at(-1), null]),
                { skip_special_tokens: true }
            );

            const answer = output[0].trim();           
            
            console.log('Extraction result:', answer);
            return answer || 'No answer could be extracted.';

        } catch (error) {
            console.error('Error extracting data:', error);
            return { error: `Failed to extract data: ${error.message}` };
        }
    }
```



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


## Compiling/Publishing
To host this site as a static page, you must first compile and then publish it.

At the root of the repository, you should see a PowerShell script named publishSite.ps1. Execute this script as shown below.

After the script completes, the publish folder will contain the compiled site. This publish folder is the exact directory that needs to be deployed to static hosting services like Netlify or GitHub Pages.

```
.\publishSite.ps1
```

## Demo URL
https://visiondataextractor.netlify.app/
