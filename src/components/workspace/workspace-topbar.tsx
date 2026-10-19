"use client";

import { getUserProfile } from "@/src/services/profile.service";
import { useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { appPath } from "@/src/lib/app-path";
import { useEffect, useId, useRef, useState } from "react";

type WorkspaceTopbarProps = {
  onMenuClick?: () => void;
  menuOpen?: boolean;
  menuId?: string;
  title: string;
};

function getProfileName(profile: Awaited<ReturnType<typeof getUserProfile>> | undefined) {
  return profile?.fullName || profile?.name || profile?.email || "Người dùng";
}

function getProfileEmail(profile: Awaited<ReturnType<typeof getUserProfile>> | undefined) {
  return profile?.email || "--";
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export default function WorkspaceTopbar({
  onMenuClick,
  menuOpen = false,
  menuId,
  title,
}: WorkspaceTopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileId = useId();
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const profileQuery = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: getUserProfile,
    enabled: profileOpen,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileButtonRef.current?.focus();
      }
    }
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const profile = profileQuery.data;

  return (
    <header className="ui-topbar">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick ? (
          <button
            aria-label="Mở menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            className="ui-icon-button lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <MenuIcon />
          </button>
        ) : null}
        <span className="block truncate text-sm font-medium text-muted" title={title}>
          {title}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="relative" ref={profileRef}>
          <button
            aria-expanded={profileOpen}
            aria-controls={profileOpen ? profileId : undefined}
            aria-label="Thông tin người dùng"
            className="ui-avatar"
            ref={profileButtonRef}
            onClick={() => setProfileOpen((open) => !open)}
            title="Thông tin người dùng"
            type="button"
          >
            S2
          </button>

          {profileOpen ? (
            <div className="ui-profile-panel" id={profileId} role="region" aria-label="Hồ sơ người dùng">
              <div className="border-b border-line px-5 py-5">
                <p className="text-xs font-medium text-muted">
                  Hồ sơ người dùng
                </p>
                {profileQuery.isPending ? (
                  <div className="mt-3 space-y-2" role="status" aria-label="Đang tải hồ sơ">
                    <div className="ui-skeleton h-5 w-40" />
                    <div className="ui-skeleton h-4 w-full" />
                  </div>
                ) : profileQuery.isError ? (
                  <p className="mt-3 text-sm text-danger" role="alert">
                    Không thể tải thông tin người dùng.
                  </p>
                ) : (
                  <div className="mt-3 min-w-0">
                    <p className="break-words text-base font-semibold text-ink">
                      {getProfileName(profile)}
                    </p>
                    <p className="mt-1 text-sm break-words text-muted [overflow-wrap:anywhere]">
                      {getProfileEmail(profile)}
                    </p>
                  </div>
                )}
              </div>

              {!profileQuery.isPending && !profileQuery.isError ? (
                <dl className="grid grid-cols-2 gap-4 px-5 py-4">
                  {profile?.role ? (
                    <div>
                      <dt className="text-xs text-muted">
                        Vai trò
                      </dt>
                      <dd className="mt-1 text-sm font-medium break-words text-ink">
                        {profile.role}
                      </dd>
                    </div>
                  ) : null}
                  {profile?.status ? (
                    <div>
                      <dt className="text-xs text-muted">
                        Trạng thái
                      </dt>
                      <dd className="mt-1 text-sm font-medium break-words text-ink">
                        {profile.status}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </div>
          ) : null}
        </div>

        <button
          className="ui-button"
          data-variant="outlined"
          onClick={() => signOut({ callbackUrl: appPath("/sign-in") })}
          type="button"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
