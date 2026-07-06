import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "upload", label: "Meetings" },
  { id: "repository", label: "Decisions" },
  { id: "actions", label: "Action Items" },
  { id: "knowledge", label: "Knowledge Base" },
  { id: "settings", label: "Settings" },
];

const stats = [
  ["Pending AI Reviews", "6", "3 need owner confirmation"],
  ["Recent Meetings", "12", "Uploaded this week"],
  ["Open Action Items", "28", "9 due this week"],
  ["Approved Decisions", "84", "Across active projects"],
  ["Overdue Tasks", "5", "Needs follow-up today"],
];

const stages = [
  "Transcript validation",
  "AI decision extraction",
  "Action item extraction",
  "Owner detection",
  "Confidence scoring",
  "Results ready",
];

const decisions = [
  {
    decision: "Approve beta launch after QA signoff",
    project: "Mobile Beta",
    owner: "Priya Shah",
    meeting: "Product Review Meeting",
    date: "Jul 03, 2026",
    status: "Approved",
    score: 92,
  },
  {
    decision: "Delay analytics dashboard to post-MVP",
    project: "Analytics",
    owner: "Jon Bell",
    meeting: "Sprint Planning - July 2026",
    date: "Jul 02, 2026",
    status: "Pending",
    score: 81,
  },
  {
    decision: "Use manual QA checklist for onboarding",
    project: "Onboarding",
    owner: "Maya Chen",
    meeting: "QA Sync",
    date: "Jun 30, 2026",
    status: "Approved",
    score: 89,
  },
  {
    decision: "Move billing export to next release",
    project: "Billing",
    owner: "Alex Morgan",
    meeting: "Release Triage",
    date: "Jun 28, 2026",
    status: "Rejected",
    score: 64,
  },
];

const actions = [
  ["Maya to finalize onboarding flow by Friday", "Maya Chen", "Manual QA checklist", "Jul 10", "In Progress"],
  ["Priya to verify QA signoff criteria", "Priya Shah", "Beta launch approval", "Jul 08", "Open"],
  ["Jon to update MVP scope note", "Jon Bell", "Analytics delay", "Jul 09", "Blocked"],
  ["Alex to notify finance stakeholders", "Alex Morgan", "Billing export", "Jul 12", "Completed"],
  ["Sam to attach transcript evidence", "Sam Lee", "Beta launch approval", "Jul 07", "Overdue"],
];

const transcriptLines = [
  ["Maya", "The onboarding checklist is stable enough for beta, but final copy needs one more pass."],
  ["Priya", "I am comfortable approving the beta launch once QA signs off on the regression list."],
  ["Jon", "Analytics dashboard can move after MVP. It is not blocking the July release."],
  ["Sam", "Let's capture those as decisions and assign owners before we close."],
];

function App() {
  const [screen, setScreen] = React.useState("dashboard");
  const currentLabel = navItems.find((item) => item.id === screen)?.label || screenTitles[screen];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-[1440px] border-x border-neutral-200">
        <Sidebar current={screen} onNavigate={setScreen} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={currentLabel} onUpload={() => setScreen("upload")} />
          <main className="flex-1 bg-neutral-50 p-8">
            {screen === "dashboard" && <Dashboard go={setScreen} />}
            {screen === "upload" && <UploadMeeting go={setScreen} />}
            {screen === "processing" && <AIProcessing go={setScreen} />}
            {screen === "review" && <AIReview go={setScreen} />}
            {screen === "repository" && <DecisionRepository go={setScreen} />}
            {screen === "detail" && <DecisionDetail />}
            {screen === "actions" && <ActionDashboard />}
            {screen === "settings" && <WorkspaceSettings />}
            {screen === "knowledge" && <KnowledgeBase />}
          </main>
        </div>
      </div>
    </div>
  );
}

const screenTitles = {
  processing: "AI Processing",
  review: "AI Review",
  detail: "Decision Detail",
};

