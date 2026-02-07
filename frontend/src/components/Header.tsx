import { Zap, Moon, Sun, Github, Languages } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';

export function Header() {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/50 backdrop-blur-xl transition-colors duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-textMuted dark:from-white dark:to-white/60">
                        {t('title')} <span className="text-primary text-sm px-2 py-0.5 rounded-full bg-primary/10 ml-2">{t('pro')}</span>
                    </h1>
                </div>

                <nav className="flex items-center gap-2">
                    {/* Language Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                        className="text-textMuted hover:text-text"
                        title={language === 'en' ? "Switch to Chinese" : "切换到英文"}
                    >
                        <Languages className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'EN' : '中文'}
                    </Button>

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="text-textMuted hover:text-text"
                    >
                        {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </Button>

                    {/* GitHub Link */}
                    <a
                        href="https://github.com/xuzhifeng/ollama-json-translator"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-textMuted hover:text-text transition-colors rounded-xl hover:bg-surface/10 ml-1"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                </nav>
            </div>
        </header>
    );
}
