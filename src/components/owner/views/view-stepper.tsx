type ViewStepperProps = {
  currentStep: 1 | 2 | 3;
};

const steps = [
  {
    step: 1,
    title: "Chọn nguồn dữ liệu",
  },
  {
    step: 2,
    title: "Cấu hình dữ liệu",
  },
  {
    step: 3,
    title: "Xuất bản",
  },
] as const;

export default function ViewStepper({ currentStep }: ViewStepperProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((item, index) => {
          const active = item.step === currentStep;
          const completed = item.step < currentStep;
          const reached = active || completed;

          return (
            <div className="min-w-0" key={item.step}>
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    reached
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.step}
                </span>
                <span
                  className={`truncate text-sm font-bold ${
                    reached ? "text-blue-900" : "text-slate-500"
                  }`}
                >
                  {item.title}
                </span>
              </div>
              <div
                className={`mt-3 h-1.5 rounded-full ${
                  item.step < currentStep
                    ? "bg-blue-700"
                    : active
                      ? "bg-blue-700"
                      : "bg-slate-200"
                } ${index === steps.length - 1 && !active ? "bg-slate-200" : ""}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
