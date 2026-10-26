import { ExternalIcon, TableIcon } from "@/src/components/common/icons";
import StatusBadge from "@/src/components/common/status-badge";
import { SharedButton } from "@/src/components/share";
import { getUpdatedOrSharedLabel } from "@/src/components/viewer/workspace/viewer-shared-view-ui";
import type { ViewerSharedView } from "@/src/types/viewer";
import styles from "./viewer-dashboard.module.css";

type RecentSharedViewsProps = {
  views: ViewerSharedView[];
  onOpen: (view: ViewerSharedView) => void;
};

export default function RecentSharedViews({
  views,
  onOpen,
}: RecentSharedViewsProps) {
  return (
    <ul className={styles.viewList}>
      {views.map((view) => {
        const isPrivate = view.accessMode.trim().toLowerCase() === "private";
        return (
          <li className={styles.viewRow} key={view.id}>
            <span className={styles.viewIcon}>
              <TableIcon />
            </span>
            <div className={styles.viewContent}>
              <div className={styles.viewIdentity}>
                <h3>{view.name}</h3>
                <div className={styles.viewDetails}>
                  <StatusBadge
                    tone={isPrivate ? "neutral" : "info"}
                    showDot={false}
                  >
                    {isPrivate ? "Private" : "Public"}
                  </StatusBadge>
                  {view.snapshot ? (
                    <span>{view.snapshot.rowCount} dòng</span>
                  ) : null}
                </div>
              </div>
              <dl className={styles.viewMetadata}>
                <div>
                  <dt>Người chia sẻ</dt>
                  <dd>{view.owner.fullName || view.owner.email}</dd>
                </div>
                <div>
                  <dt>{view.sharedAt ? "Chia sẻ lúc" : "Cập nhật lúc"}</dt>
                  <dd>{getUpdatedOrSharedLabel(view)}</dd>
                </div>
              </dl>
              <SharedButton
                variant="outlined"
                className={styles.openButton}
                aria-label={`Xem View: ${view.name}`}
                onClick={() => onOpen(view)}
              >
                <ExternalIcon />
                Xem View
              </SharedButton>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
