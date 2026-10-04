import type {
  ScholarshipApplication,
  ScholarshipProvider,
  StudentProfile,
  StudentProvider
} from "../types/index.js";

const students: Record<string, StudentProfile> = {
  STU001: {
    id: "STU001", name: "Rahul Kumar", category: "ST", state: "Madhya Pradesh",
    course: "B.Tech", level: "UG", year: 2, annualFamilyIncomeLakh: 1.8
  },
  STU002: {
    id: "STU002", name: "Aman Singh", category: "ST", state: "Rajasthan",
    course: "B.Sc", level: "UG", year: 1, annualFamilyIncomeLakh: 3.4
  },
  STU003: {
    id: "STU003", name: "Sita Maravi", category: "ST", state: "Chhattisgarh",
    course: "M.Sc", level: "PG", year: 1, annualFamilyIncomeLakh: 2.1
  }
};

const applications: Record<string, ScholarshipApplication[]> = {
  STU001: [{
    scheme: "Post-Matric Scholarship", applicationId: "PM202610482",
    status: "District Verification Pending", paymentStatus: "Not Initiated",
    lastUpdated: "2026-09-28"
  }],
  STU002: [{
    scheme: "Pre-Matric Scholarship", applicationId: "PR202610291",
    status: "Sanctioned", paymentStatus: "DBT Processed", lastUpdated: "2026-09-20"
  }],
  STU003: [{
    scheme: "Post-Matric Scholarship", applicationId: "PM202610733",
    status: "Returned to student: deficiency raised", paymentStatus: "Not Initiated",
    deficiency: "Income certificate is unreadable. Re-upload a clear, valid copy.",
    lastUpdated: "2026-10-01"
  }]
};

export const mockStudentProvider: StudentProvider = {
  async getStudent(id) { return students[id] ?? null; }
};

export const mockScholarshipProvider: ScholarshipProvider = {
  async getApplications(id) { return applications[id] ?? []; }
};
