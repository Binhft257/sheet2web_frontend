"use client";

import { signOut } from "next-auth/react";
import { appPath } from "@/src/lib/app-path";
import AppLink from "@/src/components/app-link";
import type { ReactElement, SVGProps } from "react";
import BrandMark from "@/src/components/common/brand-mark";
import styles from "./workspace-picker.module.css";

type IconProps = SVGProps<SVGSVGElement>;

type WorkspaceOption = {
  href: string;
  title: string;
  description: string;
  Icon: (props: IconProps) => ReactElement;
};

function DatabaseIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="8.5" ry="3.5" />
      <path d="M3.5 5v6c0 1.9 3.8 3.5 8.5 3.5s8.5-1.6 8.5-3.5V5" />
      <path d="M3.5 11v6c0 1.9 3.8 3.5 8.5 3.5s8.5-1.6 8.5-3.5v-6" />
    </svg>
  );
}

function TableIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <path d="M3 10h18M8 10v10M16 10v10" />
    </svg>
  );
}

function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function LogoutIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M9 12h11m-3-3 3 3-3 3" />
    </svg>
  );
}

const workspaceOptions: WorkspaceOption[] = [
  {
    href: "/owner/dashboard",
    title: "Quản lý & xuất bản",
    description:
      "Kết nối Google Sheets, tạo giao diện và chia sẻ dữ liệu theo cách của bạn.",
    Icon: DatabaseIcon,
  },
  {
    href: "/viewer/dashboard",
    title: "Xem dữ liệu được chia sẻ",
    description:
      "Truy cập các trang dữ liệu đã xuất bản hoặc được chia sẻ với bạn.",
    Icon: TableIcon,
  },
];

function CheckIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

const sampleRows = [
  { name: "Website", team: "Thiết kế", complete: true },
  { name: "Nội dung", team: "Marketing", complete: false },
  { name: "Vận hành", team: "Sản phẩm", complete: true },
];

function PublishingIllustration() {
  return (
    <figure className={styles.illustration}>
      <div className={styles.canvas} aria-hidden="true">
        <div className={styles.sheetWindow}>
          <div className={styles.sheetTitle}>
            <TableIcon className={styles.sheetIcon} />
            <span>Bảng tính của bạn</span>
            <span className={styles.sheetMenu}><i /><i /><i /></span>
          </div>
          <div className={styles.sheetTabs}>
            <span className={styles.activeTab}>Tổng quan dự án</span>
            <span>Dữ liệu</span>
            <span>+</span>
          </div>
          <div className={styles.sheetGrid}>
            <div className={styles.columnLabels}><span /><span>A</span><span>B</span><span>C</span></div>
            <div className={styles.gridRow}><span>1</span><strong>Dự án</strong><strong>Phụ trách</strong><strong>Tiến độ</strong></div>
            {sampleRows.map((row, index) => (
              <div className={styles.gridRow} key={row.name}>
                <span>{index + 2}</span><span>{row.name}</span><span>{row.team}</span>
                <span><i className={row.complete ? styles.cellComplete : styles.cellProgress} /></span>
              </div>
            ))}
            <div className={styles.gridRow}><span>5</span><span /><span /><span /></div>
          </div>
          <div className={styles.sheetBottom}><span className={styles.selectionDot} />Google Sheets</div>
        </div>

        <div className={styles.connector}>
          <span className={styles.connectorLine} />
          <span className={styles.transformMark}><BrandMark /></span>
          <span className={styles.connectorLabel}>Từ bảng tính đến trang web</span>
          <svg viewBox="0 0 110 90" fill="none"><path d="M1 1h42a12 12 0 0 1 12 12v52a12 12 0 0 0 12 12h38" /><path d="m98 70 7 7-7 7" /></svg>
        </div>

        <div className={styles.publishedWindow}>
          <div className={styles.browserBar}>
            <span className={styles.browserDots}><i /><i /><i /></span>
            <span className={styles.address}><span className={styles.lockIcon} />Trang dữ liệu của bạn</span>
          </div>
          <div className={styles.publishedContent}>
            <div className={styles.publishedHeading}>
              <span className={styles.projectIcon}><TableIcon /></span>
              <span className={styles.publishedBadge}><CheckIcon />Đã xuất bản</span>
            </div>
            <h2>Tổng quan dự án</h2>
            <p>Mọi thông tin, trong một giao diện rõ ràng.</p>
            <div className={styles.publishedTable}>
              <div className={styles.publishedTableHeader}><span>Dự án</span><span>Phụ trách</span><span>Tiến độ</span></div>
              {sampleRows.map((row) => (
                <div className={styles.publishedRow} key={row.name}>
                  <span>{row.name}</span><span>{row.team}</span>
                  <span className={row.complete ? styles.statusComplete : styles.statusProgress}>{row.complete ? "Hoàn tất" : "Đang làm"}</span>
                </div>
              ))}
            </div>
            <div className={styles.publishedFooter}><BrandMark /><span>Được tạo với Sheet2Web</span></div>
          </div>
        </div>
      </div>
      <figcaption className={styles.figureCaption}>
        <span className={styles.captionLine} />
        Minh họa bảng tính được xuất bản thành trang dữ liệu
      </figcaption>
    </figure>
  );
}

export default function WorkspacePicker({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.workspace} ${className}`} lang="vi">
      <a className={styles.skipLink} href="#workspace-content">Đến nội dung chính</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <AppLink className={styles.brand} href="/" aria-label="Sheet2Web, trang chủ">
            <BrandMark className={styles.brandMark} />
            <span>Sheet2Web</span>
          </AppLink>
          <span className={styles.headerLabel}>Không gian làm việc</span>
          <button
            className={styles.logout}
            onClick={() => signOut({ callbackUrl: appPath("/sign-in") })}
            type="button"
          >
            <LogoutIcon />
            Đăng xuất
          </button>
        </div>
      </header>

      <main className={styles.main} id="workspace-content" tabIndex={-1}>
        <section className={styles.intro} aria-labelledby="workspace-heading">
          <p className={styles.welcome}>Chào mừng trở lại</p>
          <h1 id="workspace-heading">Không gian làm việc<br className={styles.desktopBreak} /> cho dữ liệu của bạn.</h1>
          <p className={styles.description}>Biến Google Sheets thành những trang dữ liệu rõ ràng, dễ truy cập và sẵn sàng để chia sẻ.</p>

          <nav className={styles.options} aria-label="Chọn không gian làm việc">
            {workspaceOptions.map(({ href, title, description, Icon }, index) => (
              <AppLink
                className={`${styles.option} ${index === 0 ? styles.ownerOption : styles.viewerOption}`}
                href={href}
                key={href}
              >
                <span className={styles.optionIcon}><Icon /></span>
                <div className={styles.optionContent}>
                  <h2 className={styles.optionTitle}>{title}</h2>
                  <p className={styles.optionDescription}>{description}</p>
                </div>
                <span className={styles.optionArrow}><ArrowRightIcon /></span>
              </AppLink>
            ))}
          </nav>
          <p className={styles.switchHint}><CheckIcon />Bạn có thể đổi không gian làm việc bất cứ lúc nào.</p>
        </section>
        <PublishingIllustration />
      </main>

      <footer className={styles.footer}>
        <span>Từ bảng tính đến trải nghiệm web.</span>
        <ol className={styles.workflow} aria-label="Quy trình xuất bản dữ liệu">
          <li>Kết nối<ArrowRightIcon /></li>
          <li>Tùy chỉnh<ArrowRightIcon /></li>
          <li>Chia sẻ</li>
        </ol>
      </footer>
    </div>
  );
}
