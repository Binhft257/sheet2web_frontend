import StatusBadge from "@/src/components/common/status-badge";
import QueryFeedback from "@/src/components/common/query-feedback";
import { SharedButton } from "@/src/components/share";
import {
  formatDateTime,
  getErrorMessage,
  isShareTokenRevoked,
} from "@/src/features/owner/views/view-utils";
import type { ViewSharingState } from "@/src/features/owner/views/hooks/use-view-sharing";

export default function ViewShareTokensPanel({
  sharing,
}: {
  sharing: ViewSharingState;
}) {
  const query = sharing.shareTokensQuery;
  const createdTokenUrl = sharing.createdTokenUrl;
  return (
    <div className="space-y-6">
      <form className="ui-token-form" onSubmit={sharing.handleCreateToken}>
        <div>
          <label className="ui-field-label" htmlFor="view-token-name">
            Tên link
          </label>
          <input
            className="ui-form-control"
            id="view-token-name"
            onChange={(event) => sharing.setTokenName(event.target.value)}
            placeholder="Tên link chia sẻ"
            type="text"
            value={sharing.tokenName}
          />
        </div>
        <div>
          <label className="ui-field-label" htmlFor="view-token-expires">
            Hết hạn
          </label>
          <input
            className="ui-form-control"
            id="view-token-expires"
            min={sharing.minTokenExpiresAt}
            onChange={(event) => sharing.setTokenExpiresAt(event.target.value)}
            type="datetime-local"
            value={sharing.tokenExpiresAt}
          />
        </div>
        <SharedButton disabled={sharing.createTokenPending} type="submit">
          Tạo link
        </SharedButton>
      </form>
      {createdTokenUrl ? (
        <div className="ui-created-link">
          <p className="font-medium">Link vừa tạo</p>
          <p className="mt-2 text-sm [overflow-wrap:anywhere]">
            {createdTokenUrl}
          </p>
          <SharedButton
            className="mt-4"
            size="sm"
            onClick={() => sharing.handleCopyModalLink(createdTokenUrl)}
          >
            Copy
          </SharedButton>
        </div>
      ) : null}
      <section aria-label="Link chia sẻ hiện có">
        <h3 className="ui-subsection-title">Link chia sẻ</h3>
        <QueryFeedback
          isLoading={query.isPending}
          errorMessage={
            query.isError
              ? getErrorMessage(query.error, "Không thể tải link chia sẻ.")
              : null
          }
          onRetry={() => query.refetch()}
          emptyMessage={
            !query.data?.length ? "Chưa có link chia sẻ nào." : undefined
          }
        >
          <ul className="ui-sharing-list ui-token-list">
            {query.data?.map((token) => {
              const shareUrl = sharing.getShareTokenUrl(token);
              const revoked = isShareTokenRevoked(token);
              return (
                <li key={token.id}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink [overflow-wrap:anywhere]">
                      {token.name || "Link chia sẻ"}
                    </p>
                    <div className="my-2 flex flex-wrap items-center gap-2">
                      <StatusBadge tone={revoked ? "danger" : "success"}>
                        {revoked ? "Đã thu hồi" : "Đang hoạt động"}
                      </StatusBadge>
                      {token.createdAt ? (
                        <span className="text-xs text-muted">
                          Tạo {formatDateTime(token.createdAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-muted [overflow-wrap:anywhere]">
                      {shareUrl || "Không có URL trả về"}
                    </p>
                    {token.expiresAt ? (
                      <p className="mt-2 text-xs text-muted">
                        Hết hạn {formatDateTime(token.expiresAt)}
                      </p>
                    ) : null}
                    {token.revokedAt ? (
                      <p className="mt-2 text-xs text-danger">
                        Thu hồi {formatDateTime(token.revokedAt)}
                      </p>
                    ) : null}
                    {token.lastUsedAt ? (
                      <p className="mt-2 text-xs text-muted">
                        Dùng lần cuối {formatDateTime(token.lastUsedAt)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SharedButton
                      size="sm"
                      variant="outlined"
                      disabled={!shareUrl || revoked}
                      onClick={() => sharing.handleCopyModalLink(shareUrl)}
                    >
                      Copy
                    </SharedButton>
                    <SharedButton
                      className="ui-danger-subtle"
                      size="sm"
                      variant="danger"
                      disabled={revoked || sharing.revokeTokenPending}
                      onClick={() => sharing.handleRevokeToken(token.id)}
                    >
                      {revoked ? "Đã thu hồi" : "Thu hồi"}
                    </SharedButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </QueryFeedback>
      </section>
    </div>
  );
}
