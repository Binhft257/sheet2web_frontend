import { useEffect, useRef } from "react";
import { CheckIcon } from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";
import { ViewAccessBadge } from "@/src/components/owner/views/view-badges";
import ViewLinkActions from "@/src/components/owner/views/view-link-actions";
import ViewAccessPanel from "@/src/components/owner/views/view-access-panel";
import type { ViewPublication } from "@/src/features/owner/views/wizard-types";
import type { ViewToast } from "@/src/features/owner/views/types";
import styles from "./wizard-complete.module.css";

type WizardCompleteStepProps = {
  publication: ViewPublication;
  onCopy: () => void;
  onBackToList: () => void;
  onToast: (toast: ViewToast) => void;
};

export default function WizardCompleteStep({
  publication,
  onCopy,
  onBackToList,
  onToast,
}: WizardCompleteStepProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isPrivate = publication.accessMode === "private";

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      className={`ui-panel ${styles.panel}`}
      aria-labelledby="publish-complete-title"
    >
      <div className={styles.heading}>
        <span className={styles.icon} aria-hidden="true">
          <CheckIcon />
        </span>
        <div>
          <h2 id="publish-complete-title" ref={headingRef} tabIndex={-1}>
            Xuất bản thành công
          </h2>
          <p className={styles.name}>{publication.name}</p>
        </div>
      </div>
      <div className={styles.linkPanel}>
        <div className={styles.linkHeading}>
          <h3>Link truy cập</h3>
          <ViewAccessBadge accessMode={publication.accessMode} />
        </div>
        <a
          className={styles.url}
          href={publication.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {publication.url}
          <span className="sr-only"> (mở trong tab mới)</span>
        </a>
        <ViewLinkActions
          url={publication.url}
          name={publication.name}
          onCopy={onCopy}
        />
        <p className={styles.help}>
          {isPrivate
            ? "Trang này ở chế độ riêng tư. Sao chép link trên không tự cấp quyền truy cập. Bạn có thể cấp quyền cho người xem hoặc tạo link chia sẻ riêng ngay bên dưới."
            : "Trang ở chế độ công khai. Bạn có thể gửi link này cho bất kỳ ai để xem dữ liệu."}
        </p>
      </div>
      {isPrivate ? (
        <section
          className={styles.accessSection}
          aria-labelledby="publish-access-title"
        >
          <div className={styles.accessHeading}>
            <h3 id="publish-access-title">Cấp quyền truy cập</h3>
            <p className={styles.help}>
              Cấp quyền cho người xem theo email hoặc tạo link chia sẻ riêng.
              Bạn cũng có thể quản lý lại trong Chi tiết trang dữ liệu.
            </p>
          </div>
          <ViewAccessPanel
            view={{
              id: publication.viewId,
              slug: publication.slug,
              status: "published",
              accessMode: publication.accessMode,
            }}
            onToast={onToast}
          />
        </section>
      ) : null}
      <div className={styles.actions}>
        <SharedButton onClick={onBackToList}>Về danh sách</SharedButton>
      </div>
    </section>
  );
}