function Sidebar({ current, onNavigate }) {
  return (
    <aside className="w-64 shrink-0 border-r border-neutral-300 bg-white">
      <div className="border-b border-neutral-300 px-6 py-5">
        <div className="text-xl font-semibold tracking-tight">DecisionFlow</div>
        <div className="mt-1 text-sm text-neutral-500">Decision intelligence</div>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`h-10 w-full rounded-md border px-3 text-left text-sm ${
              current === item.id
                ? "border-neutral-900 bg-neutral-200 font-medium"
                : "border-transparent text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mx-4 mt-6 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
        <div className="font-medium text-neutral-800">Review queue</div>
        <div className="mt-1">6 AI outputs pending approval</div>
      </div>
    </aside>
  );
}

function Header({ title, onUpload }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-300 bg-white px-8">
      <div>
        <div className="text-sm text-neutral-500">Workspace / Product Team</div>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <input className="h-9 w-72 rounded-md border border-neutral-300 bg-white px-3 text-sm" placeholder="Search decisions, meetings, actions" />
        <PrimaryButton onClick={onUpload}>Upload Meeting</PrimaryButton>
      </div>
    </header>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button onClick={onClick} className="h-9 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700">
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button onClick={onClick} className="h-9 rounded-md border border-neutral-400 bg-white px-4 text-sm font-medium text-neutral-800 hover:bg-neutral-100">
      {children}
    </button>
  );
}

function Card({ title, children, action }) {
  return (
    <section className="rounded-lg border border-neutral-300 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Dashboard({ go }) {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Welcome back, Product Team</h2>
          <p className="mt-1 text-sm text-neutral-600">Review AI-detected decisions, approve outputs, and keep follow-up work moving.</p>
        </div>
        <div className="flex gap-3">
          <SecondaryButton onClick={() => go("review")}>Continue AI Review</SecondaryButton>
          <PrimaryButton onClick={() => go("upload")}>Quick Upload Meeting</PrimaryButton>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {stats.map(([title, value, caption]) => (
          <Card key={title} title={title}>
            <div className="text-3xl font-semibold">{value}</div>
            <div className="mt-2 text-sm text-neutral-500">{caption}</div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-[1.15fr_0.85fr] gap-6">
        <Card title="Recent Decision Timeline" action={<SecondaryButton onClick={() => go("repository")}>View All</SecondaryButton>}>
          <div className="space-y-4">
            {decisions.slice(0, 3).map((item) => (
              <TimelineItem key={item.decision} {...item} />
            ))}
          </div>
        </Card>
        <Card title="Open Action Items" action={<SecondaryButton onClick={() => go("actions")}>Open Board</SecondaryButton>}>
          <div className="space-y-3">
            {actions.slice(0, 4).map(([task, owner, , due, status]) => (
              <div key={task} className="rounded-md border border-neutral-200 p-3">
                <div className="font-medium">{task}</div>
                <div className="mt-2 flex items-center justify-between text-sm text-neutral-600">
                  <span>{owner} - Due {due}</span>
                  <StatusBadge status={status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function UploadMeeting({ go }) {
  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      <Card title="Meeting Details">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Meeting title" value="Sprint Planning - July 2026" />
          <Field label="Project" value="Mobile Beta" />
          <Field label="Meeting date" value="July 5, 2026" />
          <Field label="Participants" value="Maya Chen, Priya Shah, Jon Bell, Sam Lee" />
        </div>
        <div className="mt-5 rounded-lg border-2 border-dashed border-neutral-400 bg-neutral-100 p-10 text-center">
          <div className="text-base font-medium">Drag and drop transcript file</div>
          <div className="mt-2 text-sm text-neutral-600">TXT, DOCX, PDF, or meeting export</div>
          <SecondaryButton>Browse Files</SecondaryButton>
        </div>
        <label className="mt-5 block">
          <span className="text-sm font-medium">Paste transcript text</span>
          <textarea className="mt-2 h-48 w-full rounded-md border border-neutral-300 bg-white p-3 text-sm" defaultValue="Maya: The onboarding checklist is stable enough for beta..." />
        </label>
        <div className="mt-5 flex justify-end">
          <PrimaryButton onClick={() => go("processing")}>Submit for AI Analysis</PrimaryButton>
        </div>
      </Card>
      <Card title="What AI will extract">
        <p className="text-sm leading-6 text-neutral-600">DecisionFlow analyzes transcripts for decisions, action items, owners, due dates, evidence, and confidence scores. AI outputs remain pending until a teammate reviews and approves them.</p>
        <div className="mt-5 space-y-3">
          {["Decisions", "Action items", "Owners", "Due dates", "Supporting evidence"].map((item) => (
            <div key={item} className="rounded-md border border-neutral-300 bg-neutral-50 p-3 text-sm font-medium">{item}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AIProcessing({ go }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card title="Processing Sprint Planning - July 2026">
        <div className="mb-6 h-3 rounded-full bg-neutral-200">
          <div className="h-3 w-4/5 rounded-full bg-neutral-800" />
        </div>
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div key={stage} className="flex items-center justify-between rounded-md border border-neutral-300 bg-neutral-50 p-3">
              <span className="font-medium">{stage}</span>
              <StatusBadge status={index < 4 ? "Complete" : index === 4 ? "Running" : "Pending"} />
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-dashed border-neutral-400 bg-white p-4 text-sm text-neutral-600">
          Retry state: if processing fails, this area shows the failed stage, error reason, and a Retry Analysis button.
        </div>
        <div className="mt-6 flex justify-end">
          <PrimaryButton onClick={() => go("review")}>View AI Review</PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

function AIReview({ go }) {
  return (
    <div className="grid grid-cols-[0.95fr_1.05fr] gap-6">
      <Card title="Meeting Transcript Preview" action={<input className="h-9 w-64 rounded-md border border-neutral-300 px-3 text-sm" placeholder="Search transcript" />}>
        <div className="space-y-3">
          {transcriptLines.map(([speaker, text]) => (
            <div key={text} className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-semibold uppercase text-neutral-500">{speaker}</div>
              <p className="mt-1 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Pending AI-Generated Content" action={<SecondaryButton>Save Progress</SecondaryButton>}>
        <div className="space-y-4">
          {decisions.slice(0, 2).map((item) => (
            <ReviewPanel key={item.decision} title={item.decision} score={item.score} type="Extracted Decision" />
          ))}
          {actions.slice(0, 2).map(([task]) => (
            <ReviewPanel key={task} title={task} score={86} type="Extracted Action Item" />
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <PrimaryButton onClick={() => go("repository")}>Finish Review</PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

function ReviewPanel({ type, title, score }) {
  return (
    <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase text-neutral-500">{type} - Pending Review</div>
          <div className="mt-1 font-medium">{title}</div>
        </div>
        <ConfidenceScore score={score} />
      </div>
      <div className="mt-3 rounded-md border border-neutral-300 bg-white p-3 text-sm text-neutral-600">Evidence: "comfortable approving the beta launch once QA signs off..."</div>
      <ReviewActions />
    </div>
  );
}

function ReviewActions() {
  return (
    <div className="mt-4 flex gap-2">
      <SecondaryButton>Edit</SecondaryButton>
      <PrimaryButton>Approve</PrimaryButton>
      <SecondaryButton>Reject</SecondaryButton>
    </div>
  );
}

function DecisionRepository({ go }) {
  return (
    <div className="space-y-5">
      <FilterBar filters={["Project", "Owner", "Date", "Status"]} placeholder="Search decisions" />
      <Card title="Decision List">
        <DataTable
          columns={["Decision", "Project", "Owner", "Source Meeting", "Date", "Status"]}
          rows={decisions.map((item) => [
            <button className="font-medium underline underline-offset-2" onClick={() => go("detail")}>{item.decision}</button>,
            item.project,
            item.owner,
            item.meeting,
            item.date,
            <StatusBadge status={item.status} />,
          ])}
        />
      </Card>
    </div>
  );
}

function DecisionDetail() {
  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      <Card title="Decision Statement">
        <div className="flex items-start justify-between gap-6">
          <h2 className="text-2xl font-semibold">Approve beta launch after QA signoff</h2>
          <StatusBadge status="Approved" />
        </div>
        <div className="mt-6 grid grid-cols-4 gap-4">
          <InfoBox label="Source meeting" value="Product Review Meeting" />
          <InfoBox label="Project" value="Mobile Beta" />
          <InfoBox label="Owner" value="Priya Shah" />
          <InfoBox label="Due date" value="Jul 10, 2026" />
        </div>
        <div className="mt-6 rounded-md border border-neutral-300 bg-neutral-50 p-4">
          <div className="text-sm font-semibold">Supporting evidence from transcript</div>
          <p className="mt-2 text-sm leading-6 text-neutral-700">Priya: I am comfortable approving the beta launch once QA signs off on the regression list.</p>
        </div>
        <div className="mt-6">
          <h3 className="mb-3 font-semibold">Related action items</h3>
          <DataTable columns={["Task", "Owner", "Due Date", "Status"]} rows={actions.slice(0, 3).map(([task, owner, , due, status]) => [task, owner, due, <StatusBadge status={status} />])} />
        </div>
      </Card>
      <div className="space-y-6">
        <Card title="AI Confidence"><ConfidenceScore score={92} large /></Card>
        <Card title="Approval History">
          <div className="space-y-3 text-sm">
            <TimelineMini title="AI extracted decision" date="Jul 03, 10:16 AM" />
            <TimelineMini title="Edited owner field" date="Jul 03, 10:22 AM" />
            <TimelineMini title="Approved by Priya Shah" date="Jul 03, 10:24 AM" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ActionDashboard() {
  const summaries = ["Open Actions", "In Progress", "Completed", "Blocked", "Overdue"];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-4">
        {summaries.map((item, index) => (
          <Card key={item} title={item}>
            <div className="text-3xl font-semibold">{[14, 8, 31, 3, 5][index]}</div>
          </Card>
        ))}
      </div>
      <FilterBar filters={["Owner", "Project", "Status"]} placeholder="Search action items" />
      <Card title="Action Item Table">
        <DataTable
          columns={["Task", "Owner", "Related Decision", "Due Date", "Status"]}
          rows={actions.map(([task, owner, decision, due, status]) => [task, owner, decision, due, <StatusBadge status={status} />])}
        />
      </Card>
    </div>
  );
}

function WorkspaceSettings() {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-6">
      <Card title="Workspace">
        <Field label="Workspace name" value="DecisionFlow Product Team" />
        <div className="mt-5 flex justify-end"><PrimaryButton>Save Settings</PrimaryButton></div>
      </Card>
      <Card title="Team Members" action={<PrimaryButton>Invite Member</PrimaryButton>}>
        <DataTable columns={["Name", "Email", "Role"]} rows={[
          ["Priya Shah", "priya@example.com", "Admin"],
          ["Maya Chen", "maya@example.com", "Editor"],
          ["Jon Bell", "jon@example.com", "Viewer"],
        ]} />
      </Card>
      <Card title="Notification Preferences">
        <SettingsList items={["Notify owners when actions are assigned", "Weekly decision digest", "Overdue task reminders"]} />
      </Card>
      <Card title="AI Review Settings">
        <SettingsList items={["Require human approval for all decisions", "Flag confidence scores below 75%", "Auto-detect owners from participant list"]} />
      </Card>
      <Card title="Security Settings Placeholder">
        <div className="h-28 rounded-md border border-dashed border-neutral-400 bg-neutral-100" />
      </Card>
    </div>
  );
}

function KnowledgeBase() {
  return (
    <Card title="Knowledge Base Empty State">
      <div className="flex h-80 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-100 text-center">
        <div>
          <div className="text-lg font-semibold">No knowledge items yet</div>
          <p className="mt-2 max-w-md text-sm text-neutral-600">Approved decisions and source evidence can be organized here once the workspace starts publishing decision records.</p>
        </div>
      </div>
    </Card>
  );
}

function FilterBar({ filters, placeholder }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-300 bg-white p-4">
      <input className="h-9 flex-1 rounded-md border border-neutral-300 px-3 text-sm" placeholder={placeholder} />
      {filters.map((filter) => (
        <button key={filter} className="h-9 rounded-md border border-neutral-300 bg-neutral-50 px-4 text-sm">{filter}</button>
      ))}
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-neutral-300 bg-neutral-100">
          {columns.map((column) => <th key={column} className="px-3 py-3 font-semibold">{column}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-b border-neutral-200">
            {row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3 align-top">{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Field({ label, value }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input className="mt-2 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm" defaultValue={value} />
    </label>
  );
}

function StatusBadge({ status }) {
  return <span className="inline-flex h-7 items-center rounded-md border border-neutral-400 bg-white px-2 text-xs font-medium text-neutral-700">{status}</span>;
}

function ConfidenceScore({ score, large = false }) {
  return (
    <div className={large ? "w-full" : "w-28"}>
      <div className="flex items-center justify-between text-xs font-medium text-neutral-600">
        <span>Confidence</span>
        <span>{score}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-neutral-200">
        <div className="h-2 rounded-full bg-neutral-800" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function TimelineItem({ decision, project, meeting, status }) {
  return (
    <div className="grid grid-cols-[16px_1fr_auto] gap-3">
      <div className="mt-1 h-4 w-4 rounded-full border border-neutral-700 bg-white" />
      <div>
        <div className="font-medium">{decision}</div>
        <div className="mt-1 text-sm text-neutral-600">{project} - {meeting}</div>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function TimelineMini({ title, date }) {
  return (
    <div className="rounded-md border border-neutral-300 bg-neutral-50 p-3">
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-neutral-500">{date}</div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-md border border-neutral-300 bg-neutral-50 p-3">
      <div className="text-xs font-semibold uppercase text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function SettingsList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <label key={item} className="flex items-center justify-between rounded-md border border-neutral-300 bg-neutral-50 p-3 text-sm">
          <span>{item}</span>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </label>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
