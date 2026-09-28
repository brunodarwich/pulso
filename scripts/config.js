/**
 * Pulso - Configurações Gerais e Canais de Contato
 * 
 * Preencha o número de WhatsApp e/ou e-mail oficial abaixo quando disponíveis.
 * Se deixados em branco (""), a interface direcionará suavemente os botões
 * de contato para a seção final (#contato), sinalizando a pendência de forma limpa.
 */

const PulsoConfig = {
  // Número de WhatsApp no formato internacional sem espaços ou símbolos (Ex: "5593987654321")
  whatsappNumber: "",

  // E-mail oficial de contato (Ex: "contato@pulso.com.br")
  contactEmail: "",

  // Mensagens pré-formatadas para cada ponto de contato da página
  messages: {
    general: "Olá, Pulso! Queria saber como vocês podem ajudar em um projeto.",
    culturaDados: "Olá, Pulso! Queria saber mais sobre a consultoria em análise de dados para minha equipe.",
    processosIA: "Olá, Pulso! Queria conversar sobre o uso de IA nos processos da minha organização.",
    laNaBrasilia: "Olá, Pulso! Queria saber mais sobre o projeto Lá na Brasília.",
    guiaDeSaude: "Olá, Pulso! Queria saber mais sobre o projeto Guia de Saúde.",
    econexao: "Olá, Pulso! Queria saber mais sobre o projeto ECOnexão.",
    pontoAtm: "Olá, Pulso! Queria saber mais sobre o projeto pontoATM.",
    daRoca: "Olá, Pulso! Queria saber mais sobre o projeto da Roça.",
    redeAcademica: "Olá, Pulso! Queria saber mais sobre o projeto Rede Acadêmica."
  },

  // Retorna a URL completa de WhatsApp se configurado, ou "#contato" como fallback
  getWhatsAppUrl(contextKey = "general") {
    const rawNumber = (this.whatsappNumber || "").replace(/\D/g, "");
    if (!rawNumber) {
      return "#contato";
    }
    const message = this.messages[contextKey] || this.messages.general;
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
  },

  // Retorna a URL de mailto se configurado, ou "#contato" como fallback
  getEmailUrl(contextKey = "general") {
    const email = (this.contactEmail || "").trim();
    if (!email) {
      return "#contato";
    }
    const message = this.messages[contextKey] || this.messages.general;
    return `mailto:${email}?subject=${encodeURIComponent("Contato via site Pulso")}&body=${encodeURIComponent(message)}`;
  },

  isWhatsAppConfigured() {
    return Boolean(this.whatsappNumber && this.whatsappNumber.replace(/\D/g, "").length >= 10);
  },

  isEmailConfigured() {
    return Boolean(this.contactEmail && this.contactEmail.includes("@"));
  }
};

if (typeof window !== "undefined") {
  window.PulsoConfig = PulsoConfig;
}
