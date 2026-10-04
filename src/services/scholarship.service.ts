import { mockScholarshipProvider } from "../adapters/mock.adapters.js";
import type { ScholarshipProvider } from "../types/index.js";

// Swap for an NSP/SFMP/NOS-backed provider when credentials are available.
const provider: ScholarshipProvider = mockScholarshipProvider;

export const getScholarshipStatus = (id: string) => provider.getApplications(id);
