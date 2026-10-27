import { useEffect, useId, useRef, useState } from "react";
import { Accessibility, Moon, Sun, X, RotateCcw } from "lucide-react";
import { useAccessibility } from "./AccessibilityProvider";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
export function AccessibilityPanel() {
  const { preferences, theme, update, reset } = useAccessibility();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === "KeyA") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <>
      <div className="accessibility-tools">
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
          }
          onClick={() => update({ theme: theme === "dark" ? "light" : "dark" })}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
        <Button
          ref={trigger}
          variant="ghost"
          aria-label="Opções de acessibilidade"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <Accessibility />
          <span>Acessibilidade</span>
        </Button>
      </div>
      <dialog
        ref={ref}
        className="accessibility-dialog"
        aria-labelledby={id}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
      >
        <div className="section-head">
          <div>
            <span className="eyebrow">DO SEU JEITO</span>
            <h2 id={id}>Conforto e acessibilidade</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Fechar opções de acessibilidade"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <p>
          Escolha como prefere navegar. Suas opções ficam salvas apenas neste
          navegador.
        </p>
        <div className="accessibility-option">
          <Label htmlFor={`${id}-theme`}>Aparência</Label>
          <select
            id={`${id}-theme`}
            value={preferences.theme}
            onChange={(e) =>
              update({ theme: e.target.value as typeof preferences.theme })
            }
          >
            <option value="system">Acompanhar o dispositivo</option>
            <option value="light">Clara</option>
            <option value="dark">Escura</option>
          </select>
        </div>
        <div className="accessibility-switch">
          <div>
            <Label htmlFor={`${id}-calm`}>Modo tranquilo</Label>
            <p id={`${id}-calm-help`}>
              Sem 3D ou animações, com mais espaço e uma apresentação simples.
            </p>
          </div>
          <Switch
            id={`${id}-calm`}
            checked={preferences.calm}
            onCheckedChange={(calm) => update({ calm })}
            aria-describedby={`${id}-calm-help`}
          />
        </div>
        <div className="accessibility-switch">
          <div>
            <Label htmlFor={`${id}-text`}>Texto ampliado</Label>
            <p>Aumenta o tamanho e a altura das linhas.</p>
          </div>
          <Switch
            id={`${id}-text`}
            checked={preferences.largeText}
            onCheckedChange={(largeText) => update({ largeText })}
          />
        </div>
        <div className="accessibility-option">
          <Label htmlFor={`${id}-filter`}>Ajuste de cores</Label>
          <select
            id={`${id}-filter`}
            value={preferences.filter}
            onChange={(e) =>
              update({ filter: e.target.value as typeof preferences.filter })
            }
          >
            <option value="none">Cores originais</option>
            <option value="protanopia">Realce para protanopia</option>
            <option value="deuteranopia">Realce para deuteranopia</option>
            <option value="tritanopia">Realce para tritanopia</option>
            <option value="achromatopsia">
              Escala de cinza · acromatopsia
            </option>
          </select>
          <p>
            Escolha o ajuste que facilita sua leitura. Avisos sempre incluem
            texto.
          </p>
        </div>
        <div className="shortcut-note">
          <strong>Atalhos de teclado</strong>
          <p>
            <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> abre este painel.
            <br />
            <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> leva ao botão de
            entrada, quando disponível.
            <br />
            <kbd>Esc</kbd> fecha este painel.
          </p>
        </div>
        <Button variant="ghost" onClick={reset}>
          <RotateCcw />
          Restaurar preferências
        </Button>
      </dialog>
      <svg className="color-filter-definitions" aria-hidden="true">
        <defs>
          <filter id="color-protanopia" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values=".8 .2 0 0 0  .15 .85 0 0 0  .15 -.15 1 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="color-deuteranopia" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 .15 -.15 0 0  .15 .8 .05 0 0  0 .2 .8 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="color-tritanopia" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values=".9 .1 0 0 0  0 .9 .1 0 0  .15 .15 .7 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}
