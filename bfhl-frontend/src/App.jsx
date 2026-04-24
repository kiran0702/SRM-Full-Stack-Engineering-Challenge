import { useState } from "react";
import { postEdges } from "./api.js";

const theme = {
  bg: "#0a0a0f",
  surface: "#13131a",
  surfaceAlt: "#1a1a24",
  border: "#2a2a38",
  accent: "#6c63ff",
  accentHover: "#857dff",
  accentGlow: "rgba(108,99,255,0.25)",
  success: "#3ecf8e",
  danger: "#ff4f64",
  warn: "#f59e0b",
  text: "#e8e8f0",
  textMuted: "#7a7a9a",
  textDim: "#4a4a6a",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${theme.bg};
    color: ${theme.text};
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${theme.surface}; }
  ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 3px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes nodeIn {
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

function TreeNode({ nodeKey, children, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = children && Object.keys(children).length > 0;

  const colors = [
    theme.accent,
    theme.success,
    theme.warn,
    "#e879f9",
    "#38bdf8",
  ];
  const color = colors[depth % colors.length];

  return (
    <div
      style={{
        marginLeft: depth === 0 ? 0 : 20,
        borderLeft: depth > 0 ? `1px solid ${theme.border}` : "none",
        paddingLeft: depth > 0 ? 14 : 0,
        marginTop: 6,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          cursor: hasChildren ? "pointer" : "default",
          userSelect: "none",
          animation: `nodeIn 0.3s ease both`,
          animationDelay: `${depth * 50}ms`,
        }}
        onClick={() => hasChildren && setCollapsed(!collapsed)}
      >
        {hasChildren && (
          <span
            style={{
              fontSize: 10,
              color: theme.textMuted,
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              display: "inline-block",
            }}
          >
            ▼
          </span>
        )}
        {!hasChildren && (
          <span style={{ fontSize: 8, color: theme.textDim }}>◆</span>
        )}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color,
            background: `${color}15`,
            border: `1px solid ${color}40`,
            borderRadius: 6,
            padding: "2px 10px",
            letterSpacing: "0.05em",
          }}
        >
          {nodeKey}
        </span>
        {hasChildren && (
          <span style={{ fontSize: 10, color: theme.textDim }}>
            {Object.keys(children).length} child
            {Object.keys(children).length !== 1 ? "ren" : ""}
          </span>
        )}
      </div>

      {!collapsed &&
        hasChildren &&
        Object.entries(children).map(([k, v]) => (
          <TreeNode key={k} nodeKey={k} children={v} depth={depth + 1} />
        ))}
    </div>
  );
}

