/**
 * Flattens the Art Director JSON into a string for Midjourney/Dall-E
 */
export const flattenPrompt = (data) => {
    if (!data) return "";

    const segments = [];

    // 1. Subject & Action (The Core)
    if (data.subject) {
        let subjectStr = data.subject.description || "A subject";
        if (data.subject.pose) subjectStr += `, ${data.subject.pose}`;
        if (data.subject.outfit && typeof data.subject.outfit === 'object') {
            // Extract values from outfit object
            const details = Object.values(data.subject.outfit).join(", ");
            subjectStr += `, wearing ${details}`;
        }
        segments.push(subjectStr);
    }

    // 2. Scene & Environment
    if (data.scene) {
        let sceneStr = data.scene.location || "";
        if (data.scene.environment && Array.isArray(data.scene.environment)) {
            sceneStr += `, ${data.scene.environment.join(", ")}`;
        }
        if (data.scene.time) sceneStr += `, ${data.scene.time}`;
        if (data.scene.atmosphere) sceneStr += `, ${data.scene.atmosphere}`;
        segments.push(sceneStr);
    }

    // 3. Lighting & Style
    if (data.lighting) {
        segments.push(`${data.lighting.type}, ${data.lighting.key_light}, ${data.lighting.effect}`);
    }

    // 4. Tech Specs (Camera)
    if (data.meta) {
        segments.push(`shot on ${data.meta.camera}, ${data.meta.lens}, ${data.meta.resolution}, ${data.meta.style}`);
    }

    // 5. Midjourney Parameters (suffix)
    let suffix = "";
    if (data.meta && data.meta.aspect_ratio) {
        suffix = ` --ar ${data.meta.aspect_ratio.replace(':', ':')}`;
    }

    // Combine
    return segments.join(", ") + suffix;
};
