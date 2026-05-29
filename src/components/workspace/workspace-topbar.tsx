"use client";

import { getUserProfile } from "@/src/services/profile.service";
import { useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

type WorkspaceTopbarProps = {
  title: string;
};

function getProfileName(profile: Awaited<ReturnType<typeof getUserProfile>> | undefined) {
  return profile?.fullName || profile?.name || profile?.email || "Người dùng";
}

function getProfileEmail(profile: Awaited<ReturnType<typeof getUserProfile>> | undefined) {
  return profile?.email || "--";
}

export default function WorkspaceTopbar({ title }: WorkspaceTopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
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

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [profileOpen]);

  const profile = profileQuery.data;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-100 bg-white/95 px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur sm:px-6">
      <div className="min-w-0">
        <span className="block truncate text-sm font-bold text-slate-900">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={profileRef}>
          <button
            aria-expanded={profileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800 ring-2 ring-white transition-colors hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            onClick={() => setProfileOpen((open) => !open)}
            title="Thông tin người dùng"
            type="button"
          >
            S2
          </button>

          {profileOpen ? (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.16)]">
              <div className="border-b border-slate-100 px-4 py-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Hồ sơ người dùng
                </p>
                {profileQuery.isPending ? (
                  <div className="mt-3 space-y-2">
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : profileQuery.isError ? (
                  <p className="mt-3 text-sm font-semibold text-red-600">
                    Không thể tải thông tin người dùng.
                  </p>
                ) : (
                  <div className="mt-3 min-w-0">
                    <p className="truncate text-base font-black text-slate-900">
                      {getProfileName(profile)}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                      {getProfileEmail(profile)}
                    </p>
                  </div>
                )}
              </div>

              {!profileQuery.isPending && !profileQuery.isError ? (
                <dl className="grid gap-3 px-4 py-4">
                  {profile?.role ? (
                    <div>
                      <dt className="text-xs font-bold uppercase text-slate-400">
                        Vai trò
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-800">
                        {profile.role}
                      </dd>
                    </div>
                  ) : null}
                  {profile?.status ? (
                    <div>
                      <dt className="text-xs font-bold uppercase text-slate-400">
                        Trạng thái
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-800">
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
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          type="button"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
