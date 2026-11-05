import { describe, expect, it } from "vitest";
import { normalizeIban, normalizePhone, parseEuros, slugify, splitNames, utcToZoned, zonedToUtc } from "./input";

describe("datas no fuso do casamento", () => {
  it("converte data e hora de Lisboa (verão) para UTC", () => {
    expect(zonedToUtc("2027-06-12", "16:00", "Europe/Lisbon")).toBe("2027-06-12T15:00:00.000Z");
  });

  it("converte data e hora de Lisboa (inverno) para UTC", () => {
    expect(zonedToUtc("2027-01-09", "16:00", "Europe/Lisbon")).toBe("2027-01-09T16:00:00.000Z");
  });

  it("devolve a data e a hora no fuso, para preencher o formulário", () => {
    expect(utcToZoned("2027-06-12T15:00:00Z", "Europe/Lisbon")).toEqual({ date: "2027-06-12", time: "16:00" });
  });
});

describe("link do casamento", () => {
  it("cria um slug sem acentos a partir dos nomes", () => {
    expect(slugify("Conceição", "João")).toBe("conceicao-e-joao");
    expect(slugify("  Ana Maria ", "Rui")).toBe("ana-maria-e-rui");
  });
});

describe("valores em euros", () => {
  it("lê valores escritos à portuguesa e devolve cêntimos", () => {
    expect(parseEuros("120")).toBe(12000);
    expect(parseEuros("95,50")).toBe(9550);
    expect(parseEuros("1.500,00")).toBe(150000);
    expect(parseEuros("12.5")).toBe(1250);
    expect(parseEuros("")).toBeNull();
    expect(parseEuros("abc")).toBeNull();
  });
});

describe("dados de pagamento", () => {
  it("normaliza o IBAN e o número MB WAY", () => {
    expect(normalizeIban(" pt50 0002 0123 1234 5678 9015 4 ")).toBe("PT50000201231234567890154");
    expect(normalizePhone("912 345 678")).toBe("+351912345678");
    expect(normalizePhone("+351 912 345 678")).toBe("+351912345678");
  });
});

describe("nomes dos pais", () => {
  it("separa um nome por linha e ignora linhas vazias", () => {
    expect(splitNames("António Santos\n\n Helena Santos \n")).toEqual(["António Santos", "Helena Santos"]);
  });
});
