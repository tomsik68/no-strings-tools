const input = document.getElementById("sql-input");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copy-btn");
const feedback = document.getElementById("copy-feedback");

// Keywords that start a new line (uppercase for matching)
const BREAK_BEFORE = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "GROUP", "ORDER", "HAVING",
  "LIMIT", "OFFSET", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "FULL",
  "CROSS", "ON", "UNION", "EXCEPT", "INTERSECT", "INSERT", "INTO", "VALUES",
  "UPDATE", "SET", "DELETE", "CREATE", "ALTER", "DROP", "WITH", "RETURNING",
  "CASE", "WHEN", "THEN", "ELSE", "END",
]);

const UPPER = new Set([
  ...BREAK_BEFORE,
  "AS", "BY", "ASC", "DESC", "NULL", "NOT", "IN", "IS", "LIKE", "BETWEEN",
  "EXISTS", "DISTINCT", "ALL", "ANY", "SOME", "TABLE", "INDEX", "VIEW",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "DEFAULT", "CASCADE", "RESTRICT",
  "TRUE", "FALSE", "ASC", "DESC", "NULLS", "FIRST", "LAST", "OVER", "PARTITION",
]);

function tokenize(sql) {
  const tokens = [];
  let i = 0;
  while (i < sql.length) {
    if (/\s/.test(sql[i])) { i++; continue; }
    // string
    if (sql[i] === "'" || sql[i] === '"') {
      const q = sql[i];
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === q && sql[j + 1] === q) { j += 2; continue; }
        if (sql[j] === q) { j++; break; }
        j++;
      }
      tokens.push(sql.slice(i, j));
      i = j;
      continue;
    }
    // backtick ident
    if (sql[i] === "`") {
      let j = i + 1;
      while (j < sql.length && sql[j] !== "`") j++;
      tokens.push(sql.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    // comment --
    if (sql[i] === "-" && sql[i + 1] === "-") {
      let j = i + 2;
      while (j < sql.length && sql[j] !== "\n") j++;
      tokens.push(sql.slice(i, j));
      i = j;
      continue;
    }
    // comment /* */
    if (sql[i] === "/" && sql[i + 1] === "*") {
      let j = i + 2;
      while (j < sql.length && !(sql[j] === "*" && sql[j + 1] === "/")) j++;
      tokens.push(sql.slice(i, j + 2));
      i = j + 2;
      continue;
    }
    // punctuation
    if (/[(),;.]/.test(sql[i])) {
      tokens.push(sql[i]);
      i++;
      continue;
    }
    // word / number / ops
    let j = i;
    while (j < sql.length && !/\s/.test(sql[j]) && !/[(),;.'"`]/.test(sql[j]) && !(sql[j] === "-" && sql[j + 1] === "-") && !(sql[j] === "/" && sql[j + 1] === "*")) j++;
    if (j === i) { tokens.push(sql[i]); i++; continue; }
    tokens.push(sql.slice(i, j));
    i = j;
  }
  return tokens;
}

function formatSql(sql) {
  if (!sql.trim()) return "";
  const tokens = tokenize(sql);
  const lines = [];
  let line = "";
  let depth = 0;
  const indent = () => "  ".repeat(Math.max(0, depth));

  const flush = () => {
    if (line.trim()) lines.push(indent() + line.trim());
    line = "";
  };

  for (let i = 0; i < tokens.length; i++) {
    let tok = tokens[i];
    const upper = tok.toUpperCase();

    // multi-word: GROUP BY, ORDER BY, LEFT JOIN, etc.
    let keyword = upper;
    if ((upper === "GROUP" || upper === "ORDER" || upper === "PARTITION") && tokens[i + 1]?.toUpperCase() === "BY") {
      keyword = upper + " BY";
      tok = tok + " " + tokens[++i];
    } else if (["LEFT", "RIGHT", "INNER", "OUTER", "FULL", "CROSS"].includes(upper) && tokens[i + 1]?.toUpperCase() === "JOIN") {
      keyword = upper + " JOIN";
      tok = tok + " " + tokens[++i];
    } else if (upper === "INSERT" && tokens[i + 1]?.toUpperCase() === "INTO") {
      keyword = "INSERT INTO";
      tok = tok + " " + tokens[++i];
    }

    const isKw = UPPER.has(upper) || keyword.includes(" ");

    if (tok === "(") {
      line += (line ? " " : "") + "(";
      flush();
      depth++;
      continue;
    }
    if (tok === ")") {
      flush();
      depth = Math.max(0, depth - 1);
      line = ")";
      continue;
    }
    if (tok === ",") {
      line += ",";
      flush();
      continue;
    }
    if (tok === ";") {
      line += ";";
      flush();
      continue;
    }

    if (isKw && BREAK_BEFORE.has(keyword.split(" ")[0])) {
      flush();
      // uppercase keywords
      const parts = tok.split(" ");
      line = parts.map((p) => UPPER.has(p.toUpperCase()) ? p.toUpperCase() : p).join(" ");
      continue;
    }

    if (isKw && UPPER.has(upper)) {
      line += (line ? " " : "") + upper;
    } else {
      line += (line ? " " : "") + tok;
    }
  }
  flush();
  return lines.join("\n");
}

function update() {
  const formatted = formatSql(input.value);
  output.textContent = formatted || "Paste SQL above…";
}

input.addEventListener("input", update);
input.focus();

copyBtn.addEventListener("click", async () => {
  const text = output.textContent;
  if (!text || text === "Paste SQL above…") return;
  try {
    await navigator.clipboard.writeText(text);
    feedback.textContent = "Copied";
    setTimeout(() => (feedback.textContent = ""), 1500);
  } catch {
    feedback.textContent = "Couldn't copy";
  }
});
