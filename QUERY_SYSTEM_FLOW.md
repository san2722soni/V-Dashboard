# Query System — Full Flow: Frontend → Backend → Execution

---

## Overview

```
[Frontend Form]  →  [API Call]  →  [Backend Store]  →  [Execute Sheet]  →  [Backend Execute]  →  [MongoDB/Redis]
```

---

## STEP 1: Frontend — Create Query

User fills in two fields:
- **Command** (textarea) — the raw query text
- **Description** (optional)

### MongoDB Example
```
developers.find({"status": "<<$>>"}).sort({createdAt: -1}).limit(<<$>>)
```

### Redis Example
```
GET <<$>>
```

The `<<$>>` are **placeholders** — filled in at execution time, NOT at creation.

---

## STEP 2: Frontend → API Call

The form wraps the command in JSON and sends it:

```js
// Frontend sends this POST to /dashboard/query/createQuery
{
  type: "mongo",                                               // or "redis"
  queryString: '{"command":"developers.find({}).limit(<<$>>)"}', // JSON string
  description: "List active developers"
}
```

Key point: `queryString` is a **JSON string containing `{ command: "..." }`**. The raw command text lives inside.

---

## STEP 3: Backend — Store in MongoDB

```js
// queryService.js → createQuery()
const { type, queryString, description } = data;

// Validates queryString is valid JSON
JSON.parse(queryString);  // ← just a safety check

// Saves to DB using Mongoose model
await Query.create({
  creator: { developerId, email },
  type,          // "mongo" or "redis"
  queryString,   // '{"command":"developers.find({}).limit(<<$>>)"}'
  description,
  status: "pending"   // default — needs admin approval
});
```

The query sits in the DB as **pending** until an admin approves it.

---

## STEP 4: Execute Sheet — Placeholder Detection

When user opens the Execute sheet, the frontend:

1. Parses `queryString` → extracts the `command` string
2. Counts `<<$>>` occurrences using regex: `(cmd.match(/<<\$>>/g) || []).length`
3. If count > 0 → renders input fields (one per placeholder)

```
┌─────────────────────────────────────┐
│ ⬡ Execute Query          [MongoDB] │
│ List active developers              │
├─────────────────────────────────────┤
│ QUERY                               │
│ developers.find({"status":"<<$>>"}) │
│ .sort({createdAt:-1}).limit(<<$>>)  │
├─────────────────────────────────────┤
│ PARAMETERS (2)                      │
│ Param 1  [ active          ]        │
│ Param 2  [ 10              ]        │
├─────────────────────────────────────┤
│ [▶ Execute]                         │
└─────────────────────────────────────┘
```

On click Execute, frontend sends:

```js
// POST /dashboard/query/executeQuery
{
  id: "query_id_here",
  params: ["active", "10"]    // ← always strings from input fields
}
```

---

## STEP 5: Backend — executeQuery()

```js
const executeQuery = async (data) => {
  const { id, params } = data;
  const runtimeParams = Array.isArray(params) ? params : [];

  // 1. Load the stored query from DB
  const query = await Query.findById(id);

  // 2. Must be approved
  if (query.status !== "approved") throw new Error("Only approved queries");

  // 3. Parse the stored JSON
  const parsed = JSON.parse(query.queryString);
  // parsed = { command: "developers.find({\"status\":\"<<$>>\"}).limit(<<$>>)" }

  // 4. Route to the right executor
  if (query.type === "mongo") {
    result = await executeMongoQuery(parsed, runtimeParams);
  } else {
    result = await executeRedisQuery(parsed, runtimeParams);
  }
};
```

---

## STEP 6a: MongoDB Execution Pipeline

### 6a.1 — Split collection from chain

```js
const cmd = parsed.command.trim();
// "developers.find({\"status\":\"<<$>>\"}).limit(<<$>>)"

const dotIndex = cmd.indexOf(".");
collection = cmd.substring(0, dotIndex);    // "developers"
chain      = cmd.substring(dotIndex);       // ".find({\"status\":\"<<$>>\"}).limit(<<$>>)"
```

### 6a.2 — Replace placeholders (replacePlaceholders)

Two passes through the chain string:

**Pass 1 — Quoted placeholders `"<<$>>"`** (inside double quotes)
Used for string values like emails, names.

```
Input:  .find({"status": "<<$>>"})     params: ["active"]
                          ↓
Output: .find({"status": "active"})
```

**Pass 2 — Bare placeholders `<<$>>`** (no surrounding quotes)
Used for numbers, booleans, objects. **Auto-coerces types:**

```js
const val = params[paramIndex++];   // "10" (string from frontend)
try {
  const coerced = JSON.parse(val);  // 10 (number!)
  return JSON.stringify(coerced);   // "10" (unquoted number in chain)
} catch {
  return JSON.stringify(val);       // fallback: quoted string
}
```

```
Input:  .limit(<<$>>)     params: ["10"]
                ↓
        JSON.parse("10") → 10 (number)
        JSON.stringify(10) → "10" (no quotes in chain)
                ↓
Output: .limit(10)         ← correct integer!
```

