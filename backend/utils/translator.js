// backend/utils/translator.js

const FETCH_TIMEOUT = 1800000; // 30 minutes timeout

let OLLAMA_API_BASE_URL = 'http://localhost:11434'; // Default Ollama API Base URL

// Function to set the Ollama API Base URL dynamically
function setOllamaApiBaseUrl(url) {
  OLLAMA_API_BASE_URL = url;
}

/**
 * Translates a given English text to Chinese using Ollama API.
 * @param {string} text The English text to translate.
 * @param {string} model The Ollama model to use for translation.
 * @returns {Promise<string>} The translated Chinese text.
 */
async function translateText(text, model = 'llama2', sourceLanguage = 'English', targetLanguage = 'Chinese') { // Added language parameters with defaults
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT); // Set timeout

  try {
    const response = await fetch(`${OLLAMA_API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model, // Use the provided model
        prompt: `Translate the following ${sourceLanguage} text to ${targetLanguage}: ${text}`,
        stream: false, // Wait for full response
      }),
      signal: controller.signal // Pass signal to fetch
    });

    clearTimeout(timeoutId); // Clear timeout if fetch completes

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ollama API non-ok response for text (first 100 chars): "${text.substring(0, 100)}..."`, `Status: ${response.status}`, `Error: ${errorText}`);
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Ollama raw response data for text (first 100 chars): "${text.substring(0, 100)}..."`, data); // 新增日志

    if (data.response === undefined || data.response === null || (typeof data.response === 'string' && data.response.trim() === '')) {
      console.warn(`Ollama returned empty or missing 'response' field for text (first 100 chars): "${text.substring(0, 100)}..."`, data); // 新增警告
      return text; // 如果 Ollama 没有提供翻译，则返回原文
    }

    // Assuming the translation is in data.response, adjust based on actual Ollama response
    return data.response.trim();
  } catch (error) {
    clearTimeout(timeoutId); // Ensure timeout is cleared even on error before fetch completes
    console.error(`Error translating text with Ollama. Returning original text (first 100 chars): "${text.substring(0, 100)}..."`, error); // 修改日志
    // Fallback to original text or throw error based on desired behavior
    return text; // For now, return original text on error
  }
}

/**
 * Recursively traverses a JSON object and translates English string values to Chinese.
 * Keys are preserved as they are.
 * @param {object | Array} jsonObject The JSON object or array to traverse and translate.
 * @param {string} model The Ollama model to use for translation.
 * @returns {Promise<object | Array>} The translated JSON object or array.
 */
async function translateJson(jsonObject, model, sourceLanguage, targetLanguage, keysToExclude = '') { // Added keysToExclude parameter with default
  if (typeof jsonObject !== 'object' || jsonObject === null) {
    return jsonObject; // Not an object or array, return as is
  }

  const excludedKeysSet = new Set(keysToExclude.split(',').map(key => key.trim()).filter(key => key !== ''));

  if (Array.isArray(jsonObject)) {
    const translatedArray = [];
    for (const item of jsonObject) {
      if (typeof item === 'string') { // 如果数组元素是字符串
        const isEnglish = /[a-zA-Z]/.test(item) && !/[\u4e00-\u9fa5]/.test(item);
        if (isEnglish) {
          translatedArray.push(await translateText(item, model, sourceLanguage, targetLanguage));
        } else {
          translatedArray.push(item);
        }
      } else { // 保持原有的递归调用，处理数组中的对象或嵌套数组
        translatedArray.push(await translateJson(item, model, sourceLanguage, targetLanguage, keysToExclude)); // Pass keysToExclude
      }
    }
    return translatedArray;
  }

  const translatedObject = {};
  for (const key in jsonObject) {
    if (Object.prototype.hasOwnProperty.call(jsonObject, key)) {
      const value = jsonObject[key];

      // Check if the current key should be excluded from translation
      if (excludedKeysSet.has(key)) { // New exclude logic
        translatedObject[key] = value;
        continue; // Skip translation for this key
      }

      if (typeof value === 'string') {
        // Simple check to avoid translating non-English or already translated strings.
        // This is a basic heuristic and can be improved with language detection if needed.
        const isEnglish = /[a-zA-Z]/.test(value) && !/[\u4e00-\u9fa5]/.test(value);
        if (isEnglish) {
          translatedObject[key] = await translateText(value, model, sourceLanguage, targetLanguage); // Pass model and languages
        } else {
          translatedObject[key] = value;
        }
      } else if (typeof value === 'object') {
        translatedObject[key] = await translateJson(value, model, sourceLanguage, targetLanguage, keysToExclude); // Pass keysToExclude
      } else {
        translatedObject[key] = value;
      }
    }
  }
  return translatedObject;
}

module.exports = { translateJson, setOllamaApiBaseUrl };