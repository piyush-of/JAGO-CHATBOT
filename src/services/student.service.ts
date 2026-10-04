import { mockStudentProvider } from "../adapters/mock.adapters.js";
import type { StudentProvider } from "../types/index.js";

// Swap for an SFMP/NSP-backed provider when credentials are available.
const provider: StudentProvider = mockStudentProvider;

export const getStudent = (id: string) => provider.getStudent(id);
