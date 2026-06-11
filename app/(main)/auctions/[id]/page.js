"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LoopIcon from "@mui/icons-material/Loop";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import PriceCheckOutlinedIcon from "@mui/icons-material/PriceCheckOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Pagination,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { auctionsApi } from "@/store/slices/auctions/auctionsApi";
import { ticketLevelsApi } from "@/store/slices/ticketLevels/ticketLevelsApi";
import { auctionParametersApi } from "@/store/slices/auctionParameters/auctionParametersApi";
import { auctionRunsApi } from "@/store/slices/auctionRuns/auctionRunsApi";
import { auctionParticipationsApi } from "@/store/slices/auctionParticipations/auctionParticipationsApi";
import { ticketsApi } from "@/store/slices/tickets/ticketsApi";
import { ticketSellbacksApi } from "@/store/slices/ticketSellbacks/ticketSellbacksApi";
import { freePassesApi } from "@/store/slices/freePasses/freePassesApi";
import { Table } from "@/components/ui/Table";

const PAGE_SIZE = 20;

// ─── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  draft:       { label: "پیش‌نویس",    dot: "#8da9d0", bg: "rgba(141,169,208,0.10)", border: "rgba(141,169,208,0.22)", text: "#8da9d0",  pulse: false },
  published:   { label: "منتشرشده",    dot: "#2762c8", bg: "rgba(39,98,200,0.10)",  border: "rgba(39,98,200,0.25)",   text: "#5f8bd9",  pulse: false },
  ticket_sale: { label: "فروش بلیت",  dot: "#a855f7", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)",  text: "#c084fc",  pulse: true  },
  active:      { label: "فعال",        dot: "#22ab94", bg: "rgba(34,171,148,0.12)", border: "rgba(34,171,148,0.28)",  text: "#22ab94",  pulse: true  },
  running:     { label: "در حال اجرا",dot: "#22ab94", bg: "rgba(34,171,148,0.12)", border: "rgba(34,171,148,0.28)",  text: "#22ab94",  pulse: true  },
  ended:       { label: "پایان‌یافته", dot: "#fdc500", bg: "rgba(253,197,0,0.08)",  border: "rgba(253,197,0,0.22)",   text: "#fdc500",  pulse: false },
  cancelled:   { label: "لغوشده",      dot: "#ff3547", bg: "rgba(255,53,71,0.10)",  border: "rgba(255,53,71,0.25)",   text: "#ff3547",  pulse: false },
};

const SELLBACK_STATUS = {
  pending:   { label: "در انتظار", color: "warning" },
  approved:  { label: "تأییدشده",  color: "success" },
  rejected:  { label: "ردشده",     color: "error" },
  completed: { label: "تکمیل‌شده", color: "info" },
};

const FREEPASS_STATUS = {
  active:  { label: "فعال",        color: "success" },
  used:    { label: "استفاده‌شده", color: "default" },
  expired: { label: "منقضی",       color: "error" },
};

// ─── Animations ────────────────────────────────────────────────────────────────

const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 currentColor; opacity: 0.7; }
  70%  { box-shadow: 0 0 0 6px currentColor; opacity: 0; }
  100% { box-shadow: 0 0 0 0 currentColor; opacity: 0; }
