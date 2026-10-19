import { useId, useRef } from "react";
import Modal from "@/src/components/common/modal";
import Toast from "@/src/components/common/toast";
import {
  ViewAccessBadge,
  ViewStatusBadge,
} from "@/src/components/owner/views/view-badges";
import ViewPermissionsPanel from "@/src/components/owner/views/view-permissions-panel";
import ViewShareTokensPanel from "@/src/components/owner/views/view-share-tokens-panel";
import useViewSharing from "@/src/features/owner/views/hooks/use-view-sharing";
import { getPublishedUrl } from "@/src/features/owner/views/view-utils";
import type { ViewToast } from "@/src/features/owner/views/types";
import type { OwnerView } from "@/src/types/view";

type SharingTab = "permissions" | "tokens";
const tabs: { value: SharingTab; label: string }[] = [
  { value: "permissions", label: "Cấp quyền" },
  { value: "tokens", label: "Link chia sẻ" },
];

type ViewSharingModalProps = {
  view: OwnerView | null;
  onClose: () => void;
  onToast: (toast: ViewToast) => void;
  toast: ViewToast | null;
  onDismissToast: () => void;
};

export default function ViewSharingModal(props: ViewSharingModalProps) {
  const sharing = useViewSharing(props.view, props.onToast);
  const tabId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!props.view) return null;
  const view = props.view;
  const privateSharing = sharing.isPublished && sharing.isPrivate;

  return (
    <Modal
      open
      title={view.accessMode === "private" ? "Phân quyền view" : "Chia sẻ view"}
      description={view.name}
      size="lg"
      onClose={props.onClose}
    >
      <div className="ui-sharing-context">
        <ViewStatusBadge status={view.status} />
        <ViewAccessBadge accessMode={view.accessMode} />
      </div>
      {privateSharing ? (
        <div
          className="ui-sharing-tabs"
          role="tablist"
          aria-label="Cách chia sẻ view"
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
      ) : null}
      <div className={props.toast ? "ui-sharing-feedback" : undefined}>
        <Toast
          message={props.toast?.message ?? null}
          tone={props.toast?.type}
          placement="inline"
          onDismiss={props.onDismissToast}
        />
      </div>
      <div className="ui-modal-body">
        {privateSharing ? (
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
        ) : !sharing.isPublished ? (
          <p className="ui-sharing-notice">
            View cần được xuất bản trước khi chia sẻ.
          </p>
        ) : (
          <div className="space-y-5">
            <p className="ui-sharing-notice">
              View đang public, ai có link đều có thể xem.
            </p>
            <div className="ui-public-link-panel">
              <p className="ui-field-label">Link public</p>
              <p className="text-sm [overflow-wrap:anywhere]">
                {getPublishedUrl(view)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
