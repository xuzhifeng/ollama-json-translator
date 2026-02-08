import { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Globe, FileJson, Download, RefreshCw, Plus, X } from 'lucide-react';
import { Layout } from './components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Input, Select } from './components/ui/Input';
import { cn } from './lib/utils';
import { useLanguage } from './contexts/LanguageContext';

interface Preset {
  id: string;
  name: string;
  value: string;
}

function App() {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadSeverity, setUploadSeverity] = useState<'info' | 'success' | 'error'>('info');
  const [originalJson, setOriginalJson] = useState<any | null>(null);
  const [translatedJson, setTranslatedJson] = useState<any | null>(null);
  const [ollamaApiUrl, setOllamaApiUrl] = useState<string>('http://host.docker.internal:11434');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [ollamaConnectionStatus, setOllamaConnectionStatus] = useState<string>('');
  const [connectionSeverity, setConnectionSeverity] = useState<'success' | 'error' | ''>('');
  const [isConnectingOllama, setIsConnectingOllama] = useState<boolean>(false);
  const [isUploadingTranslating, setIsUploadingTranslating] = useState<boolean>(false);

  // Default languages for translation logic (not UI language)
  const [sourceLanguage, setSourceLanguage] = useState<string>('English');
  const [targetLanguage, setTargetLanguage] = useState<string>('Chinese');
  const [keysToExclude, setKeysToExclude] = useState<string>(() => {
    return localStorage.getItem('ollama-translator-exclude-keys') || '';
  });
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ollama-translator-presets') || '[]');
    } catch {
      return [];
    }
  });

  const supportedLanguages = ['English', 'Chinese', 'Spanish', 'French', 'German', 'Japanese', 'Korean'].map(l => ({ value: l, label: l }));

  // Persist keysToExclude settings
  useEffect(() => {
    localStorage.setItem('ollama-translator-exclude-keys', keysToExclude);
  }, [keysToExclude]);

  // Persist presets
  useEffect(() => {
    localStorage.setItem('ollama-translator-presets', JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    if (ollamaApiUrl) fetchOllamaModels(ollamaApiUrl);
  }, [ollamaApiUrl]);

  const fetchOllamaModels = async (url: string) => {
    setIsConnectingOllama(true);
    setOllamaConnectionStatus(t('connecting'));
    setConnectionSeverity('');
    try {
      const response = await fetch('/ollama/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ollamaApiUrl: url }),
      });

      if (!response.ok) throw new Error('Failed to fetch models');

      const data = await response.json();
      setOllamaModels(data.models);
      if (data.models.length > 0) {
        setSelectedModel(data.models[0]);
        setOllamaConnectionStatus(t('connected'));
        setConnectionSeverity('success');
      } else {
        setOllamaConnectionStatus(t('connectedNoModels'));
        setConnectionSeverity('error');
        setSelectedModel('');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setOllamaModels([]);
      setSelectedModel('');
      setOllamaConnectionStatus(t('connectionFailed'));
      setConnectionSeverity('error');
    } finally {
      setIsConnectingOllama(false);
    }
  };

  const handleTestOllamaConnection = () => {
    fetchOllamaModels(ollamaApiUrl);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus('');
      setOriginalJson(null);
      setTranslatedJson(null);
    }
  };

  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // ... (existing code)

  const handleUploadAndTranslate = async () => {
    if (!selectedFile) {
      setUploadStatus(t('pleaseSelectFile'));
      setUploadSeverity('error');
      return;
    }
    if (!selectedModel) {
      setUploadStatus(t('pleaseSelectModel'));
      setUploadSeverity('error');
      return;
    }

    setIsUploadingTranslating(true);
    setUploadStatus(t('uploading'));
    setUploadSeverity('info');
    setOriginalJson(null);
    setTranslatedJson(null);

    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    const formData = new FormData();
    formData.append('jsonFile', selectedFile);

    let parsedJsonData: any = null;

    try {
      const uploadResponse = await fetch('/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal, // Bind signal to upload request
      });

      if (!uploadResponse.ok) throw new Error(t('uploadFailed'));

      const uploadResult = await uploadResponse.json();
      parsedJsonData = uploadResult.data;
      setOriginalJson(parsedJsonData);

      setUploadStatus(t('translating'));

      const translateResponse = await fetch('/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonData: parsedJsonData,
          model: selectedModel,
          ollamaApiUrl,
          sourceLanguage,
          targetLanguage,
          keysToExclude
        }),
        signal: controller.signal, // Bind signal to translate request
      });

      if (!translateResponse.ok) throw new Error('Translation failed');

      const translateResult = await translateResponse.json();
      setUploadStatus(t('translationSuccess'));
      setUploadSeverity('success');
      setTranslatedJson(translateResult.data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setUploadStatus('Translation cancelled.');
        setUploadSeverity('info');
      } else {
        console.error('Error:', error);
        setUploadStatus(error.message || t('somethingWentWrong'));
        setUploadSeverity('error');
      }
    } finally {
      setIsUploadingTranslating(false);
      setAbortController(null); // Cleanup
    }
  };

  const handleCancelTranslation = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleSavePreset = () => {
    if (!keysToExclude.trim()) return;
    const name = window.prompt("Enter a name for this preset:");
    if (name) {
      const newPreset: Preset = {
        id: Date.now().toString(),
        name,
        value: keysToExclude
      };
      setPresets([...presets, newPreset]);
    }
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this preset?")) {
      setPresets(presets.filter(p => p.id !== id));
    }
  };

  const handleApplyPreset = (value: string) => {
    setKeysToExclude(value);
  };

  const handleDownload = () => {
    if (translatedJson) {
      const jsonString = JSON.stringify(translatedJson, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translated_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Layout>
      <div className="grid gap-8">
        {/* Configuration Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-xl font-semibold text-text">{t('config')}</h2>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-[1fr,auto] gap-4 items-end">
                <Input
                  label="Ollama API URL"
                  value={ollamaApiUrl}
                  onChange={(e) => setOllamaApiUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
                <Button
                  onClick={handleTestOllamaConnection}
                  isLoading={isConnectingOllama}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  className="w-full md:w-auto"
                >
                  {t('testConnection')}
                </Button>
              </div>

              {ollamaConnectionStatus && (
                <div className={cn(
                  "mt-4 p-3 rounded-lg flex items-center gap-2 text-sm",
                  connectionSeverity === 'success' ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" :
                    connectionSeverity === 'error' ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" :
                      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                )}>
                  {connectionSeverity === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                    connectionSeverity === 'error' ? <AlertCircle className="w-4 h-4" /> :
                      <RefreshCw className="w-4 h-4 animate-spin" />}
                  {ollamaConnectionStatus}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Translation Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-1 bg-secondary rounded-full" />
            <h2 className="text-xl font-semibold text-text">{t('translation')}</h2>
          </div>

          <Card>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2 ml-1">{t('uploadFile')}</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
                      <UploadCloud className="w-8 h-8 text-textMuted mb-2 group-hover:text-primary transition-colors" />
                      <p className="text-sm font-medium text-text">
                        {selectedFile ? selectedFile.name : t('clickToUpload')}
                      </p>
                      <p className="text-xs text-textMuted mt-1">{t('jsonFilesOnly')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Select
                    label={t('ollamaModel')}
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    options={ollamaModels.length > 0 ? ollamaModels.map(m => ({ value: m, label: m })) : [{ value: '', label: t('noModelsFound') }]}
                    disabled={ollamaModels.length === 0}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label={t('from')}
                      value={sourceLanguage}
                      onChange={(e) => setSourceLanguage(e.target.value)}
                      options={supportedLanguages}
                    />
                    <Select
                      label={t('to')}
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      options={supportedLanguages}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  label={t('excludeKeys')}
                  value={keysToExclude}
                  onChange={(e) => setKeysToExclude(e.target.value)}
                  placeholder="id, version, timestamp..."
                />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-textMuted font-medium mr-1">Presets:</span>
                  {presets.map(preset => (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.value)}
                      className="flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded-md text-xs cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors group"
                    >
                      <span>{preset.name}</span>
                      <button
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                        className="opacity-50 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSavePreset}
                    disabled={!keysToExclude.trim()}
                    className="h-7 text-xs px-2"
                    leftIcon={<Plus className="w-3 h-3" />}
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  onClick={handleUploadAndTranslate}
                  disabled={!selectedFile || !selectedModel || isUploadingTranslating}
                  isLoading={isUploadingTranslating}
                  className="flex-1"
                  size="lg"
                  leftIcon={<Globe className="w-5 h-5" />}
                >
                  {isUploadingTranslating ? t('translating') : t('startTranslation')}
                </Button>

                {isUploadingTranslating && (
                  <Button
                    onClick={handleCancelTranslation}
                    variant="danger"
                    size="lg"
                    leftIcon={<X className="w-5 h-5" />}
                  >
                    Stop
                  </Button>
                )}
              </div>

              {uploadStatus && (
                <div className={cn(
                  "p-4 rounded-xl flex items-center gap-3 text-sm border",
                  uploadSeverity === 'success' ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" :
                    uploadSeverity === 'error' ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" :
                      "bg-primary/10 text-blue-600 dark:text-blue-400 border-primary/20"
                )}>
                  {uploadSeverity === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> :
                    uploadSeverity === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> :
                      <RefreshCw className="w-5 h-5 animate-spin flex-shrink-0" />}
                  <span className="font-medium">{uploadStatus}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Results Section */}
        {(originalJson || translatedJson) && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-accent rounded-full" />
                <h2 className="text-xl font-semibold text-text">{t('results')}</h2>
              </div>

              {translatedJson && (
                <Button variant="secondary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
                  {t('downloadJson')}
                </Button>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {originalJson && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-sm font-medium text-textMuted flex items-center gap-2">
                      <FileJson className="w-4 h-4" /> {t('original')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="p-4 h-[500px] overflow-auto text-xs font-mono text-textMuted bg-surface/50 scrollbar-thin">
                      {JSON.stringify(originalJson, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {translatedJson && (
                <Card className="border-primary/30">
                  <CardHeader className="flex flex-row items-center justify-between py-3 bg-primary/5">
                    <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                      <Globe className="w-4 h-4" /> {t('translated')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="p-4 h-[500px] overflow-auto text-xs font-mono text-green-600 dark:text-green-300 bg-surface/50 scrollbar-thin">
                      {JSON.stringify(translatedJson, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default App;