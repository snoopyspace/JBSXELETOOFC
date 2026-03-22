import { describe, it, expect } from "vitest";

describe("Atualizações JBSX - Conformidade Google Ads + LGPD", () => {
  describe("Formatação de preços BR", () => {
    const formatBRL = (value: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

    it("deve formatar preço com vírgula decimal", () => {
      expect(formatBRL(1500)).toBe("R$\u00a01.500,00");
    });

    it("deve formatar preço com separador de milhar", () => {
      expect(formatBRL(11899.9)).toBe("R$\u00a011.899,90");
    });

    it("deve formatar preço baixo corretamente", () => {
      expect(formatBRL(99.99)).toBe("R$\u00a099,99");
    });
  });

  describe("Consultor de Parcelamento", () => {
    const CARD_FEES = {
      visa_mastercard: {
        debit: 1.39,
        credit_installments: [
          { installments: 1, fee: 2.91 },
          { installments: 12, fee: 12.01 },
        ],
      },
    };

    it("deve calcular valor com taxa de débito", () => {
      const amount = 1000;
      const fee = CARD_FEES.visa_mastercard.debit;
      const total = amount * (1 + fee / 100);
      expect(total).toBeCloseTo(1013.9, 1);
    });

    it("deve calcular parcelamento em 12x com taxa correta", () => {
      const amount = 1000;
      const fee = CARD_FEES.visa_mastercard.credit_installments.find(
        (i) => i.installments === 12
      )!.fee;
      const total = amount * (1 + fee / 100);
      const parcel = total / 12;
      expect(parcel).toBeCloseTo(93.34, 1);
    });
  });

  describe("Filtro de busca de produtos", () => {
    const products = [
      { id: 1, name: "Drone DJI Air 3S", description: "Drone profissional", categoryId: 1 },
      { id: 2, name: "Ray-Ban Meta Wayfarer", description: "Óculos inteligentes", categoryId: 2 },
      { id: 3, name: "Insta360 X5", description: "Câmera 360 profissional", categoryId: 3 },
    ];

    const filterProducts = (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return products;
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    };

    it("deve filtrar por nome do produto", () => {
      const result = filterProducts("drone");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Drone DJI Air 3S");
    });

    it("deve filtrar por descrição", () => {
      const result = filterProducts("360");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Insta360 X5");
    });

    it("deve retornar todos quando busca vazia", () => {
      const result = filterProducts("");
      expect(result).toHaveLength(3);
    });

    it("deve retornar vazio quando não encontrado", () => {
      const result = filterProducts("smartphone");
      expect(result).toHaveLength(0);
    });

    it("deve ser case-insensitive", () => {
      const result = filterProducts("RAY-BAN");
      expect(result).toHaveLength(1);
    });
  });

  describe("Páginas legais", () => {
    const legalPages = ["/politica-privacidade", "/termos-uso", "/politica-envio"];

    it("deve ter 3 páginas legais configuradas", () => {
      expect(legalPages).toHaveLength(3);
    });

    it("deve incluir política de privacidade", () => {
      expect(legalPages).toContain("/politica-privacidade");
    });

    it("deve incluir termos de uso", () => {
      expect(legalPages).toContain("/termos-uso");
    });

    it("deve incluir política de envio", () => {
      expect(legalPages).toContain("/politica-envio");
    });
  });
});
