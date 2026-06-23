/* @ds-bundle: {"format":3,"namespace":"FlexIDTrackerDesignSystem_019e12","components":[],"sourceHashes":{"ui_kits/tracker/App.jsx":"699e44b93909","ui_kits/tracker/components.jsx":"7654ecd44a8e","ui_kits/tracker/data.jsx":"caec10f23f0d","ui_kits/tracker/icons.jsx":"b29590ab57dc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FlexIDTrackerDesignSystem_019e12 = window.FlexIDTrackerDesignSystem_019e12 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/tracker/App.jsx
try { (() => {
// FlexID Tracker — top-level App that ties components together.
const {
  useState,
  useEffect,
  useMemo
} = React;
function FlexIDApp() {
  const [view, setView] = useState("assigned"); // assigned | mentioned | slack
  const [groupBy, setGroupBy] = useState("priority"); // priority | project | none
  const [projectFilter, setProjectFilter] = useState("all");
  const [selected, setSelected] = useState(null); // {kind, id}
  const [collapsed, setCollapsed] = useState({}); // group key → bool
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("just now");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scenario, setScenario] = useState("normal"); // normal | empty | error | loading

  useEffect(() => {
    const t = setInterval(() => {
      setLastSync(prev => {
        if (prev === "just now") return "1m ago";
        const m = parseInt(prev) || 0;
        return `${m + 1}m ago`;
      });
    }, 60_000);
    return () => clearInterval(t);
  }, []);
  function refresh() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync("just now");
    }, 900);
  }
  function toggleGroup(key) {
    setCollapsed(c => ({
      ...c,
      [key]: !c[key]
    }));
  }
  const data = useMemo(() => {
    if (scenario === "empty") return {
      jiraAssigned: [],
      jiraMentioned: [],
      slack: []
    };
    return MOCK_DATA;
  }, [scenario]);

  // Source list + project filter
  const sourceIssues = useMemo(() => {
    if (view === "slack") return [];
    const src = view === "assigned" ? data.jiraAssigned : data.jiraMentioned;
    let filtered = src;
    if (projectFilter !== "all") filtered = filtered.filter(i => i.proj === projectFilter);
    return filtered.slice().sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [view, data, projectFilter]);
  const counts = {
    assigned: data.jiraAssigned.length,
    mentioned: data.jiraMentioned.length,
    slack: data.slack.length
  };
  const selectedItem = useMemo(() => {
    if (!selected) return null;
    if (selected.kind === "slack") return data.slack.find(s => s.id === selected.id);
    return [...data.jiraAssigned, ...data.jiraMentioned].find(i => i.key === selected.id);
  }, [selected, data]);
  const projects = useMemo(() => Array.from(new Set(data.jiraAssigned.map(i => i.proj))).sort(), [data]);

  // Body
  let body;
  if (scenario === "loading") {
    body = /*#__PURE__*/React.createElement("div", {
      className: "list-wrap"
    }, /*#__PURE__*/React.createElement(LoadingRows, {
      count: 8
    }));
  } else if (scenario === "error") {
    body = /*#__PURE__*/React.createElement("div", {
      className: "list-wrap"
    }, /*#__PURE__*/React.createElement(ErrorState, {
      source: view === "slack" ? "Slack" : "Jira",
      onRetry: refresh
    }));
  } else if (view === "slack") {
    if (data.slack.length === 0) {
      body = /*#__PURE__*/React.createElement("div", {
        className: "list-wrap"
      }, /*#__PURE__*/React.createElement(EmptyState, {
        kind: "slacknone"
      }));
    } else {
      body = /*#__PURE__*/React.createElement("div", {
        className: "list-wrap"
      }, /*#__PURE__*/React.createElement(GroupedSlackList, {
        items: data.slack,
        selected: selected,
        onSelect: setSelected,
        collapsed: collapsed,
        onToggle: toggleGroup
      }));
    }
  } else if (sourceIssues.length === 0) {
    const kind = view === "assigned" ? projectFilter !== "all" ? "filtered" : "none" : "nomentions";
    body = /*#__PURE__*/React.createElement("div", {
      className: "list-wrap"
    }, /*#__PURE__*/React.createElement(EmptyState, {
      kind: kind
    }));
  } else {
    body = /*#__PURE__*/React.createElement("div", {
      className: "list-wrap"
    }, /*#__PURE__*/React.createElement(FilterBar, {
      projectFilter: projectFilter,
      onProject: setProjectFilter,
      projects: projects,
      total: view === "assigned" ? data.jiraAssigned.length : data.jiraMentioned.length,
      shown: sourceIssues.length,
      groupBy: groupBy,
      onGroupBy: setGroupBy
    }), /*#__PURE__*/React.createElement(GroupedIssueList, {
      issues: sourceIssues,
      groupBy: groupBy,
      selected: selected,
      onSelect: setSelected,
      view: view,
      collapsed: collapsed,
      onToggle: toggleGroup
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "mac-window"
  }, /*#__PURE__*/React.createElement(TitleBar, {
    syncing: syncing,
    onRefresh: refresh,
    onSettings: () => setSettingsOpen(true),
    lastSync: lastSync
  }), /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(StatsBar, {
    data: data,
    view: view,
    onView: setView
  }), /*#__PURE__*/React.createElement(Tabs, {
    view: view,
    onView: v => {
      setView(v);
      setSelected(null);
    },
    counts: counts
  }), /*#__PURE__*/React.createElement("div", {
    className: "app-body"
  }, body, /*#__PURE__*/React.createElement(DetailPane, {
    kind: selected?.kind,
    item: selectedItem,
    onClose: () => setSelected(null),
    onSelect: setSelected
  }))), /*#__PURE__*/React.createElement(SettingsModal, {
    open: settingsOpen,
    onClose: () => setSettingsOpen(false)
  }), /*#__PURE__*/React.createElement(ScenarioBar, {
    scenario: scenario,
    onScenario: setScenario
  }));
}
function ScenarioBar({
  scenario,
  onScenario
}) {
  const opts = [{
    id: "normal",
    label: "Normal"
  }, {
    id: "loading",
    label: "Loading"
  }, {
    id: "empty",
    label: "Empty"
  }, {
    id: "error",
    label: "Error"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      bottom: -42,
      transform: "translateX(-50%)",
      display: "flex",
      gap: 4,
      padding: 4,
      background: "var(--surface-overlay)",
      border: "1px solid var(--hairline-strong)",
      borderRadius: 8,
      boxShadow: "var(--shadow-popover)"
    }
  }, opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    onClick: () => onScenario(o.id),
    style: {
      fontSize: 11,
      padding: "4px 10px",
      borderRadius: 4,
      color: scenario === o.id ? "var(--fg-strong)" : "var(--fg-muted)",
      background: scenario === o.id ? "var(--surface-raised)" : "transparent",
      cursor: "pointer"
    }
  }, o.label)));
}
window.FlexIDApp = FlexIDApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tracker/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tracker/components.jsx
try { (() => {
// FlexID Tracker UI kit components — grouped lists, project stripes, alert blockers.
// Pixel-fidelity recreation of the cockpit. No real network — fakes via timeouts.

const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;

// ───────── Small helpers ─────────
const MIDDOT = "\u00B7";
const ARROW_UP = "\u2191";
const ARROW_DN = "\u2193";

// Project → accent color (small left-edge stripe). Calm, dark-mode-tuned.
const PROJECT_COLORS = {
  FLEXID: "#8B7BFF",
  DOCS: "#46A37C",
  SDK: "#3D8FE0",
  PLAT: "#D88E2A",
  GROW: "#E26B6B",
  SEC: "#5DB7B7"
};
const projectColor = p => PROJECT_COLORS[p] || "#5C5C68";

// ───────── Chrome ─────────
function TitleBar({
  syncing,
  onRefresh,
  onSettings,
  lastSync
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "titlebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lights"
  }, /*#__PURE__*/React.createElement("span", {
    className: "red"
  }), /*#__PURE__*/React.createElement("span", {
    className: "yellow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "green"
  })), /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, "FlexID Work Tracker"), /*#__PURE__*/React.createElement("div", {
    className: "right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sync-pill"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot" + (syncing ? " syncing" : "")
  }), syncing ? "Syncing…" : `Synced ${lastSync}`), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn" + (syncing ? " spin" : ""),
    onClick: onRefresh,
    title: "Refresh (\u2318R)",
    "aria-label": "Refresh"
  }, /*#__PURE__*/React.createElement(IconRefresh, {
    className: "icon"
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    onClick: onSettings,
    title: "Settings",
    "aria-label": "Settings"
  }, /*#__PURE__*/React.createElement(IconSettings, {
    className: "icon"
  }))));
}
function StatsBar({
  data,
  view,
  onView
}) {
  const open = data.jiraAssigned.length;
  const blockers = data.jiraAssigned.filter(i => i.priority === "blocker" || i.priority === "critical").length;
  const mentioned = data.jiraMentioned.length;
  const slackMentions = data.slack.length;
  const cells = [{
    id: "assigned",
    label: "Open assigned",
    value: open,
    kind: open === 0 ? "zero" : null
  }, {
    id: "assigned",
    label: "Blockers / Crit.",
    value: blockers,
    kind: blockers > 0 ? "alert" : "zero",
    dot: blockers > 0 ? "var(--pri-blocker)" : null
  }, {
    id: "mentioned",
    label: "Mentioned in Jira",
    value: mentioned,
    kind: mentioned === 0 ? "zero" : null
  }, {
    id: "slack",
    label: "Slack @mentions",
    value: slackMentions,
    kind: slackMentions === 0 ? "zero" : null
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, cells.map((c, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: "stat-cell" + (c.kind ? " " + c.kind : ""),
    onClick: () => onView(c.id),
    "aria-pressed": view === c.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, c.dot && /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: c.dot
    }
  }), String(c.value).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, c.label))));
}
function Tabs({
  view,
  onView,
  counts
}) {
  const t = [{
    id: "assigned",
    label: "Assigned to me",
    count: counts.assigned
  }, {
    id: "mentioned",
    label: "Jira mentions",
    count: counts.mentioned
  }, {
    id: "slack",
    label: "Slack",
    count: counts.slack
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "tabs",
    role: "tablist"
  }, t.map(x => /*#__PURE__*/React.createElement("button", {
    key: x.id,
    className: "tab",
    role: "tab",
    "aria-selected": view === x.id,
    onClick: () => onView(x.id)
  }, x.label, /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, x.count))));
}

