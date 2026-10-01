import { useApp } from '../store/AppStore';

export function WebFocusStyles() {
  const { palette } = useApp();
  return <style>{`
    :where(button, a, input, textarea, select, [tabindex], [role="button"], [role="checkbox"], [role="tab"]):focus {
      outline: none !important;
    }
    :where(button, a, select, [tabindex], [role="button"], [role="checkbox"], [role="tab"]):focus-visible {
      outline: 2px solid ${palette.primary} !important;
      outline-offset: 3px;
    }
    input:focus, textarea:focus {
      outline: none !important;
      box-shadow: inset 0 -1px 0 ${palette.primary};
    }
  `}</style>;
}
