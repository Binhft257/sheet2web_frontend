"use client";

import UpsertDataSourceModal from "@/src/components/owner/data-sources/upsert-data-source-modal";
import type { CreateDataSourceBody } from "@/src/types/data-source";

type AddDataSourceModalProps = {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateDataSourceBody) => Promise<void>;
};

export default function AddDataSourceModal({
  open,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddDataSourceModalProps) {
  return (
    <UpsertDataSourceModal
      isSubmitting={isSubmitting}
      mode="create"
      onClose={onClose}
      onSubmit={(values) => onSubmit(values as CreateDataSourceBody)}
      open={open}
    />
  );
}
