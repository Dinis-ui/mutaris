import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "@/lib/format";

const now = new Date("2026-01-10T12:00:00Z");
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000);

describe("formatRelativeTime", () => {
  it("mostra minutos, horas e ontem", () => {
    expect(formatRelativeTime(ago(0), now)).toBe("Agora mesmo");
    expect(formatRelativeTime(ago(1), now)).toBe("Há 1 minuto");
    expect(formatRelativeTime(ago(5), now)).toBe("Há 5 minutos");
    expect(formatRelativeTime(ago(60), now)).toBe("Há 1 hora");
    expect(formatRelativeTime(ago(180), now)).toBe("Há 3 horas");
    expect(formatRelativeTime(ago(25 * 60), now)).toBe("Ontem");
  });
});