// ───────── Filter bar ─────────
function FilterBar({
  projectFilter,
  onProject,
  projects,
  total,
  shown,
  groupBy,
  onGroupBy
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "filter-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "filter-label"
  }, "Group"), [{
    id: "priority",
    label: "Priority"
  }, {
    id: "project",
    label: "Project"
  }, {
    id: "none",
    label: "Flat"
  }].map(g => /*#__PURE__*/React.createElement("button", {
    key: g.id,
    className: "filter-pill",
    "aria-pressed": groupBy === g.id,
    onClick: () => onGroupBy(g.id)
  }, g.label)), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }), /*#__PURE__*/React.createElement("span", {
    className: "filter-label"
  }, "Project"), ["all", ...projects].map(pj => /*#__PURE__*/React.createElement("button", {
    key: pj,
    className: "filter-pill",
    "aria-pressed": projectFilter === pj,
    onClick: () => onProject(pj),
    style: pj !== "all" ? {
      "--pj-dot": projectColor(pj)
    } : null
  }, pj !== "all" && /*#__PURE__*/React.createElement("span", {
    className: "pj-dot",
    style: {
      background: projectColor(pj)
    }
  }), pj === "all" ? "All" : pj)), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, shown, "/", total));
}

// ───────── Issue row ─────────
const PRIORITY_ORDER = {
  blocker: 0,
  critical: 1,
  major: 2,
  minor: 3,
  trivial: 4
};
function statusLabel(s) {
  return {
    todo: "To Do",
    progress: "In Progress",
    review: "In Review",
    blocked: "Blocked",
    done: "Done"
  }[s] || s;
}
function IssueRow({
  issue,
  selected,
  onSelect,
  showMentionCtx
}) {
  const isBlocker = issue.priority === "blocker";
  return /*#__PURE__*/React.createElement("div", {
    className: "row" + (isBlocker ? " row-alert" : ""),
    "aria-selected": selected,
    onClick: () => onSelect(issue.key)
  }, /*#__PURE__*/React.createElement("span", {
    className: "row-stripe",
    style: {
      background: projectColor(issue.proj)
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "pri-dot " + issue.priority,
    title: issue.priority
  }), /*#__PURE__*/React.createElement("span", {
    className: "key",
    onClick: e => {
      e.stopPropagation();
      window.open(`#jira/${issue.key}`, "_blank");
    }
  }, issue.key), /*#__PURE__*/React.createElement("span", {
    className: "summary"
  }, showMentionCtx && issue.mentionCtx && /*#__PURE__*/React.createElement("span", {
    className: "mention-ctx"
  }, issue.mentionCtx, " " + MIDDOT + " "), issue.summary), /*#__PURE__*/React.createElement("span", {
    className: "status-pill " + issue.status
  }, statusLabel(issue.status)), /*#__PURE__*/React.createElement("span", {
    className: "proj"
  }, issue.proj), /*#__PURE__*/React.createElement("span", {
    className: "when"
  }, issue.when));
}

// ───────── Section header ─────────
function SectionHeader({
  kind,
  label,
  count,
  color,
  collapsed,
  onToggle,
  alert
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "section-head" + (alert ? " section-alert" : ""),
    onClick: onToggle
  }, /*#__PURE__*/React.createElement("span", {
    className: "section-chev" + (collapsed ? " collapsed" : "")
  }, /*#__PURE__*/React.createElement(IconChevron, {
    className: "icon",
    style: {
      width: 10,
      height: 10
    }
  })), color && /*#__PURE__*/React.createElement("span", {
    className: "section-dot",
    style: {
      background: color
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "section-label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "section-count"
  }, count), alert && /*#__PURE__*/React.createElement("span", {
    className: "section-tag"
  }, "requires attention"));
}

// ───────── Slack row ─────────
function SlackRow({
  msg,
  selected,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "slack-row",
    "aria-selected": selected,
    onClick: () => onSelect(msg.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar",
    style: {
      background: msg.avatar
    }
  }, msg.initials), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, msg.user), /*#__PURE__*/React.createElement("span", {
    className: "channel"
  }, "#", msg.channel), /*#__PURE__*/React.createElement("span", {
    className: "when"
  }, msg.when)), /*#__PURE__*/React.createElement("div", {
    className: "text",
    dangerouslySetInnerHTML: {
      __html: msg.text.replace(/@you/g, '<mark>@you</mark>')
    }
  })));
}