`;

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status, size = "md" }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status ?? "—", dot: "#8da9d0", bg: "rgba(141,169,208,0.10)", border: "rgba(141,169,208,0.22)", text: "#8da9d0", pulse: false };
  const isLg = size === "lg";
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: isLg ? 1 : 0.75, px: isLg ? 1.5 : 1.25, py: isLg ? 0.75 : 0.5, borderRadius: 2, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Box sx={{
        width: isLg ? 8 : 7, height: isLg ? 8 : 7, borderRadius: "50%", bgcolor: cfg.dot, flexShrink: 0,
        ...(cfg.pulse ? { color: cfg.dot, animation: `${pulseRing} 1.8s ease-out infinite` } : {}),
      }} />
      <Typography sx={{ fontSize: isLg ? 13 : 11.5, fontWeight: 700, color: cfg.text, lineHeight: 1 }}>
        {cfg.label}
      </Typography>
    </Box>
  );
}

// ─── Summary metric card ────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, accent = false }) {
  return (
    <Box sx={{
      p: { xs: 2, md: 2.5 },
      borderRadius: 3,
      border: "1px solid",
      borderColor: accent ? "modules.goldBorder" : "modules.glassBorder",
      background: accent ? "modules.goldGlass" : "rgba(255,255,255,0.03)",
      display: "flex", flexDirection: "column", gap: 1.25,
      transition: "border-color 200ms, background 200ms",
      "&:hover": {
        borderColor: accent ? "modules.goldBorderStrong" : "modules.glassBorderStrong",
        background: accent ? "rgba(253,197,0,0.1)" : "rgba(255,255,255,0.055)",
      },
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {Icon && (
          <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", background: accent ? "rgba(253,197,0,0.15)" : "rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <Icon sx={{ fontSize: 16, color: accent ? "secondary.main" : "text.disabled" }} />
          </Box>
        )}
        <Typography sx={{ fontSize: 11, color: "text.disabled", fontWeight: 500, lineHeight: 1.3 }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 800, color: accent ? "secondary.main" : "text.primary", letterSpacing: "-0.01em", lineHeight: 1, direction: "ltr", textAlign: "left" }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Info section heading ───────────────────────────────────────────────────────

function SectionHeading({ children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
      <Box sx={{ width: 3, height: 16, borderRadius: 2, bgcolor: "secondary.main", flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.disabled", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {children}
      </Typography>
    </Box>
  );
}

// ─── Field row ─────────────────────────────────────────────────────────────────

function FieldRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderBottom: "1px solid", borderColor: "modules.glassBorderLight", "&:last-child": { borderBottom: "none" } }}>
      <Typography sx={{ fontSize: 12, color: "text.disabled", flexShrink: 0, ml: 2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary", textAlign: "left", direction: typeof value === "string" && /\d/.test(value) ? "ltr" : "rtl" }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

// ─── Timeline event ────────────────────────────────────────────────────────────

function TimelineEvent({ label, date, isLast = false, isPast = false }) {
  const formatted = date ? new Date(date).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;
  return (
    <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid", borderColor: isPast ? "secondary.main" : "modules.glassBorderStrong", bgcolor: isPast ? "secondary.main" : "transparent", flexShrink: 0, mt: "3px", transition: "border-color 200ms, bgcolor 200ms" }} />
        {!isLast && <Box sx={{ width: 1, flexGrow: 1, minHeight: 28, bgcolor: "modules.glassBorderLight", mt: 0.5 }} />}
      </Box>
      <Box sx={{ pb: isLast ? 0 : 2.5, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, color: isPast ? "text.primary" : "text.disabled", fontWeight: isPast ? 600 : 400, mb: 0.25 }}>{label}</Typography>
        {formatted ? (
          <Typography sx={{ fontSize: 11, color: "text.disabled", direction: "ltr", display: "inline-block" }}>{formatted}</Typography>
        ) : (
          <Typography sx={{ fontSize: 11, color: "modules.glassBorderStrong", fontStyle: "italic" }}>تنظیم نشده</Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── InfoTab ────────────────────────────────────────────────────────────────────

function InfoTab({ auction }) {
  if (!auction) return null;
  const now = Date.now();

  const timelineItems = [
    { label: "تاریخ انتشار",      date: auction.published_at },
    { label: "شروع فروش بلیت",    date: auction.ticket_sale_starts_at },
    { label: "شروع قفل",          date: auction.lockdown_starts_at },
    { label: "تاریخ شروع",        date: auction.starts_at },
    { label: "تاریخ پایان",       date: auction.ends_at },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 380px" }, gap: 3, mt: 2 }}>

      {/* ── Left column: grouped sections ── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

        {/* Basic Info */}
        <SectionCard>
          <SectionHeading>اطلاعات پایه</SectionHeading>
          <FieldRow label="عنوان" value={auction.title} />
          <FieldRow label="محصول" value={auction.product?.title ?? auction.product?.name ?? auction.product_id ?? "—"} />
          <FieldRow label="نوع حراج" value={auction.type ?? "—"} />
          <FieldRow label="ارز" value={auction.currency ?? "—"} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1.25 }}>
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>وضعیت</Typography>
            <StatusBadge status={auction.status} />
          </Box>
        </SectionCard>

        {/* Pricing */}
        <SectionCard>
          <SectionHeading>قیمت‌گذاری</SectionHeading>
          <FieldRow label="قیمت محصول"  value={auction.product_price  ? Number(auction.product_price ).toLocaleString("en-US") + " T" : null} />
          <FieldRow label="قیمت شروع"   value={auction.starting_price ? Number(auction.starting_price).toLocaleString("en-US") + " T" : null} />
          <FieldRow label="نرخ تخفیف"   value={auction.discount_rate != null ? auction.discount_rate + "%" : null} />
        </SectionCard>

        {/* Rules */}
        <SectionCard>
          <SectionHeading>محدودیت‌ها و دوره‌ها</SectionHeading>
          <FieldRow label="تعداد دوره‌ها"         value={auction.total_runs ?? null} />
          <FieldRow label="دوره‌های کامل‌شده"     value={auction.completed_runs ?? null} />
          <FieldRow label="حداکثر بلیت هر کاربر"  value={auction.max_tickets_per_user ?? null} />
          {auction.parent_auction_id && (
            <FieldRow label="شناسه حراج والد" value={auction.parent_auction_id} />
          )}
        </SectionCard>
      </Box>

      {/* ── Right column: timeline ── */}
      <Box>
        <SectionCard sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
          <SectionHeading>جدول زمانی</SectionHeading>
          {timelineItems.map(({ label, date }, i) => (
            <TimelineEvent
              key={label}
              label={label}
              date={date}
              isLast={i === timelineItems.length - 1}
              isPast={date ? new Date(date).getTime() < now : false}
            />
          ))}
        </SectionCard>
      </Box>
    </Box>
  );
}

// ─── PaginatedTab ───────────────────────────────────────────────────────────────

function PaginatedTab({ fetcher, columns, emptyLabel, onFirstLoad }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reportedCount, setReportedCount] = useState(false);

  const doFetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetcher({ limit: PAGE_SIZE, page_number: page });
      const data = res?.data ?? [];
      const tot  = res?.total ?? 0;
      setRows(data);
      setTotal(tot);
      if (!reportedCount && onFirstLoad) {
        onFirstLoad(tot);
        setReportedCount(true);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, reportedCount, onFirstLoad]);

  useEffect(() => { doFetch(); }, [doFetch]);

  const pageCount = Math.ceil(total / PAGE_SIZE);
  return (
    <Box sx={{ mt: 2 }}>
      <Table columns={columns} rows={rows} loading={loading} emptyLabel={emptyLabel} />
      {pageCount > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
      )}
    </Box>
  );
}

// ─── Column definitions ─────────────────────────────────────────────────────────

const TICKET_LEVELS_COLS = [
  { key: "level",    label: "سطح",    render: (r) => <LevelBadge>{r.level}</LevelBadge> },
  { key: "title",    label: "عنوان",  render: (r) => <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{r.title ?? "—"}</Typography> },
  { key: "price",    label: "قیمت",   render: (r) => <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>{r.price ? Number(r.price).toLocaleString("en-US") + " T" : "—"}</Typography> },
  { key: "discount", label: "تخفیف",  render: (r) => <Typography sx={{ fontSize: 13 }}>{r.discount_percent != null ? r.discount_percent + "%" : "—"}</Typography> },
  { key: "stock",    label: "موجودی", render: (r) => <Typography sx={{ fontSize: 13 }}>{r.stock_quantity ?? "—"}</Typography> },
  { key: "max_pur",  label: "حداکثر خرید", render: (r) => <Typography sx={{ fontSize: 13 }}>{r.max_purchase_per_user ?? "—"}</Typography> },
  { key: "active",   label: "فعال",   render: (r) => <Chip label={r.is_active ? "فعال" : "غیرفعال"} color={r.is_active ? "success" : "default"} size="small" sx={{ fontSize: 11, height: 22 }} /> },
];

const PARAMS_COLS = [
  { key: "key",   label: "کلید",    render: (r) => <Typography sx={{ fontSize: 13, fontFamily: "monospace" }}>{r.key ?? r.name ?? "—"}</Typography> },
  { key: "value", label: "مقدار",   render: (r) => <Typography sx={{ fontSize: 13 }}>{r.value ?? "—"}</Typography> },
  { key: "desc",  label: "توضیحات", render: (r) => <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{r.description ?? "—"}</Typography> },
];

const RUNS_COLS = [
  { key: "run",   label: "شماره دوره", render: (r) => <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{r.run_number ?? r.id ?? "—"}</Typography> },
  { key: "status",label: "وضعیت",      render: (r) => <StatusBadge status={r.status} /> },
  { key: "start", label: "شروع",       render: (r) => <Typography sx={{ fontSize: 12, direction: "ltr", display: "inline-block" }}>{r.starts_at ? new Date(r.starts_at).toLocaleString("en-GB") : "—"}</Typography> },
  { key: "end",   label: "پایان",      render: (r) => <Typography sx={{ fontSize: 12, direction: "ltr", display: "inline-block" }}>{r.ends_at ? new Date(r.ends_at).toLocaleString("en-GB") : "—"}</Typography> },
];

const PARTICIPATION_COLS = [
  { key: "user",   label: "کاربر",          render: (r) => <UserCell user={r.user} /> },
  { key: "status", label: "وضعیت",          render: (r) => <StatusBadge status={r.status} /> },
  { key: "joined", label: "تاریخ مشارکت", render: (r) => <Typography sx={{ fontSize: 12, direction: "ltr", display: "inline-block" }}>{r.joined_at ? new Date(r.joined_at).toLocaleString("en-GB") : "—"}</Typography> },
];

const TICKETS_COLS = [
  { key: "user",   label: "کاربر",       render: (r) => <UserCell user={r.user} /> },
  { key: "level",  label: "سطح بلیت",    render: (r) => <Typography sx={{ fontSize: 12 }}>{r.ticket_level?.title ?? r.ticket_level?.level ?? "—"}</Typography> },
  { key: "qty",    label: "تعداد",       render: (r) => <Typography sx={{ fontSize: 13 }}>{r.quantity ?? "—"}</Typography> },
  { key: "price",  label: "قیمت خرید",  render: (r) => <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>{r.purchase_price ? Number(r.purchase_price).toLocaleString("en-US") + " T" : "—"}</Typography> },
  { key: "source", label: "منبع",        render: (r) => <Chip label={r.source ?? "—"} size="small" sx={{ fontSize: 11, height: 22 }} /> },
];

const SELLBACKS_COLS = [
  { key: "user",   label: "کاربر",              render: (r) => <UserCell user={r.user} /> },
  { key: "qty",    label: "تعداد",              render: (r) => <Typography sx={{ fontSize: 13 }}>{r.quantity ?? "—"}</Typography> },
  { key: "refund", label: "مبلغ بازپرداخت",    render: (r) => <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>{r.refund_amount ? Number(r.refund_amount).toLocaleString("en-US") + " T" : "—"}</Typography> },
  { key: "status", label: "وضعیت",              render: (r) => { const s = SELLBACK_STATUS[r.status] ?? { label: r.status, color: "default" }; return <Chip label={s.label} color={s.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />; } },
  { key: "date",   label: "تاریخ",              render: (r) => <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>{r.created_at ? new Date(r.created_at).toLocaleDateString("en-GB") : "—"}</Typography> },
];

const FREEPASSES_COLS = [
  { key: "user",   label: "کاربر",     render: (r) => <UserCell user={r.user} /> },
  { key: "qty",    label: "تعداد",     render: (r) => <Typography sx={{ fontSize: 13 }}>{r.quantity ?? 1}</Typography> },
  { key: "status", label: "وضعیت",    render: (r) => { const s = FREEPASS_STATUS[r.status] ?? { label: r.status, color: "default" }; return <Chip label={s.label} color={s.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />; } },
  { key: "note",   label: "یادداشت",  render: (r) => <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{r.note ?? "—"}</Typography> },
  { key: "date",   label: "تاریخ",    render: (r) => <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>{r.created_at ? new Date(r.created_at).toLocaleDateString("en-GB") : "—"}</Typography> },
];

// ─── Small reusable cells ───────────────────────────────────────────────────────

function UserCell({ user }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user?.first_name} {user?.last_name}</Typography>
      <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{user?.email}</Typography>
    </Box>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────────

const TAB_DEFS = [
  { label: "اطلاعات حراج",       counted: false },
  { label: "سطوح بلیت",          counted: false },
  { label: "قوانین و محدودیت‌ها",counted: false },
  { label: "دوره‌های حراج",      counted: true  },
  { label: "مشارکت‌های حراج",    counted: true  },
  { label: "بلیت‌های حراج",      counted: true  },
  { label: "بازخریدهای بلیت",    counted: true  },
  { label: "بلیت‌های ورود رایگان",counted: true },
];

export default function AuctionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState(null);
  const [loadingAuction, setLoadingAuction] = useState(true);
  const [tab, setTab] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState(new Set([0]));
  const [tabCounts, setTabCounts] = useState({});

  useEffect(() => {
    setLoadingAuction(true);
    auctionsApi.detail(id)
      .then((res) => setAuction(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLoadingAuction(false));
  }, [id]);

  const handleTab = (_, v) => {
    setTab(v);
    setVisitedTabs((prev) => new Set([...prev, v]));
  };

  const setCount = useCallback((tabIndex) => (count) => {
    setTabCounts((prev) => ({ ...prev, [tabIndex]: count }));
  }, []);

  const ticketLevelsFetcher    = useCallback((p) => ticketLevelsApi.list({    ...p, auction_id: id }), [id]);
  const parametersFetcher      = useCallback((p) => auctionParametersApi.list({...p, auction_id: id }), [id]);
  const runsFetcher             = useCallback((p) => auctionRunsApi.list({     ...p, auction_id: id }), [id]);
  const participationsFetcher  = useCallback((p) => auctionParticipationsApi.list({...p, auction_id: id }), [id]);
  const ticketsFetcher         = useCallback((p) => ticketsApi.list({         ...p, auction_id: id }), [id]);
  const sellbacksFetcher       = useCallback((p) => ticketSellbacksApi.list({ ...p, auction_id: id }), [id]);
  const freePassesFetcher      = useCallback((p) => freePassesApi.list({      ...p, auction_id: id }), [id]);

  const status = auction?.status;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  return (
    <Box>

      {/* ── Header ── */}
      <HeaderBanner sx={{ borderColor: cfg.border, background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(0,14,36,0) 70%)` }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <IconButton
            onClick={() => router.push("/auctions")}
            size="small"
            sx={{ mt: 0.5, color: "text.disabled", border: "1px solid", borderColor: "modules.glassBorder", borderRadius: 2, p: 0.75, "&:hover": { color: "secondary.main", borderColor: "modules.goldBorder", background: "modules.goldGlass" } }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.75 }}>
              <Typography sx={{ fontSize: 11, color: "text.disabled", fontWeight: 500 }}>جزئیات حراج</Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "modules.glassBorderStrong" }} />
              <Typography sx={{ fontSize: 11, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
                #{id}
              </Typography>
            </Box>

            {loadingAuction ? (
              <Skeleton variant="text" width={260} height={36} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2, fontSize: { xs: "1.5rem", md: "1.85rem" } }}>
                  {auction?.title ?? "حراج"}
                </Typography>
                <StatusBadge status={status} size="lg" />
              </Box>
            )}

            {!loadingAuction && auction?.product && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
                <CategoryOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                  {auction.product?.title ?? auction.product?.name}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </HeaderBanner>

      {/* ── Summary metrics ── */}
      {loadingAuction ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" }, gap: 1.5, mb: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={88} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 3 }} />
          ))}
        </Box>
      ) : auction && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" }, gap: 1.5, mb: 3 }}>
          <MetricCard icon={PriceCheckOutlinedIcon}     label="قیمت شروع"            value={auction.starting_price  ? Number(auction.starting_price ).toLocaleString("en-US") + " T" : "—"} accent />
          <MetricCard icon={StorefrontOutlinedIcon}     label="قیمت محصول"           value={auction.product_price   ? Number(auction.product_price  ).toLocaleString("en-US") + " T" : "—"} />
          <MetricCard icon={PercentOutlinedIcon}        label="نرخ تخفیف"            value={auction.discount_rate   != null ? auction.discount_rate + "%" : "—"} />
          <MetricCard icon={LoopIcon}                   label="دوره‌ها"              value={`${auction.completed_runs ?? 0} / ${auction.total_runs ?? "—"}`} />
          <MetricCard icon={ConfirmationNumberOutlinedIcon} label="حداکثر بلیت هر کاربر" value={auction.max_tickets_per_user ?? "—"} />
          <MetricCard icon={CalendarTodayOutlinedIcon}  label="تاریخ شروع"           value={auction.starts_at ? new Date(auction.starts_at).toLocaleDateString("en-GB") : "—"} />
        </Box>
      )}

      {/* ── Tabs ── */}
      <TabsBar>
        <Tabs
          value={tab}
          onChange={handleTab}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              minHeight: 48, px: 2.5, fontSize: 13, fontWeight: 500,
              color: "text.disabled",
              transition: "color 200ms",
              textTransform: "none",
            },
            "& .Mui-selected": { color: "secondary.main !important", fontWeight: 700 },
            "& .MuiTabs-indicator": {
              backgroundColor: "secondary.main",
              height: 2.5,
              borderRadius: "2px 2px 0 0",
            },
          }}
        >
          {TAB_DEFS.map(({ label, counted }, i) => {
            const count = tabCounts[i];
            return (
              <Tab
                key={i}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    {label}
                    {counted && count != null && (
                      <Box sx={{
                        minWidth: 18, height: 18, borderRadius: 9, px: 0.75,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        bgcolor: tab === i ? "rgba(253,197,0,0.18)" : "rgba(255,255,255,0.07)",
                        border: "1px solid",
                        borderColor: tab === i ? "modules.goldBorder" : "modules.glassBorderLight",
                        transition: "all 200ms",
                      }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: tab === i ? "secondary.main" : "text.disabled", lineHeight: 1 }}>
                          {count > 999 ? "999+" : count}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </TabsBar>

      {/* ── Tab content ── */}
      <Box sx={{ pt: 2, pb: 4 }}>
        {tab === 0 && <InfoTab auction={auction} />}
        {tab === 1 && visitedTabs.has(1) && <PaginatedTab fetcher={ticketLevelsFetcher}   columns={TICKET_LEVELS_COLS}  emptyLabel="سطح بلیتی یافت نشد"       onFirstLoad={setCount(1)} />}
        {tab === 2 && visitedTabs.has(2) && <PaginatedTab fetcher={parametersFetcher}     columns={PARAMS_COLS}         emptyLabel="پارامتری یافت نشد"         onFirstLoad={setCount(2)} />}
        {tab === 3 && visitedTabs.has(3) && <PaginatedTab fetcher={runsFetcher}           columns={RUNS_COLS}           emptyLabel="دوره‌ای یافت نشد"          onFirstLoad={setCount(3)} />}
        {tab === 4 && visitedTabs.has(4) && <PaginatedTab fetcher={participationsFetcher} columns={PARTICIPATION_COLS}  emptyLabel="مشارکتی یافت نشد"          onFirstLoad={setCount(4)} />}
        {tab === 5 && visitedTabs.has(5) && <PaginatedTab fetcher={ticketsFetcher}        columns={TICKETS_COLS}        emptyLabel="بلیتی یافت نشد"            onFirstLoad={setCount(5)} />}
        {tab === 6 && visitedTabs.has(6) && <PaginatedTab fetcher={sellbacksFetcher}      columns={SELLBACKS_COLS}      emptyLabel="بازخریدی یافت نشد"         onFirstLoad={setCount(6)} />}
        {tab === 7 && visitedTabs.has(7) && <PaginatedTab fetcher={freePassesFetcher}     columns={FREEPASSES_COLS}     emptyLabel="بلیت رایگانی یافت نشد"    onFirstLoad={setCount(7)} />}
      </Box>
    </Box>
  );
}

// ─── Styled components ──────────────────────────────────────────────────────────

const HeaderBanner = styled(Box)(({ theme }) => ({
  borderRadius: 16,
  border: "1px solid",
  padding: theme.spacing(2.5, 3),
  marginBottom: theme.spacing(2.5),
  transition: "border-color 300ms, background 300ms",
}));

const TabsBar = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.modules.glassBorder}`,
  background: "rgba(0,14,36,0.4)",
  borderRadius: "12px 12px 0 0",
  backdropFilter: "blur(8px)",
  marginBottom: 0,
}));

const SectionCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  border: `1px solid ${theme.palette.modules.glassBorder}`,
  background: "rgba(255,255,255,0.025)",
  transition: "border-color 200ms",
  "&:hover": {
    borderColor: theme.palette.modules.glassBorderStrong,
  },
}));

const LevelBadge = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: theme.palette.modules.goldGlass,
  border: `1px solid ${theme.palette.modules.goldBorder}`,
  fontSize: 12,
  fontWeight: 700,
  color: theme.palette.secondary.main,
}));
