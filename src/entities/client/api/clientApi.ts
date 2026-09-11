import { ok, type Result } from "@/shared/api";
import { mockClients } from "./mock";
import type { Client } from "../model/types";

/**
 * Точка подмены источника данных. Сейчас отдаёт фикстуры;
 * при появлении бэкенда меняется только тело функции — потребители не трогаются.
 */
export async function getClients(): Promise<Result<Client[]>> {
  return ok(mockClients);
}
