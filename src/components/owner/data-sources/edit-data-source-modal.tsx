"use client";

import UpsertDataSourceModal from "@/src/components/owner/data-sources/upsert-data-source-modal";
import type { DataSource, UpdateDataSourceBody } from "@/src/types/data-source";

type EditDataSourceModalProps = {
  open: boolean;
  dataSource: DataSource | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: UpdateDataSourceBody) => Promise<void>;
};

export default function EditDataSourceModal({
  open,
  dataSource,
  isSubmitting = false,
  onClose,
  onSubmit,
}: EditDataSourceModalProps) {
  return (
    <UpsertDataSourceModal
      dataSource={dataSource}
      isSubmitting={isSubmitting}
      mode="edit"
      onClose={onClose}
      onSubmit={(values) => onSubmit(values as UpdateDataSourceBody)}
      open={open}
    />
  );
}
