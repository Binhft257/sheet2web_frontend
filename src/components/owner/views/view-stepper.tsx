import { CheckIcon } from "@/src/components/common/icons";
import type { WizardStep } from "@/src/features/owner/views/wizard-types";

type ViewStepperProps = { currentStep: WizardStep; completed?: boolean };
const steps = [
  { step: 1, title: "Chọn nguồn dữ liệu" },
  { step: 2, title: "Cấu hình dữ liệu" },
  { step: 3, title: "Xuất bản" },
] as const;

export default function ViewStepper({
  currentStep,
  completed = false,
}: ViewStepperProps) {
  return (
    <ol className="ui-wizard-stepper" aria-label="Tiến trình tạo view">
      {steps.map((item) => {
        const active = !completed && item.step === currentStep;
        const stepCompleted = completed || item.step < currentStep;
        return (
          <li
            key={item.step}
            data-state={
              active ? "current" : stepCompleted ? "complete" : "upcoming"
            }
            aria-current={active ? "step" : undefined}
          >
            <span className="ui-wizard-step-number" aria-hidden="true">
              {stepCompleted ? <CheckIcon className="h-4 w-4" /> : item.step}
            </span>
            <span>
              {item.title}
              <span className="sr-only">
                {active
                  ? ", bước hiện tại"
                  : stepCompleted
                    ? ", đã hoàn thành"
                    : ", chưa thực hiện"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
