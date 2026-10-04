export type Scheme =
  | "pre-matric"
  | "post-matric"
  | "top-class"
  | "nfst"
  | "nos";

export interface StudentProfile {
  id: string;
  name: string;
  category: string;
  state: string;
  course: string;
  level: "School" | "UG" | "PG" | "PhD";
  year: number;
  annualFamilyIncomeLakh: number;
}

export interface ScholarshipApplication {
  scheme: string;
  applicationId: string;
  status: string;
  paymentStatus: string;
  deficiency?: string;
  lastUpdated: string;
}

// Adapter contracts: replace the mock implementations with NSP / SFMP / NOS clients.
export interface StudentProvider {
  getStudent(studentId: string): Promise<StudentProfile | null>;
}
export interface ScholarshipProvider {
  getApplications(studentId: string): Promise<ScholarshipApplication[]>;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  at: number;
}
