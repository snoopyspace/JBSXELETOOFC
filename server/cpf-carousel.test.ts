import { describe, it, expect } from "vitest";

// ===== CPF Validation Logic (mirrored from OrderForm) =====
function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;

  return true;
}

describe("CPF Validation", () => {
  it("should accept a valid CPF", () => {
    expect(validateCPF("529.982.247-25")).toBe(true);
    expect(validateCPF("52998224725")).toBe(true);
  });

  it("should reject all-same-digit CPFs", () => {
    expect(validateCPF("000.000.000-00")).toBe(false);
    expect(validateCPF("111.111.111-11")).toBe(false);
    expect(validateCPF("222.222.222-22")).toBe(false);
    expect(validateCPF("999.999.999-99")).toBe(false);
  });

  it("should reject CPF with wrong check digits", () => {
    expect(validateCPF("529.982.247-26")).toBe(false);
    expect(validateCPF("123.456.789-00")).toBe(false);
  });

  it("should reject CPF with fewer than 11 digits", () => {
    expect(validateCPF("123.456.789")).toBe(false);
    expect(validateCPF("1234567890")).toBe(false);
  });

  it("should reject empty CPF", () => {
    expect(validateCPF("")).toBe(false);
  });
});

// ===== Carousel Fee Calculation =====
describe("Installment Fee Calculation", () => {
  const VISA_FEES = [
    { installments: 1, fee: 2.91 },
    { installments: 6, fee: 7.69 },
    { installments: 12, fee: 12.01 },
    { installments: 18, fee: 16.03 },
  ];

  it("should calculate correct total for 1x", () => {
    const amount = 1000;
    const entry = VISA_FEES.find(f => f.installments === 1)!;
    const total = amount * (1 + entry.fee / 100);
    expect(total).toBeCloseTo(1029.1, 1);
  });

  it("should calculate correct installment value for 12x", () => {
    const amount = 1200;
    const entry = VISA_FEES.find(f => f.installments === 12)!;
    const total = amount * (1 + entry.fee / 100);
    const parcel = total / 12;
    expect(parcel).toBeCloseTo(112.01, 1);
  });

  it("should calculate fee amount correctly", () => {
    const amount = 1000;
    const fee = 10.61; // 10x
    const feeAmount = amount * fee / 100;
    expect(feeAmount).toBeCloseTo(106.1, 1);
  });
});
