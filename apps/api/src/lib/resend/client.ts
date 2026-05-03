import { Resend } from "resend";

function resolveResendApiKey(): string {
  const key = process.env.RESEND_API_KEY?.trim();
  if (key) return key;
  if (process.env.GITHUB_ACTIONS === "true") {
    return "re_ci_build_placeholder_00000000000000000000000000";
  }
  throw new Error("RESEND_API_KEY must be set at runtime.");
}

let resendSingleton: Resend | null = null;

function getResend(): Resend {
  if (!resendSingleton) {
    resendSingleton = new Resend(resolveResendApiKey());
  }
  return resendSingleton;
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const client = getResend();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

const FROM_EMAIL = "TeleMed <noreply@telemed.app>";

export async function sendConsultationConfirmation(params: {
  to: string;
  patientName: string;
  professionalName: string;
  scheduledAt: string;
  consultationId: string;
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Consulta Confirmada - TeleMed",
    html: `
      <h1>Consulta Confirmada</h1>
      <p>Olá ${params.patientName},</p>
      <p>Sua consulta foi agendada com sucesso!</p>
      <ul>
        <li><strong>Profissional:</strong> ${params.professionalName}</li>
        <li><strong>Data/Hora:</strong> ${new Date(params.scheduledAt).toLocaleString("pt-BR")}</li>
        <li><strong>ID da Consulta:</strong> ${params.consultationId}</li>
      </ul>
      <p>Acesse o app no horário agendado para iniciar a teleconsulta.</p>
    `,
  });
}

export async function sendPrescriptionReady(params: {
  to: string;
  patientName: string;
  prescriptionId: string;
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Sua Receita Digital Está Pronta - TeleMed",
    html: `
      <h1>Receita Digital Disponível</h1>
      <p>Olá ${params.patientName},</p>
      <p>Sua receita digital foi emitida e está disponível no aplicativo.</p>
      <p>Acesse a aba "Receitas" para visualizar e baixar o documento.</p>
    `,
  });
}

export async function sendAppointmentReminder(params: {
  to: string;
  patientName: string;
  professionalName: string;
  scheduledAt: string;
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Lembrete de Consulta - TeleMed",
    html: `
      <h1>Lembrete de Consulta</h1>
      <p>Olá ${params.patientName},</p>
      <p>Sua consulta com ${params.professionalName} está agendada para:</p>
      <p><strong>${new Date(params.scheduledAt).toLocaleString("pt-BR")}</strong></p>
      <p>Não se esqueça de acessar o app no horário marcado!</p>
    `,
  });
}
