const base = process.env.BASE_URL ?? "http://localhost:5000";
const headers = { "Content-Type": "application/json", ...(process.env.JAGO_API_KEY ? { "x-jago-api-key": process.env.JAGO_API_KEY } : {}) };

for (const [studentId, message] of [
  ["STU001", "Meri scholarship ka status kya hai?"],
  ["STU003", "What is my application status?"],
  ["STU001", "Which documents are required for post matric?"]
]) {
  const r = await fetch(`${base}/api/v1/chat`, { method: "POST", headers, body: JSON.stringify({ studentId, message }) });
  const j = await r.json();
  console.log(`\n[${studentId}] ${message}\n=> ${r.status} ${j.data?.mode} tools=${j.data?.toolsUsed}\n${j.data?.reply ?? JSON.stringify(j)}`);
}
