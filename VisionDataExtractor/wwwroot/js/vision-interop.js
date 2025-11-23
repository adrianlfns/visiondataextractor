window.visionInterop = {
    model: null,
    processor: null,
    lastPercentage: null,

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
                  embed_tokens: 'fp16',
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
    },

    // Helper for progress updates
    handleProgress(data, dotNetRef) {
        if (dotNetRef && data.status === 'progress' && typeof data.progress === 'number') {
            const percentage = Math.round(data.progress);
            if (percentage !== this.lastPercentage) {
                this.lastPercentage = percentage;
                dotNetRef.invokeMethodAsync('UpdateProgress', percentage);
            }
        }
    },

    async extractData(imageDataUrl, prompt) {
        try {
            if (!this.model || !this.processor) {
                throw new Error('The model and processor are not loaded. Please call loadModel first.');
            }
            console.log(`Extracting data with prompt: "${prompt}"`);

            // Import RawImage from @latest
            const { RawImage } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@latest');
            const image = await RawImage.fromURL(imageDataUrl);

            const fullPrompt = `<|user|>\n<image>\n${prompt}<|assistant|>\n`;
            const inputs = await this.processor(fullPrompt, { images: image });
            const output = await this.model.generate({ ...inputs, max_new_tokens: 256 });
            const decodedOutput = this.processor.batch_decode(output, { skip_special_tokens: true });
            
            const answer = decodedOutput[0].split('<|assistant|>')[1]?.trim();

            console.log('Extraction result:', answer);
            return answer || 'No answer could be extracted.';

        } catch (error) {
            console.error('Error extracting data:', error);
            return { error: `Failed to extract data: ${error.message}` };
        }
    },

    isModelCached(modelId) {
        try {
            const isCached = localStorage.getItem(`model_cached_${modelId}`) === 'true';
            console.log(`Is model "${modelId}" cached? ${isCached}`);
            return isCached;
        } catch (error) {
            console.error('Error checking model cache:', error);
            return false;
        }
    },

    downloadFile(filename, content) {
        try {
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error downloading file:', error);
            return { error: `Failed to download file: ${error.message}` };
        }
    },

    getLocalStorage(key) {
        return localStorage.getItem(key);
    },

    setLocalStorage(key, value) {
        localStorage.setItem(key, value);
    }
};