// ───────── Detail pane ─────────
function DetailPane({
  kind,
  item,
  onClose,
  onSelect
}) {
  if (!item) {
    return /*#__PURE__*/React.createElement("aside", {
      className: "detail"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-h"
    }, /*#__PURE__*/React.createElement("span", {
      className: "label"
    }, "Detail")), /*#__PURE__*/React.createElement("div", {
      className: "empty",
      style: {
        borderLeft: "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "title",
      style: {
        color: "var(--fg-subtle)"
      }
    }, "Select a row"), /*#__PURE__*/React.createElement("div", {
      className: "sub"
    }, "Use ", ARROW_UP, " ", ARROW_DN, " to scan, Enter to open.")));
  }
  return /*#__PURE__*/React.createElement("aside", {
    className: "detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, kind === "slack" ? "Slack mention" : "Issue"), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    onClick: onClose,
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(IconClose, {
    className: "icon"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "detail-body"
  }, kind === "slack" ? /*#__PURE__*/React.createElement(SlackDetail, {
    msg: item,
    onSelect: onSelect
  }) : /*#__PURE__*/React.createElement(IssueDetail, {
    issue: item,
    onSelect: onSelect
  })));
}
function IssueDetail({
  issue,
  onSelect
}) {
  const related = getRelatedFor(issue.key);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    className: "key-link",
    href: `#jira/${issue.key}`,
    target: "_blank",
    rel: "noreferrer"
  }, issue.key, " ", /*#__PURE__*/React.createElement(IconExternal, {
    className: "icon"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: 6
    }
  }, issue.summary)), /*#__PURE__*/React.createElement("div", {
    className: "pill-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-pill " + issue.status
  }, statusLabel(issue.status)), /*#__PURE__*/React.createElement("span", {
    className: "status-pill " + issue.priority,
    style: {
      background: `var(--pri-${issue.priority}-bg)`,
      color: `var(--pri-${issue.priority})`
    }
  }, issue.priority[0].toUpperCase() + issue.priority.slice(1))), /*#__PURE__*/React.createElement("dl", {
    className: "meta-grid"
  }, /*#__PURE__*/React.createElement("dt", null, "Project"), /*#__PURE__*/React.createElement("dd", {
    className: "mono"
  }, issue.proj), /*#__PURE__*/React.createElement("dt", null, "Assignee"), /*#__PURE__*/React.createElement("dd", null, issue.assignee), /*#__PURE__*/React.createElement("dt", null, "Reporter"), /*#__PURE__*/React.createElement("dd", null, issue.reporter), /*#__PURE__*/React.createElement("dt", null, "Updated"), /*#__PURE__*/React.createElement("dd", null, issue.updated), issue.mentionCtx && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("dt", null, "Why here"), /*#__PURE__*/React.createElement("dd", null, issue.mentionCtx))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: `#jira/${issue.key}`,
    target: "_blank",
    rel: "noreferrer"
  }, "Open in Jira ", /*#__PURE__*/React.createElement(IconExternal, {
    className: "icon"
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary"
  }, "Copy link")), /*#__PURE__*/React.createElement(RelatedPanel, {
    related: related,
    issueKey: issue.key,
    onSelect: onSelect
  }));
}

