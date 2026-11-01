import { useId, useRef } from "react";
import ViewPermissionsPanel from "./view-permissions-panel";
import ViewShareTokensPanel from "./view-share-tokens-panel";
import useViewSharing from "@/src/features/owner/views/hooks/use-view-sharing";
import type { ViewToast } from "@/src/features/owner/views/types";
import type { OwnerView } from "@/src/types/view";
import styles from "./views.module.css";

type ViewAccessPanelProps = {
  view: OwnerView;
  onToast: (toast: ViewToast) => void;
};
const tabs = [
  { value: "permissions", label: "Người được cấp quyền" },
  { value: "tokens", label: "Link truy cập" },
] as const;

export default function ViewAccessPanel({
  view,
  onToast,
}: ViewAccessPanelProps) {
  const sharing = useViewSharing(view, onToast);
  const tabId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div>
      <div
        className={`ui-sharing-tabs ${styles.accessTabs}`}
        role="tablist"
        aria-label="Quản lý quyền truy cập"
      >
        {tabs.map((tab, index) => (
          <button
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            className="ui-sharing-tab"
            role="tab"
            id={`${tabId}-${tab.value}`}
            aria-controls={`${tabId}-panel`}
            aria-selected={sharing.activeTab === tab.value}
            tabIndex={sharing.activeTab === tab.value ? 0 : -1}
            type="button"
            key={tab.value}
            onClick={() => sharing.setActiveTab(tab.value)}
            onKeyDown={(event) => {
              const target =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? tabs.length - 1
                    : event.key === "ArrowRight"
                      ? (index + 1) % tabs.length
                      : event.key === "ArrowLeft"
                        ? (index - 1 + tabs.length) % tabs.length
                        : null;
              if (target === null) return;
              event.preventDefault();
              sharing.setActiveTab(tabs[target].value);
              tabRefs.current[target]?.focus();
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${tabId}-panel`}
        aria-labelledby={`${tabId}-${sharing.activeTab}`}
        tabIndex={0}
      >
        {sharing.activeTab === "permissions" ? (
          <ViewPermissionsPanel sharing={sharing} />
        ) : (
          <ViewShareTokensPanel sharing={sharing} />
        )}
      </div>
    </div>
  );
}
