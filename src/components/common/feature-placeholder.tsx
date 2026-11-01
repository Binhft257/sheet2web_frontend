import AppLink from "@/src/components/app-link";
import PageHeader from "@/src/components/common/page-header";
import PageState from "@/src/components/common/page-state";
import styles from "./page-state.module.css";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export default function FeaturePlaceholder({
  title,
  description,
  backHref,
  backLabel,
}: FeaturePlaceholderProps) {
  return (
    <section className={styles.workspace}>
      <PageHeader title={title} />
      <PageState
        headingLevel="h2"
        title="Chưa có nội dung để hiển thị"
        description={description}
        actions={
          backHref ? (
            <AppLink
              className="ui-button"
              data-variant="outlined"
              href={backHref}
            >
              {backLabel ?? "Về tổng quan"}
            </AppLink>
          ) : undefined
        }
      />
    </section>
  );
}