// ───────── Related panel (cross-surface signals for a Jira issue) ─────────
function RelatedPanel({
  related,
  issueKey,
  onSelect
}) {
  const total = related.slack.length + related.emails.length + related.linked.length;
  if (total === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "related"
    }, /*#__PURE__*/React.createElement("div", {
      className: "related-header"
    }, /*#__PURE__*/React.createElement("span", {
      className: "t-caps"
    }, "Related"), /*#__PURE__*/React.createElement("span", {
      className: "related-count"
    }, "0")), /*#__PURE__*/React.createElement("div", {
      className: "related-empty"
    }, "No cross-references found yet."));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "related"
  }, /*#__PURE__*/React.createElement("div", {
    className: "related-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-caps"
  }, "Related"), /*#__PURE__*/React.createElement("span", {
    className: "related-count"
  }, total)), related.slack.length > 0 && /*#__PURE__*/React.createElement(RelatedSection, {
    icon: /*#__PURE__*/React.createElement(IconSlack, {
      className: "icon"
    }),
    label: "Slack",
    count: related.slack.length,
    accent: "#E26B6B"
  }, related.slack.slice(0, 4).map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    className: "related-row",
    onClick: () => onSelect && onSelect({
      kind: "slack",
      id: m.id
    })
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-avatar",
    style: {
      background: m.avatar
    }
  }, m.initials), /*#__PURE__*/React.createElement("span", {
    className: "r-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-name"
  }, m.user), /*#__PURE__*/React.createElement("span", {
    className: "r-channel"
  }, "#", m.channel), m.mention && /*#__PURE__*/React.createElement("span", {
    className: "r-badge"
  }, "@you"), /*#__PURE__*/React.createElement("span", {
    className: "r-when"
  }, m.when)), /*#__PURE__*/React.createElement("span", {
    className: "r-text"
  }, m.text.replace(/@you/g, "@you"))))), related.slack.length > 4 && /*#__PURE__*/React.createElement("a", {
    className: "related-more"
  }, "See all ", related.slack.length, " in Slack ", /*#__PURE__*/React.createElement(IconExternal, {
    className: "icon"
  }))), related.emails.length > 0 && /*#__PURE__*/React.createElement(RelatedSection, {
    icon: /*#__PURE__*/React.createElement(IconMail, {
      className: "icon"
    }),
    label: "Email",
    count: related.emails.length,
    accent: "#5DA9FF"
  }, related.emails.slice(0, 4).map(m => /*#__PURE__*/React.createElement("a", {
    key: m.id,
    className: "related-row",
    href: `#mail/${m.id}`,
    target: "_blank",
    rel: "noreferrer"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-mail-dot" + (m.unread ? " unread" : "")
  }), /*#__PURE__*/React.createElement("span", {
    className: "r-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-name"
  }, m.from), /*#__PURE__*/React.createElement("span", {
    className: "r-when"
  }, m.when)), /*#__PURE__*/React.createElement("span", {
    className: "r-subject"
  }, m.subject), /*#__PURE__*/React.createElement("span", {
    className: "r-text"
  }, m.preview)))), related.emails.length > 4 && /*#__PURE__*/React.createElement("a", {
    className: "related-more"
  }, "See all ", related.emails.length, " in Gmail ", /*#__PURE__*/React.createElement(IconExternal, {
    className: "icon"
  }))), related.linked.length > 0 && /*#__PURE__*/React.createElement(RelatedSection, {
    icon: /*#__PURE__*/React.createElement(IconLink, {
      className: "icon"
    }),
    label: "Jira links",
    count: related.linked.length,
    accent: "#8B7BFF"
  }, related.linked.map(l => /*#__PURE__*/React.createElement("button", {
    key: l.key,
    className: "related-row",
    onClick: () => onSelect && onSelect({
      kind: "assigned",
      id: l.key
    })
  }, /*#__PURE__*/React.createElement("span", {
    className: "pri-dot " + l.issue.priority
  }), /*#__PURE__*/React.createElement("span", {
    className: "r-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-rel"
  }, l.rel), /*#__PURE__*/React.createElement("span", {
    className: "mono r-name"
  }, l.key), /*#__PURE__*/React.createElement("span", {
    className: "status-pill " + l.issue.status,
    style: {
      marginLeft: "auto"
    }
  }, statusLabel(l.issue.status))), /*#__PURE__*/React.createElement("span", {
    className: "r-subject"
  }, l.issue.summary))))));
}
function RelatedSection({
  icon,
  label,
  count,
  accent,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "related-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "related-section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-icon",
    style: {
      color: accent
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    className: "r-label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "r-count"
  }, count)), /*#__PURE__*/React.createElement("div", {
    className: "related-rows"
  }, children));
}
function SlackDetail({
  msg,
  onSelect
}) {
  const refIssues = getReferencedIssues(msg.refs);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar",
    style: {
      width: 36,
      height: 36,
      borderRadius: 8,
      background: msg.avatar,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 600,
      fontSize: 13
    }
  }, msg.initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--fg-strong)"
    }
  }, msg.user), /*#__PURE__*/React.createElement("div", {
    className: "t-meta"
  }, "in #", msg.channel, " ", MIDDOT, " ", msg.when, " ago"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: "20px",
      color: "var(--fg)",
      padding: 12,
      borderRadius: 6,
      background: "var(--canvas)",
      border: "1px solid var(--hairline)"
    },
    dangerouslySetInnerHTML: {
      __html: msg.text.replace(/@you/g, '<mark style="background:var(--accent-halo);color:var(--accent);padding:0 3px;border-radius:2px">@you</mark>')
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: `#slack/${msg.id}`,
    target: "_blank",
    rel: "noreferrer"
  }, "Open thread ", /*#__PURE__*/React.createElement(IconExternal, {
    className: "icon"
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary"
  }, "Mark read")), refIssues.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "related"
  }, /*#__PURE__*/React.createElement("div", {
    className: "related-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-caps"
  }, "Referenced issues"), /*#__PURE__*/React.createElement("span", {
    className: "related-count"
  }, refIssues.length)), /*#__PURE__*/React.createElement(RelatedSection, {
    icon: /*#__PURE__*/React.createElement(IconJira, {
      className: "icon"
    }),
    label: "Jira",
    count: refIssues.length,
    accent: "#5DA9FF"
  }, refIssues.map(i => /*#__PURE__*/React.createElement("button", {
    key: i.key,
    className: "related-row",
    onClick: () => onSelect && onSelect({
      kind: "assigned",
      id: i.key
    })
  }, /*#__PURE__*/React.createElement("span", {
    className: "pri-dot " + i.priority
  }), /*#__PURE__*/React.createElement("span", {
    className: "r-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono r-name"
  }, i.key), /*#__PURE__*/React.createElement("span", {
    className: "status-pill " + i.status,
    style: {
      marginLeft: "auto"
    }
  }, statusLabel(i.status))), /*#__PURE__*/React.createElement("span", {
    className: "r-subject"
  }, i.summary)))))));
}

