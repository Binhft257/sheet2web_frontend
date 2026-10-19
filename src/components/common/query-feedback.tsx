import type { ReactNode } from "react";
import { SharedButton } from "@/src/components/share";

type QueryFeedbackProps = {
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  emptyMessage?: string;
  children?: ReactNode;
};

export default function QueryFeedback({
  isLoading,
  errorMessage,
  onRetry,
  emptyMessage,
  children,
}: QueryFeedbackProps) {
  if (isLoading)
    return (
      <div
        className="space-y-3"
        role="status"
        aria-label="Đang tải dữ liệu"
        aria-busy="true"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <span className="ui-skeleton h-12 w-full" key={index} />
        ))}
      </div>
    );
  if (errorMessage)
    return (
      <div className="ui-alert" role="alert">
        <p>{errorMessage}</p>
        <SharedButton
          className="mt-3"
          size="sm"
          variant="outlined"
          onClick={onRetry}
        >
          Thử lại
        </SharedButton>
      </div>
    );
  if (emptyMessage) return <p className="ui-query-empty">{emptyMessage}</p>;
  return children;
}
