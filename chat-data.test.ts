import test from "node:test"
import assert from "node:assert/strict"

import { formatTime } from "./lib/chat-data"

test("formatTime uses UTC so server and client render the same timestamp", () => {
  const ts = Date.UTC(2026, 8, 5, 5, 15, 0)
  const oldTz = process.env.TZ
  process.env.TZ = "America/New_York"

  try {
    const actual = formatTime(ts)
    const expected = new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: true,
    })

    assert.equal(actual, expected)
  } finally {
    if (oldTz === undefined) {
      delete process.env.TZ
    } else {
      process.env.TZ = oldTz
    }
  }
})
