import { describe, expect, it } from "vitest";
const plain = (s: string) => s.replace(/\s/g, " ");
import { formatEuros, formatIban, formatWeddingDate, formatWeddingTime, formatPhone } from "./format";

describe("formatos portugueses", () => {
  const startsAt = "2027-06-12T15:00:00Z"; // 16h00 em Lisboa (hora de verão)

  it("escreve a data por extenso, com o dia da semana", () => {
    expect(formatWeddingDate(startsAt, "Europe/Lisbon")).toBe("Sábado, 12 de junho de 2027");
  });

  it("escreve a hora no fuso do casamento, à portuguesa", () => {
    expect(formatWeddingTime(startsAt, "Europe/Lisbon")).toBe("16h00");
    expect(formatWeddingTime("2027-06-12T14:30:00Z", "Europe/Lisbon")).toBe("15h30");
  });

  it("escreve valores em euros a partir de cêntimos", () => {
    expect(plain(formatEuros(150000))).toBe("1500 €");
    expect(plain(formatEuros(9550))).toBe("95,50 €");
    expect(plain(formatEuros(0))).toBe("0 €");
  });

  it("agrupa o IBAN em blocos de quatro", () => {
    expect(formatIban("PT50000201231234567890154")).toBe("PT50 0002 0123 1234 5678 9015 4");
  });

  it("agrupa o número MB WAY", () => {
    expect(formatPhone("+351912345678")).toBe("+351 912 345 678");
  });
});