// ───────── States ─────────
function EmptyState({
  kind
}) {
  const map = {
    none: {
      glyph: /*#__PURE__*/React.createElement(IconCheck, {
        className: "icon"
      }),
      title: "Inbox zero",
      sub: "Nothing assigned. Maybe go for a walk."
    },
    nomentions: {
      glyph: /*#__PURE__*/React.createElement(IconAtSign, {
        className: "icon"
      }),
      title: "No mentions in 14 days",
      sub: "You\u2019re not on the hook for anyone\u2019s work right now."
    },
    slacknone: {
      glyph: /*#__PURE__*/React.createElement(IconHash, {
        className: "icon"
      }),
      title: "No Slack mentions",
      sub: "Last 7 days are clear."
    },
    filtered: {
      glyph: /*#__PURE__*/React.createElement(IconInbox, {
        className: "icon"
      }),
      title: "No issues match",
      sub: /*#__PURE__*/React.createElement(React.Fragment, null, "Try ", /*#__PURE__*/React.createElement("a", null, "clearing filters"), ".")
    }
  };
  const m = map[kind] || map.none;
  return /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glyph"
  }, m.glyph), /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, m.title), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, m.sub));
}
function ErrorState({
  source,
  onRetry
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "empty error"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glyph"
  }, /*#__PURE__*/React.createElement(IconWifiOff, {
    className: "icon"
  })), /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, "Couldn\u2019t reach " + source), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Showing what we cached 4m ago. ", /*#__PURE__*/React.createElement("a", {
    onClick: onRetry
  }, "Retry")));
}
function LoadingRows({
  count = 8
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, Array.from({
    length: count
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "row",
    style: {
      cursor: "default"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row-stripe",
    style: {
      background: "var(--hairline)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "skel",
    style: {
      width: 8,
      height: 8,
      borderRadius: 4
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "skel",
    style: {
      width: 72,
      height: 11
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "skel",
    style: {
      flex: 1,
      height: 11,
      maxWidth: 360 - i * 18
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "skel",
    style: {
      width: 60,
      height: 14,
      borderRadius: 999
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "skel",
    style: {
      width: 38,
      height: 11
    }
  }))));
}

// ───────── Settings modal ─────────
function SettingsModal({
  open,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      animation: "fadeIn 120ms ease"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 420,
      background: "var(--surface)",
      borderRadius: 12,
      border: "1px solid var(--hairline-strong)",
      boxShadow: "var(--shadow-modal)",
      overflow: "hidden"
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 16px",
      borderBottom: "1px solid var(--hairline)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--fg-strong)"
    }
  }, "Settings"), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    onClick: onClose,
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(IconClose, {
    className: "icon"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Jira instance",
    value: "https://flexid.atlassian.net"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Default project filter",
    value: "All projects",
    select: true
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Slack workspace",
    value: "flexid.slack.com"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Refresh interval",
    value: "Every 2 minutes",
    select: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: onClose
  }, "Save")))));
}
function Field({
  label,
  value,
  select
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-caps"
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      height: 28,
      padding: "0 10px",
      background: "var(--canvas)",
      border: "1px solid var(--hairline-strong)",
      borderRadius: 6,
      fontSize: 12,
      color: "var(--fg)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, value), select && /*#__PURE__*/React.createElement(IconChevron, {
    className: "icon",
    style: {
      width: 12,
      height: 12,
      color: "var(--fg-muted)"
    }
  })));
}

// ───────── Grouped list renderer ─────────
const PRIORITY_META = {
  blocker: {
    label: "Blockers",
    color: "var(--pri-blocker)",
    alert: true
  },
  critical: {
    label: "Critical",
    color: "var(--pri-critical)",
    alert: false
  },
  major: {
    label: "Major",
    color: "var(--pri-major)",
    alert: false
  },
  minor: {
    label: "Minor",
    color: "var(--pri-minor)",
    alert: false
  },
  trivial: {
    label: "Trivial",
    color: "var(--pri-trivial)",
    alert: false
  }
};
function GroupedIssueList({
  issues,
  groupBy,
  selected,
  onSelect,
  view,
  collapsed,
  onToggle
}) {
  // Build groups
  const groups = useMemo(() => {
    if (groupBy === "none") return [["All", issues]];
    if (groupBy === "project") {
      const byProj = {};
      for (const i of issues) (byProj[i.proj] ||= []).push(i);
      const projs = Object.keys(byProj).sort();
      return projs.map(p => [p, byProj[p]]);
    }
    // priority
    const byPri = {};
    for (const i of issues) (byPri[i.priority] ||= []).push(i);
    return Object.keys(PRIORITY_META).filter(p => byPri[p]).map(p => [p, byPri[p]]);
  }, [issues, groupBy]);
  return /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, groups.map(([key, items]) => {
    const meta = groupBy === "priority" ? PRIORITY_META[key] : null;
    const label = groupBy === "priority" ? meta.label : groupBy === "project" ? key : "All issues";
    const color = groupBy === "priority" ? meta.color : groupBy === "project" ? projectColor(key) : null;
    const alert = groupBy === "priority" && meta.alert && items.length > 0;
    const isCollapsed = collapsed[key];
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      className: "group" + (alert ? " group-alert" : "")
    }, groupBy !== "none" && /*#__PURE__*/React.createElement(SectionHeader, {
      label: label,
      count: items.length,
      color: color,
      collapsed: isCollapsed,
      onToggle: () => onToggle(key),
      alert: alert
    }), !isCollapsed && items.map(i => /*#__PURE__*/React.createElement(IssueRow, {
      key: i.key,
      issue: i,
      selected: selected?.kind !== "slack" && selected?.id === i.key,
      onSelect: id => onSelect({
        kind: view,
        id
      }),
      showMentionCtx: view === "mentioned"
    })));
  }));
}