**Coercion table:**

| User types | JSON.parse result | In chain as       |
|------------|-------------------|--------------------|
| `10`       | `10` (number)     | `10`              |
| `true`     | `true` (boolean)  | `true`            |
| `hello`    | throws → string   | `"hello"`         |
| `{"a":1}`  | object            | `{"a":1}`         |

### 6a.3 — Parse chain into method calls (parseChain)

After placeholder replacement, the chain is a string like:
```
.find({"status": "active"}).sort({"createdAt": -1}).limit(10)
```

The parser walks through character by character, matching parentheses:

```js
parseChain('.find({"status":"active"}).sort({"createdAt":-1}).limit(10)')

// Returns:
[
  { method: "find",  args: [{ status: "active" }] },
  { method: "sort",  args: [{ createdAt: -1 }] },
  { method: "limit", args: [10] }
]
```

How it works:
1. Find method name (characters before `(`)
2. Find matching `)` — tracks nesting depth, respects strings
3. Extract the argument substring, fix unquoted JS keys → valid JSON
4. `JSON.parse("[" + argsStr + "]")` → array of parsed arguments
5. Move to next `.method(...)`

### 6a.4 — Execute on MongoDB (Native Driver, NOT Mongoose)

**Important:** This does NOT use Mongoose models. It uses the **native MongoDB driver** through Mongoose's connection:

```js
const db = mongoose.connection.db;         // native Db object
const col = db.collection(collection);     // native Collection object

// Chain the methods
let cursor = col;
for (const { method, args } of methods) {
  cursor = cursor[method](...args);
  // Step 1: col.find({"status":"active"})       → returns Cursor
  // Step 2: cursor.sort({"createdAt":-1})        → returns Cursor
  // Step 3: cursor.limit(10)                     → returns Cursor
}

// If it's a cursor (from find/aggregate), convert to array
if (typeof cursor.toArray === "function") {
  return await cursor.toArray();    // → [{ doc1 }, { doc2 }, ...]
}
return await cursor;
```

**Why native driver instead of Mongoose?**
- Mongoose models enforce schemas — not what you want for a dynamic query tool
- `mongoose.connection.db` gives you the raw `Db` instance from the `mongodb` driver
- `.collection("developers")` gives a raw `Collection` — no schema, no middleware
- You can call `.find()`, `.aggregate()`, `.countDocuments()`, etc. directly

---

## STEP 6b: Redis Execution Pipeline

### 6b.1 — Replace placeholders in command

```js
let resolvedCmd = parsed.command.trim();   // "GET <<$>>"
// Replace <<$>> with runtime params
let idx = 0;
resolvedCmd = resolvedCmd.replace(/<<\$>>/g, () => runtimeParams[idx++]);
// resolvedCmd = "GET session:user123"
```

### 6b.2 — Split into command + args

```js
const parts = resolvedCmd.split(/\s+/);
command = parts[0];          // "GET"
args    = parts.slice(1);    // ["session:user123"]
```

### 6b.3 — Validate against allowed list

```js
const ALLOWED_REDIS_COMMANDS = [
  "GET", "MGET", "HGET", "HGETALL", "HMGET",
  "KEYS", "SCAN", "SMEMBERS", "SISMEMBER",
  "LRANGE", "LLEN", "TTL", "PTTL",
  "TYPE", "EXISTS", "DBSIZE", "INFO", "SCARD",
];
// Only read-only commands — no SET, DEL, FLUSHDB etc.
```

### 6b.4 — Execute via redis client

```js
const result = await redisClient.sendCommand(["GET", "session:user123"]);
// sendCommand takes an array: [COMMAND, ...args]
```

---

## Placeholder Summary

| In command | When to use | Example |
|---|---|---|
| `"<<$>>"` | String values (email, name) | `.find({"email": "<<$>>"})` |
| `<<$>>` | Numbers, booleans, objects | `.limit(<<$>>)` or `.find({active: <<$>>})` |

Both are filled **left to right** from the params array.

---

## Complete Example Trace

**Stored command:**
```
developers.find({"email": "<<$>>"}).limit(<<$>>)
```

**User enters at execution:**
- Param 1: `john@test.com`
- Param 2: `5`

**Backend processing:**
```
Step 1: Split
  collection = "developers"
  chain = '.find({"email": "<<$>>"}).limit(<<$>>)'

Step 2: Replace quoted "<<$>>" (Param 1)
  chain = '.find({"email": "john@test.com"}).limit(<<$>>)'

Step 3: Replace bare <<$>> (Param 2)
  "5" → JSON.parse("5") → 5 (number)
  chain = '.find({"email": "john@test.com"}).limit(5)'

Step 4: Parse chain
  [
    { method: "find",  args: [{ email: "john@test.com" }] },
    { method: "limit", args: [5] }
  ]

Step 5: Execute
  db.collection("developers")
    .find({ email: "john@test.com" })
    .limit(5)
    .toArray()

  → Returns up to 5 developer documents with that email
```
