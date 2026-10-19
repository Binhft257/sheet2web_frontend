import QueryFeedback from "@/src/components/common/query-feedback";
import { SharedButton } from "@/src/components/share";
import {
  formatDateTime,
  getErrorMessage,
  getPermissionUserEmail,
  getPermissionUserName,
} from "@/src/features/owner/views/view-utils";
import type { ViewSharingState } from "@/src/features/owner/views/hooks/use-view-sharing";

export default function ViewPermissionsPanel({
  sharing,
}: {
  sharing: ViewSharingState;
}) {
  const query = sharing.permissionsQuery;
  return (
    <div className="space-y-6">
      <form onSubmit={sharing.handleAddPermission}>
        <label className="ui-field-label" htmlFor="view-permission-email">
          Cấp quyền theo email
        </label>
        <div className="ui-permission-form">
          <input
            className="ui-form-control"
            id="view-permission-email"
            onChange={(event) => sharing.setEmail(event.target.value)}
            placeholder="user@example.com"
            type="email"
            value={sharing.email}
          />
          <SharedButton disabled={sharing.addPermissionPending} type="submit">
            Cấp quyền
          </SharedButton>
        </div>
      </form>
      <section aria-label="Người được cấp quyền">
        <h3 className="ui-subsection-title">Người có quyền xem</h3>
        <QueryFeedback
          isLoading={query.isPending}
          errorMessage={
            query.isError
              ? getErrorMessage(
                  query.error,
                  "Không thể tải danh sách phân quyền.",
                )
              : null
          }
          onRetry={() => query.refetch()}
          emptyMessage={
            !query.data?.length ? "Chưa có user nào được cấp quyền." : undefined
          }
        >
          <ul className="ui-sharing-list">
            {query.data?.map((permission) => (
              <li key={permission.id}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink [overflow-wrap:anywhere]">
                    {getPermissionUserName(permission)}
                  </p>
                  <p className="mt-1 text-muted [overflow-wrap:anywhere]">
                    {getPermissionUserEmail(permission)}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {permission.role ?? "viewer"} ·{" "}
                    {formatDateTime(permission.createdAt)}
                  </p>
                </div>
                <SharedButton
                  className="ui-danger-subtle"
                  size="sm"
                  variant="danger"
                  disabled={sharing.removePermissionPending}
                  onClick={() => sharing.handleRemovePermission(permission.id)}
                >
                  Gỡ quyền
                </SharedButton>
              </li>
            ))}
          </ul>
        </QueryFeedback>
      </section>
    </div>
  );
}