function HierarchyCard({ h, index }) {
  const treeRoot = h.tree ? Object.keys(h.tree)[0] : null;
  const treeChildren = treeRoot ? h.tree[treeRoot] : {};

  return (
    <div
      style={{
        background: theme.surfaceAlt,
        border: `1px solid ${h.has_cycle ? theme.danger + "40" : theme.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        animation: "fadeUp 0.4s ease both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              color: theme.textMuted,
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            TREE {index + 1}
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: theme.text,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Root: {h.root}
          </span>
        </div>

        {h.has_cycle ? (
          <span
            style={{
              fontSize: 11,
              color: theme.danger,
              background: `${theme.danger}15`,
              border: `1px solid ${theme.danger}40`,
              borderRadius: 6,
              padding: "3px 10px",
            }}
          >
            ⚠ CYCLE DETECTED
          </span>
        ) : (
          <span
            style={{
              fontSize: 11,
              color: theme.success,
              background: `${theme.success}15`,
              border: `1px solid ${theme.success}40`,
              borderRadius: 6,
              padding: "3px 10px",
            }}
          >
            DEPTH {h.depth}
          </span>
        )}
      </div>

      {!h.has_cycle && treeRoot && (
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            padding: "16px 18px",
          }}
        >
          <TreeNode nodeKey={treeRoot} children={treeChildren} depth={0} />
        </div>
      )}

      {h.has_cycle && (
        <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
          A cycle was detected in this subgraph. No tree structure can be
          rendered.
        </p>
      )}
    </div>
  );
}

function Tag({ label, color, bg, border }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        color,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 6,
        padding: "2px 10px",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      {label}
    </span>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setData(null);
    setLoading(true);

    const arr = input
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (arr.length === 0) {
      setError("Please enter at least one edge, e.g. A->B, B->C");
      setLoading(false);
      return;
    }

    try {
      const result = await postEdges(arr);
      setData(result);
    } catch (err) {
      if (err.response) {
        setError(
          `Server error ${err.response.status}: ${err.response.data?.message || "Unknown error"}`
        );
      } else if (err.request) {
        setError(
          "Cannot reach the backend. Please try again later."
        );
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        <header style={{ marginBottom: 48, animation: "fadeUp 0.5s ease" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${theme.accent}, #a78bfa)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                boxShadow: `0 0 24px ${theme.accentGlow}`,
              }}
            >
              🌳
            </div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: theme.text,
              }}
            >
              BFHL Hierarchy Visualizer
            </h1>
          </div>
          <p style={{ fontSize: 13, color: theme.textMuted, marginLeft: 50 }}>
            Enter directed edges to visualize tree hierarchies, detect cycles,
            and analyze structure.
          </p>
        </header>

        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: 24,
            marginBottom: 28,
            animation: "fadeUp 0.5s ease 0.1s both",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: 11,
              color: theme.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Edge Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="A->B, B->C, A->D, D->E"
            rows={3}
            style={{
              width: "100%",
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              color: theme.text,
              fontFamily: "'DM Mono', monospace",
              fontSize: 14,
              padding: "12px 14px",
              resize: "vertical",
              outline: "none",
              lineHeight: 1.6,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = theme.accent)
            }
            onBlur={(e) =>
              (e.target.style.borderColor = theme.border)
            }
          />
          <p style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>
            Format: UPPERCASE letters only, e.g.{" "}
            <span style={{ color: theme.accent }}>A-&gt;B</span>. Separate
            multiple edges with commas. Ctrl+Enter to submit.
          </p>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 14,
              width: "100%",
              padding: "12px",
              background: loading ? theme.surfaceAlt : theme.accent,
              color: loading ? theme.textMuted : "#fff",
              border: `1px solid ${loading ? theme.border : theme.accent}`,
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 500,
              letterSpacing: "0.06em",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s, box-shadow 0.2s",
              boxShadow: loading ? "none" : `0 0 20px ${theme.accentGlow}`,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = theme.accentHover;
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = theme.accent;
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: `2px solid ${theme.textDim}`,
                    borderTopColor: theme.textMuted,
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Processing...
              </span>
            ) : (
              "Analyze Hierarchy →"
            )}
          </button>
        </div>

        {error && (
          <div
            style={{
              background: `${theme.danger}10`,
              border: `1px solid ${theme.danger}40`,
              borderRadius: 10,
              padding: "14px 18px",
              color: theme.danger,
              fontSize: 13,
              marginBottom: 24,
              animation: "fadeUp 0.3s ease",
            }}
          >
            {error}
          </div>
        )}

        {data && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginBottom: 28,
              }}
            >
              {[
                {
                  label: "Total Trees",
                  value: data.summary.total_trees,
                  color: theme.success,
                },
                {
                  label: "Total Cycles",
                  value: data.summary.total_cycles,
                  color: data.summary.total_cycles > 0 ? theme.danger : theme.textMuted,
                },
                {
                  label: "Largest Root",
                  value: data.summary.largest_tree_root || "—",
                  color: theme.accent,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: theme.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 8,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: stat.color,
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {data.user_id && (
              <div
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: "12px 18px",
                  marginBottom: 24,
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { k: "User", v: data.user_id },
                  { k: "Email", v: data.email_id },
                  { k: "Roll", v: data.college_roll_number },
                ].map(({ k, v }) => (
                  <span key={k} style={{ fontSize: 12, color: theme.textMuted }}>
                    <span style={{ color: theme.textDim }}>{k}: </span>
                    <span style={{ color: theme.text }}>{v}</span>
                  </span>
                ))}
              </div>
            )}

            <section style={{ marginBottom: 28 }}>
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: theme.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 14,
                }}
              >
                Hierarchies
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {data.hierarchies.map((h, i) => (
                  <HierarchyCard key={i} h={h} index={i} />
                ))}
                {data.hierarchies.length === 0 && (
                  <p style={{ fontSize: 13, color: theme.textDim }}>
                    No hierarchies found.
                  </p>
                )}
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: "20px 22px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: theme.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                  }}
                >
                  Invalid Entries
                </h3>
                {data.invalid_entries.length === 0 ? (
                  <p style={{ fontSize: 12, color: theme.textDim }}>None</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {data.invalid_entries.map((e, i) => (
                      <Tag
                        key={i}
                        label={e}
                        color={theme.danger}
                        bg={`${theme.danger}12`}
                        border={`${theme.danger}40`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: "20px 22px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: theme.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                  }}
                >
                  Duplicate Edges
                </h3>
                {data.duplicate_edges.length === 0 ? (
                  <p style={{ fontSize: 12, color: theme.textDim }}>None</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {data.duplicate_edges.map((e, i) => (
                      <Tag
                        key={i}
                        label={e}
                        color={theme.warn}
                        bg={`${theme.warn}12`}
                        border={`${theme.warn}40`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}