// ───────── Slack grouped list (by recency) ─────────
function GroupedSlackList({
  items,
  selected,
  onSelect,
  collapsed,
  onToggle
}) {
  const groups = useMemo(() => {
    const today = [],
      yest = [],
      older = [];
    for (const m of items) {
      if (/m$|h$/.test(m.when)) today.push(m);else if (m.when === "1d") yest.push(m);else older.push(m);
    }
    return [["today", "Today", today], ["yesterday", "Yesterday", yest], ["older", "Earlier this week", older]].filter(g => g[2].length > 0);
  }, [items]);
  return /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, groups.map(([key, label, list]) => {
    const isCollapsed = collapsed[key];
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      className: "group"
    }, /*#__PURE__*/React.createElement(SectionHeader, {
      label: label,
      count: list.length,
      collapsed: isCollapsed,
      onToggle: () => onToggle(key)
    }), !isCollapsed && list.map(m => /*#__PURE__*/React.createElement(SlackRow, {
      key: m.id,
      msg: m,
      selected: selected?.kind === "slack" && selected?.id === m.id,
      onSelect: id => onSelect({
        kind: "slack",
        id
      })
    })));
  }));
}
Object.assign(window, {
  TitleBar,
  StatsBar,
  Tabs,
  FilterBar,
  IssueRow,
  SlackRow,
  DetailPane,
  SectionHeader,
  EmptyState,
  ErrorState,
  LoadingRows,
  SettingsModal,
  GroupedIssueList,
  GroupedSlackList,
  PRIORITY_ORDER,
  PRIORITY_META,
  statusLabel,
  projectColor
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tracker/components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tracker/data.jsx
try { (() => {
// Mock data for the FlexID Tracker UI kit
const MOCK_DATA = {
  jiraAssigned: [{
    key: 'PCR-832',
    priority: 'blocker',
    status: 'progress',
    proj: 'FLEXID',
    summary: 'SDK error rate spike on iOS 18 — auth handshake timeouts',
    when: '12m',
    updated: 'just now',
    assignee: 'You',
    reporter: 'Dana Kim',
    links: [{
      rel: 'blocks',
      key: 'GROW-211'
    }, {
      rel: 'relates to',
      key: 'SDK-1209'
    }]
  }, {
    key: 'FLEXID-7875',
    priority: 'critical',
    status: 'review',
    proj: 'DOCS',
    summary: 'Docs modernization — migrate /sdks pages to new IA',
    when: '2h',
    updated: '2h ago',
    assignee: 'You',
    reporter: 'Jules Rivera',
    links: []
  }, {
    key: 'SDK-1209',
    priority: 'major',
    status: 'todo',
    proj: 'SDK',
    summary: 'Add WebAuthn fallback to mobile flow',
    when: '1d',
    updated: '1d ago',
    assignee: 'You',
    reporter: 'Sam Patel',
    links: [{
      rel: 'relates to',
      key: 'PCR-832'
    }]
  }, {
    key: 'PCR-844',
    priority: 'major',
    status: 'progress',
    proj: 'FLEXID',
    summary: 'Refresh-token rotation breaks long-lived sessions',
    when: '1d',
    updated: '1d ago',
    assignee: 'You',
    reporter: 'Sam Patel',
    links: [{
      rel: 'is blocked by',
      key: 'PLAT-432'
    }]
  }, {
    key: 'FLEXID-7901',
    priority: 'minor',
    status: 'todo',
    proj: 'DOCS',
    summary: 'Tighten copy on the FlexID quickstart landing',
    when: '2d',
    updated: '2d ago',
    assignee: 'You',
    reporter: 'Jules Rivera',
    links: []
  }, {
    key: 'PLAT-441',
    priority: 'minor',
    status: 'progress',
    proj: 'PLAT',
    summary: 'Audit log retention dropdown shows wrong unit',
    when: '3d',
    updated: '3d ago',
    assignee: 'You',
    reporter: 'Mira Chen',
    links: []
  }, {
    key: 'SDK-1188',
    priority: 'minor',
    status: 'review',
    proj: 'SDK',
    summary: 'iOS sample app crashes on cold start without keychain',
    when: '4d',
    updated: '4d ago',
    assignee: 'You',
    reporter: 'Avi Shah',
    links: []
  }, {
    key: 'PCR-829',
    priority: 'trivial',
    status: 'blocked',
    proj: 'FLEXID',
    summary: 'Update screenshot in onboarding email',
    when: '6d',
    updated: '6d ago',
    assignee: 'You',
    reporter: 'Dana Kim',
    links: []
  }, {
    key: 'PLAT-440',
    priority: 'trivial',
    status: 'todo',
    proj: 'PLAT',
    summary: 'Rename internal env from staging-eu1 to stg-eu',
    when: '6d',
    updated: '6d ago',
    assignee: 'You',
    reporter: 'Mira Chen',
    links: []
  }, {
    key: 'FLEXID-7870',
    priority: 'trivial',
    status: 'todo',
    proj: 'DOCS',
    summary: 'Broken link on the password-policy docs page',
    when: '8d',
    updated: '8d ago',
    assignee: 'You',
    reporter: 'Jules Rivera',
    links: []
  }, {
    key: 'SDK-1175',
    priority: 'minor',
    status: 'review',
    proj: 'SDK',
    summary: 'Add idempotency keys to /verify endpoint',
    when: '9d',
    updated: '9d ago',
    assignee: 'You',
    reporter: 'Avi Shah',
    links: []
  }, {
    key: 'PLAT-432',
    priority: 'major',
    status: 'todo',
    proj: 'PLAT',
    summary: 'Org-level SSO — finalize roles matrix with Security',
    when: '11d',
    updated: '11d ago',
    assignee: 'You',
    reporter: 'Mira Chen',
    links: [{
      rel: 'blocks',
      key: 'PCR-844'
    }]
  }],
  jiraMentioned: [{
    key: 'GROW-211',
    priority: 'critical',
    status: 'progress',
    proj: 'GROW',
    summary: 'Activation funnel — drop after first SDK install',
    when: '4h',
    updated: '4h ago',
    assignee: 'Dana Kim',
    reporter: 'Eli Park',
    mentionCtx: 'tagged you in a comment',
    links: [{
      rel: 'is blocked by',
      key: 'PCR-832'
    }]
  }, {
    key: 'PCR-820',
    priority: 'major',
    status: 'review',
    proj: 'FLEXID',
    summary: 'Move backup codes UI behind a feature flag',
    when: '7h',
    updated: '7h ago',
    assignee: 'Sam Patel',
    reporter: 'Dana Kim',
    mentionCtx: 'asked you to review',
    links: []
  }, {
    key: 'SEC-118',
    priority: 'major',
    status: 'todo',
    proj: 'SEC',
    summary: 'Threat-model review for FlexID device-trust',
    when: '1d',
    updated: '1d ago',
    assignee: 'Mira Chen',
    reporter: 'Reza Solis',
    mentionCtx: 'requested input',
    links: []
  }, {
    key: 'PLAT-435',
    priority: 'minor',
    status: 'progress',
    proj: 'PLAT',
    summary: 'Workspace billing page shows stale seat count',
    when: '2d',
    updated: '2d ago',
    assignee: 'Avi Shah',
    reporter: 'Eli Park',
    mentionCtx: 'cc\u2019d you',
    links: []
  }, {
    key: 'GROW-198',
    priority: 'minor',
    status: 'done',
    proj: 'GROW',
    summary: 'Run a teardown of last quarter\u2019s onboarding emails',
    when: '8d',
    updated: '8d ago',
    assignee: 'Eli Park',
    reporter: 'Dana Kim',
    mentionCtx: 'mentioned you',
    links: []
  }],
  slack: [{
    id: 's1',
    user: 'Dana Kim',
    initials: 'DK',
    avatar: '#7B5BFF',
    channel: 'flexid-eng',
    when: '23m',
    text: '@you can you take a look at PCR-832? Looks like the timeout repros on the new build too — same handshake phase as last week.',
    mention: true,
    refs: ['PCR-832']
  }, {
    id: 's2',
    user: 'Jules Rivera',
    initials: 'JR',
    avatar: '#46A37C',
    channel: 'docs-modernization',
    when: '3h',
    text: 'heads up @you — IA review is moved to Thursday. need your sign-off on FLEXID-7875 tree before then.',
    mention: true,
    refs: ['FLEXID-7875']
  }, {
    id: 's3',
    user: 'Mira Chen',
    initials: 'MC',
    avatar: '#E26B6B',
    channel: 'platform',
    when: '1d',
    text: 'looping in @you — security wants the RBAC matrix locked by EOW. mostly done, just need a +1 on the audit-viewer split.',
    mention: true,
    refs: ['PLAT-432']
  }, {
    id: 's4',
    user: 'Sam Patel',
    initials: 'SP',
    avatar: '#3D8FE0',
    channel: 'flexid-eng',
    when: '1d',
    text: 'kicked off the rotation fix on PCR-844 — @you fyi, will need a quick PRD addendum to cover the 30-day grace.',
    mention: true,
    refs: ['PCR-844']
  }, {
    id: 's5',
    user: 'Eli Park',
    initials: 'EP',
    avatar: '#D88E2A',
    channel: 'growth',
    when: '2d',
    text: 'fwiw the activation drop maps cleanly onto the iOS users hitting PCR-832. @you can we triage these together?',
    mention: true,
    refs: ['PCR-832', 'GROW-211']
  }, {
    id: 's6',
    user: 'Reza Solis',
    initials: 'RS',
    avatar: '#5DB7B7',
    channel: 'sec-review',
    when: '4d',
    text: '@you scheduled a 30 for the device-trust threat model on Tuesday. happy to push if you need.',
    mention: true,
    refs: ['SEC-118']
  },
  // non-@you references (broader signal — only show in Related)
  {
    id: 's7',
    user: 'Avi Shah',
    initials: 'AS',
    avatar: '#9B7AC9',
    channel: 'flexid-eng',
    when: '1h',
    text: 'pushed a fix branch for PCR-832, smoke tests green on the iOS 17 simulator. iOS 18 still pending.',
    mention: false,
    refs: ['PCR-832']
  }, {
    id: 's8',
    user: 'Dana Kim',
    initials: 'DK',
    avatar: '#7B5BFF',
    channel: 'flexid-eng',
    when: '5h',
    text: 'rolling PCR-832 into the war room — invite incoming. anyone with iOS handshake context, lurk welcome.',
    mention: false,
    refs: ['PCR-832']
  }, {
    id: 's9',
    user: 'Sam Patel',
    initials: 'SP',
    avatar: '#3D8FE0',
    channel: 'platform',
    when: '6h',
    text: 'PLAT-432 RBAC matrix is in review — should unblock PCR-844 once landed.',
    mention: false,
    refs: ['PLAT-432', 'PCR-844']
  }],
  gmail: [{
    id: 'g1',
    from: 'Dana Kim',
    fromEmail: 'dana@flexid.com',
    when: '40m',
    subject: '[PCR-832] iOS 18 handshake — escalation',
    preview: 'Looping in support; we have 4 enterprise tickets open against the same SDK error. Can you confirm ETA on the fix?',
    refs: ['PCR-832'],
    unread: true
  }, {
    id: 'g2',
    from: 'Jules Rivera',
    fromEmail: 'jules@flexid.com',
    when: '5h',
    subject: 'Docs IA review — Thursday',
    preview: 'Sending a calendar invite for the FLEXID-7875 walkthrough. Includes the new /sdks tree and the redirect map.',
    refs: ['FLEXID-7875'],
    unread: true
  }, {
    id: 'g3',
    from: 'Reza Solis',
    fromEmail: 'reza@flexid.com',
    when: '2d',
    subject: 'Re: Threat model intake — SEC-118',
    preview: 'Attaching the threat-model template. You can fill it inline or we can run through it live on Tuesday.',
    refs: ['SEC-118'],
    unread: false
  }, {
    id: 'g4',
    from: 'Workspace Notifications',
    fromEmail: 'no-reply@atlassian.com',
    when: '4d',
    subject: 'PCR-832 has been linked to GROW-211',
    preview: 'Dana Kim added a "blocks" link from PCR-832 to GROW-211. View on Jira.',
    refs: ['PCR-832', 'GROW-211'],
    unread: false,
    system: true
  }, {
    id: 'g5',
    from: 'Eli Park',
    fromEmail: 'eli@flexid.com',
    when: '6d',
    subject: 'Activation funnel readout — week 18',
    preview: 'Numbers attached. The iOS dropoff is the same population we discussed — see GROW-211 and PCR-832.',
    refs: ['GROW-211', 'PCR-832'],
    unread: false
  }]
};

// ─── Cross-reference helpers ─────────────────────────────
// Given an issue key, return all related signals across surfaces.
function getRelatedFor(issueKey, data = MOCK_DATA) {
  const slackAll = data.slack.filter(m => (m.refs || []).includes(issueKey));
  // Sort: @mentions of you first, then by recency (the array is already recency-ordered).
  const slackSorted = [...slackAll].sort((a, b) => Number(b.mention) - Number(a.mention));
  const emails = data.gmail.filter(m => (m.refs || []).includes(issueKey));
  const issue = [...data.jiraAssigned, ...data.jiraMentioned].find(i => i.key === issueKey);
  const linkedKeys = (issue?.links || []).map(l => l.key);
  const linkedIssues = (issue?.links || []).map(l => ({
    rel: l.rel,
    key: l.key,
    issue: [...data.jiraAssigned, ...data.jiraMentioned].find(i => i.key === l.key)
  })).filter(x => x.issue);
  return {
    slack: slackSorted,
    emails,
    linked: linkedIssues,
    linkedKeys
  };
}

// Given a Slack message or Gmail item, return the Jira issues it references.
function getReferencedIssues(refs, data = MOCK_DATA) {
  if (!refs) return [];
  const all = [...data.jiraAssigned, ...data.jiraMentioned];
  return refs.map(k => all.find(i => i.key === k)).filter(Boolean);
}
window.MOCK_DATA = MOCK_DATA;
window.getRelatedFor = getRelatedFor;
window.getReferencedIssues = getReferencedIssues;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tracker/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tracker/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Inline icons used by FlexID Tracker. Copied from Lucide (MIT) — only what we use.
// Stroke 1.75, 14×14 default. Color via currentColor.

const Icon = ({
  children,
  size = 14,
  strokeWidth = 1.75,
  style = {},
  ...rest
}) => /*#__PURE__*/React.createElement("svg", _extends({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: {
    display: 'block',
    ...style
  }
}, rest), children);
const IconRefresh = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 0 1 15.5-6.3L21 8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 3v5h-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 12a9 9 0 0 1-15.5 6.3L3 16"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 21v-5h5"
}));
const IconExternal = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("path", {
  d: "M15 3h6v6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 14 21 3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
}));
const IconSettings = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
}));
const IconInbox = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("polyline", {
  points: "22 12 16 12 14 15 10 15 8 12 2 12"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
}));
const IconAtSign = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"
}));
const IconHash = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "9",
  x2: "20",
  y2: "9"
}), /*#__PURE__*/React.createElement("line", {
  x1: "4",
  y1: "15",
  x2: "20",
  y2: "15"
}), /*#__PURE__*/React.createElement("line", {
  x1: "10",
  y1: "3",
  x2: "8",
  y2: "21"
}), /*#__PURE__*/React.createElement("line", {
  x1: "16",
  y1: "3",
  x2: "14",
  y2: "21"
}));
const IconAlert = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("path", {
  d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "9",
  x2: "12",
  y2: "13"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "17",
  x2: "12.01",
  y2: "17"
}));
const IconChevron = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("polyline", {
  points: "6 9 12 15 18 9"
}));
const IconWifiOff = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("line", {
  x1: "1",
  y1: "1",
  x2: "23",
  y2: "23"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16.72 11.06A10.94 10.94 0 0 1 19 12.55"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 12.55a10.94 10.94 0 0 1 5.17-2.39"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10.71 5.05A16 16 0 0 1 22.58 9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M1.42 9a15.91 15.91 0 0 1 4.7-2.88"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8.53 16.11a6 6 0 0 1 6.95 0"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "20",
  x2: "12.01",
  y2: "20"
}));
const IconCheck = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("polyline", {
  points: "20 6 9 17 4 12"
}));
const IconClose = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}), /*#__PURE__*/React.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
}));
const IconMail = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("path", {
  d: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "22,6 12,13 2,6"
}));
const IconLink = props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("path", {
  d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
}));
const IconJira = props => /*#__PURE__*/React.createElement(Icon, _extends({}, props, {
  strokeWidth: 1.5
}), /*#__PURE__*/React.createElement("path", {
  d: "M11.53 2 6 7.53l5.53 5.53 5.53-5.53L11.53 2z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6 12.94 11.53 18.47 17.06 12.94"
}));
const IconSlack = props => /*#__PURE__*/React.createElement(Icon, _extends({}, props, {
  strokeWidth: 1.6
}), /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "9",
  width: "6",
  height: "6",
  rx: "1.5"
}), /*#__PURE__*/React.createElement("rect", {
  x: "15",
  y: "9",
  width: "6",
  height: "6",
  rx: "1.5"
}), /*#__PURE__*/React.createElement("rect", {
  x: "9",
  y: "3",
  width: "6",
  height: "6",
  rx: "1.5"
}), /*#__PURE__*/React.createElement("rect", {
  x: "9",
  y: "15",
  width: "6",
  height: "6",
  rx: "1.5"
}));
Object.assign(window, {
  IconRefresh,
  IconExternal,
  IconSettings,
  IconInbox,
  IconAtSign,
  IconHash,
  IconAlert,
  IconChevron,
  IconWifiOff,
  IconCheck,
  IconClose,
  IconMail,
  IconLink,
  IconJira,
  IconSlack
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tracker/icons.jsx", error: String((e && e.message) || e) }); }

})();
