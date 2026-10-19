"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/common/page-header";
import QueryFeedback from "@/src/components/common/query-feedback";
import Toast from "@/src/components/common/toast";
import { SharedButton } from "@/src/components/share";
import AddDataSourceModal from "@/src/components/owner/data-sources/add-data-source-modal";
import ViewStepper from "@/src/components/owner/views/view-stepper";
import WizardSourceStep from "@/src/components/owner/views/wizard/wizard-source-step";
import WizardConfigStep from "@/src/components/owner/views/wizard/wizard-config-step";
import WizardPublishStep from "@/src/components/owner/views/wizard/wizard-publish-step";
import useViewWizard from "@/src/features/owner/views/hooks/use-view-wizard";
import type { CreateViewWizardProps } from "@/src/features/owner/views/wizard-types";
import { pushAppPath } from "@/src/lib/app-path";

export default function CreateViewWizard(props: CreateViewWizardProps) {
  const router = useRouter();
  const wizard = useViewWizard(props);
  return (
    <section className="ui-view-wizard mx-auto flex w-full max-w-[1240px] flex-col gap-8">
      <Toast
        message={wizard.toastMessage?.message ?? null}
        tone={wizard.toastMessage?.type}
        onDismiss={wizard.dismissToast}
      />
      <PageHeader
        title={wizard.viewId ? "Chỉnh sửa view" : "Tạo view mới"}
        description="Chọn nguồn, cấu hình dữ liệu và xuất bản view của bạn."
        actions={
          <SharedButton
            variant="outlined"
            onClick={() => pushAppPath(router, "/owner/views")}
          >
            Hủy bỏ
          </SharedButton>
        }
      />
      <ViewStepper currentStep={wizard.currentStep} />
      <QueryFeedback
        isLoading={wizard.isHydrating}
        errorMessage={wizard.hydrationError}
        onRetry={wizard.retryView}
      >
        {wizard.currentStep === 1 ? <WizardSourceStep wizard={wizard} /> : null}
        {wizard.currentStep === 2 ? <WizardConfigStep wizard={wizard} /> : null}
        {wizard.currentStep === 3 ? (
          <WizardPublishStep wizard={wizard} />
        ) : null}
      </QueryFeedback>
      <AddDataSourceModal
        isSubmitting={wizard.isCreatingSource}
        onClose={wizard.closeAddModal}
        onSubmit={wizard.handleCreateDataSource}
        open={wizard.addModalOpen}
      />
    </section>
  );
}
