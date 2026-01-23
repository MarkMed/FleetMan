import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@store';
import { Button } from '@components/ui';
import { cn } from '@utils/cn';

/**
 * ThemeToggle Component - Sprint #14 Task 14.5
 * 
 * Componente selector de tema claro/oscuro/sistema.
 * Integra con Zustand store para persistencia automática en localStorage.
 * 
 * @remarks
 * - Usa useUIStore hook que ya maneja setTheme() y localStorage
 * - Theme se aplica automáticamente a document.documentElement
 * - Sistema detecta preferencia del OS con prefers-color-scheme
 * 
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */
export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useUIStore();
  const { t } = useTranslation();

  const themes = [
    {
      value: 'light' as const,
      icon: Sun,
      label: t('settings.appearance.theme.light'),
      ariaLabel: t('settings.appearance.theme.lightAria'),
    },
    {
      value: 'dark' as const,
      icon: Moon,
      label: t('settings.appearance.theme.dark'),
      ariaLabel: t('settings.appearance.theme.darkAria'),
    },
    {
      value: 'system' as const,
      icon: Monitor,
      label: t('settings.appearance.theme.system'),
      ariaLabel: t('settings.appearance.theme.systemAria'),
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {themes.map(({ value, icon: Icon, label, ariaLabel }) => {
        const isActive = theme === value;

        return (
          <Button
            key={value}
            variant={isActive ? 'filled' : 'outline'}
            size="sm"
            onPress={() => setTheme(value)}
            className={cn(
              'flex items-center gap-2 transition-all duration-200',
              isActive && 'shadow-sm'
            )}
            aria-label={ariaLabel}
            aria-pressed={isActive}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Button>
        );
      })}
    </div>
  );
};

// Comentario estratégico: Se podría extender con más variantes de tema en el futuro
// interface ExtendedThemeOptions {
//   value: 'light' | 'dark' | 'system' | 'high-contrast' | 'sepia';
//   icon: LucideIcon;
//   label: string;
//   description?: string; // Para tooltips explicativos
// }
