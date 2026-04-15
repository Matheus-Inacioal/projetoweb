import { format } from "date-fns";
import type { DiaSemana } from "@/tipos/enums";

const mapaDiaSemana: DiaSemana[] = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];

export function obterDiaSemanaPorData(data: Date) {
  return mapaDiaSemana[data.getDay()];
}

export function criarDataLocal(data: string | Date) {
  if (data instanceof Date) {
    return new Date(data);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  return new Date(data);
}

export function converterHoraParaMinutos(hora: string) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

export function converterMinutosParaHora(totalMinutos: number) {
  const horas = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
  const minutos = String(totalMinutos % 60).padStart(2, "0");
  return `${horas}:${minutos}`;
}

export function somarMinutosNaHora(hora: string, minutosParaSomar: number) {
  return converterMinutosParaHora(converterHoraParaMinutos(hora) + minutosParaSomar);
}

export function combinarDataHora(data: string | Date, hora: string) {
  const dataBase = criarDataLocal(data);
  const [horas, minutos] = hora.split(":").map(Number);
  const dataHora = new Date(dataBase);
  dataHora.setHours(horas, minutos, 0, 0);
  return dataHora;
}

export function normalizarData(data: string | Date) {
  const dataNormalizada = criarDataLocal(data);
  dataNormalizada.setHours(0, 0, 0, 0);
  return dataNormalizada;
}

export function formatarData(data: string | Date) {
  return format(criarDataLocal(data), "dd/MM/yyyy");
}

export function formatarDataHora(data: string | Date, hora?: string) {
  const dataConvertida = criarDataLocal(data);
  const textoData = format(dataConvertida, "dd/MM/yyyy");
  return hora ? `${textoData} as ${hora}` : textoData;
}

export function formatarDataParaInput(data: string | Date) {
  const dataConvertida = normalizarData(data);
  const ano = dataConvertida.getFullYear();
  const mes = String(dataConvertida.getMonth() + 1).padStart(2, "0");
  const dia = String(dataConvertida.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function adicionarDias(data: string | Date, quantidadeDias: number) {
  const dataBase = normalizarData(data);
  dataBase.setDate(dataBase.getDate() + quantidadeDias);
  return dataBase;
}

export function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
}
