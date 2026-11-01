import { CopyIcon, ExternalIcon } from "@/src/components/common/icons";
import styles from "./views.module.css";

type ViewLinkActionsProps = {
  url: string;
  name: string;
  compact?: boolean;
  onCopy: (url: string) => void;
};

export default function ViewLinkActions({
  url,
  name,
  compact = false,
  onCopy,
}: ViewLinkActionsProps) {
  return (
    <div className={styles.linkActions}>
      <a
        className={styles.linkAction}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Mở trang ${name} trong tab mới`}
      >
        <ExternalIcon />
        Mở trang
      </a>
      <button
        className={styles.linkAction}
        type="button"
        onClick={() => onCopy(url)}
        aria-label={`Sao chép link: ${name}`}
        title="Sao chép link"
      >
        <CopyIcon />
        <span className={compact ? "sr-only" : undefined}>Sao chép link</span>
      </button>
    </div>
  );
}
