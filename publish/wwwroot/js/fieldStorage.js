// Field template storage using browser localStorage

const STORAGE_KEY = 'visionExtractor_fieldTemplates';

export function saveTemplate(name, fields) {
    try {
        const templates = getTemplates();
        // Store each template as an object with TemplateName and Fields array
        templates.push({ TemplateName: name, Fields: fields });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        return { success: true, message: `Template "${name}" saved.` };
    } catch (error) {
        return { success: false, message: `Error saving template: ${error.message}` };
    }
}

export function getTemplates() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading templates:', error);
        return {};
    }
}

export function getTemplate(name) {
    try {
        const templates = getTemplates();
        return templates[name] || null;
    } catch (error) {
        console.error('Error getting template:', error);
        return null;
    }
}

export function deleteTemplate(name) {
    try {
        const templates = getTemplates();
        delete templates[name];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        return { success: true, message: `Template "${name}" deleted.` };
    } catch (error) {
        return { success: false, message: `Error deleting template: ${error.message}` };
    }
}

export function listTemplates() {
    try {
        var templateNames = []
        const templates = getTemplates();
        templates.forEach(element => {
            templateNames.push(element)
        });
        return templateNames;
    } catch (error) {
        console.error('Error listing templates:', error);
        return [];
    }
}
