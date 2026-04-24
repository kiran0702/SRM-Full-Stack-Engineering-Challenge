const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

function isValidEdge(str) {
  if (typeof str !== "string") return false;
  str = str.trim();
  if (!/^[A-Z]->[A-Z]$/.test(str)) return false;
  const [p, c] = str.split("->");
  if (p === c) return false; // self-loop is invalid
  return true;
}

app.post("/bfhl", (req, res) => {
  const data = Array.isArray(req.body?.data) ? req.body.data : [];

  const invalid = [];
  const duplicates = [];
  const seen = new Set();
  const edges = []; // valid, first-occurrence edges

  for (let item of data) {
    if (typeof item !== "string") { invalid.push(String(item)); continue; }
    const trimmed = item.trim();

    if (!isValidEdge(trimmed)) {
      invalid.push(item); // push original (untrimmed) as received
      continue;
    }

    if (seen.has(trimmed)) {
      // Only add once to duplicate_edges regardless of how many extra times it appears
      if (!duplicates.includes(trimmed)) duplicates.push(trimmed);
      continue;
    }

    seen.add(trimmed);
    edges.push(trimmed);
  }

  // Build adjacency list; enforce diamond rule (first parent wins)
  const adj = {};      // parent -> [children]
  const childOf = {};  // child -> its one assigned parent (first-encounter wins)
  const allNodes = new Set();

  for (let edge of edges) {
    const [p, c] = edge.split("->");
    allNodes.add(p);
    allNodes.add(c);

    // Diamond rule: if child already has a parent, discard this edge silently
    if (childOf[c] !== undefined) continue;

    childOf[c] = p;
    if (!adj[p]) adj[p] = [];
    adj[p].push(c);
  }

  // Root = node that is never someone's child (after diamond filtering)
  const childSet = new Set(Object.keys(childOf));
  let roots = [...allNodes].filter((n) => !childSet.has(n));

  // Pure-cycle group: every node is a child → pick lex-smallest as root
  if (roots.length === 0 && allNodes.size > 0) {
    roots = [[...allNodes].sort()[0]];
  }

  // DFS that detects cycles; returns { tree, depth } or { cycle: true }
  function dfs(node, ancestorPath) {
    if (ancestorPath.has(node)) return { cycle: true };

    ancestorPath.add(node);
    const children = adj[node] || [];
    let subtree = {};
    let maxChildDepth = 0;

    for (let child of children) {
      const result = dfs(child, new Set(ancestorPath));
      if (result.cycle) return { cycle: true };
      subtree[child] = result.tree;
      if (result.depth > maxChildDepth) maxChildDepth = result.depth;
    }

    return { tree: subtree, depth: 1 + maxChildDepth };
  }

  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestDepth = 0;
  let largestRoot = "";

  for (let root of roots.sort()) { // sort roots for deterministic order
    const result = dfs(root, new Set());

    if (result.cycle) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
      totalCycles++;
    } else {
      const treeObj = { [root]: result.tree };
      hierarchies.push({ root, tree: treeObj, depth: result.depth });
      totalTrees++;

      // Tiebreaker: deeper wins; equal depth → lex-smaller root wins
      if (
        result.depth > largestDepth ||
        (result.depth === largestDepth && (largestRoot === "" || root < largestRoot))
      ) {
        largestDepth = result.depth;
        largestRoot = root;
      }
    }
  }

  res.json({
    user_id: "kiran_01012000",         // update: fullname_ddmmyyyy
    email_id: "your_email@srmist.edu.in",  // update
    college_roll_number: "your_roll",        // update
    hierarchies,
    invalid_entries: invalid,
    duplicate_edges: duplicates,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestRoot,
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BFHL API running on port ${PORT}`));