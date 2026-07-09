"use client";

import {
  ArrowRight,
  BarChart3,
  CheckSquare,
  ChevronRight,
  Circle,
  FileText,
  FolderOpen,
  Home,
  Lock,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Upload,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

type PackagePage = "cover" | "flow" | "ia" | "wireframes" | "components" | "prototype";
type ScreenId =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "newDecision"
  | "uploadTranscript"
  | "aiExtraction"
  | "reviewExtraction"
  | "workspace"
  | "recommendation"
  | "compare"
  | "library"
  | "profile"
  | "settings";

type ScreenDefinition = {
  id: ScreenId;
  number: string;
  name: string;
  purpose: string;
};

type InputMethod = "upload" | "paste" | "import" | "manual";

type PrototypeState = {
  inputMethod: InputMethod | null;
  hasTranscriptFile: boolean;
  transcriptText: string;
  extractedFields: Record<string, string>;
  guardMessage: string | null;
};

const packagePages: Array<{ id: PackagePage; label: string }> = [
  { id: "cover", label: "00 Cover" },
  { id: "flow", label: "01 User Flow" },
  { id: "ia", label: "02 Information Architecture" },
  { id: "wireframes", label: "03 Wireframes" },
  { id: "components", label: "04 Components" },
  { id: "prototype", label: "05 Prototype" },
];

const screens: ScreenDefinition[] = [
  { id: "landing", number: "LF-01", name: "Landing", purpose: "Introduce DecisionFlow and start the MVP flow." },
  { id: "login", number: "LF-02", name: "Login", purpose: "Authenticate an existing user." },
  { id: "register", number: "LF-03", name: "Register", purpose: "Create a new account." },
  { id: "dashboard", number: "LF-04", name: "Dashboard", purpose: "Review recent decisions and start a new one." },
  { id: "newDecision", number: "LF-05", name: "New Decision", purpose: "Choose how to begin decision input." },
  { id: "uploadTranscript", number: "LF-06", name: "Upload Transcript", purpose: "Upload or paste a meeting transcript." },
  { id: "aiExtraction", number: "LF-07", name: "AI Extraction", purpose: "Show extraction progress and current AI step." },
  { id: "reviewExtraction", number: "LF-08", name: "Review Extracted Information", purpose: "Edit extracted fields before analysis." },
  { id: "workspace", number: "LF-09", name: "Decision Workspace", purpose: "Adjust criteria, weights, notes, and analysis readiness." },
  { id: "recommendation", number: "LF-10", name: "AI Recommendation", purpose: "Review recommendation, confidence, reasoning, and risks." },
  { id: "compare", number: "LF-11", name: "Compare Options", purpose: "Compare options against criteria and AI scores." },
  { id: "library", number: "LF-12", name: "Decision Library", purpose: "Find and open saved decisions." },
  { id: "profile", number: "LF-13", name: "Profile", purpose: "Manage user account details." },
  { id: "settings", number: "LF-14", name: "Settings", purpose: "Set preferences, privacy, and AI behavior." },
];

const prototypeOrder: ScreenId[] = [
  "dashboard",
  "newDecision",
  "uploadTranscript",
  "aiExtraction",
  "reviewExtraction",
  "workspace",
  "recommendation",
  "compare",
  "library",
];

const extractionFields = ["Decision topic", "Options", "Criteria", "Stakeholders", "Risks", "Action items"];
const extractionSteps = [
  "Extracting decisions...",
  "Extracting options...",
  "Extracting criteria...",
  "Extracting stakeholders...",
  "Extracting risks...",
  "Extracting action items...",
];
const criteria = ["Cost", "Implementation effort", "Strategic alignment", "Risk level", "Stakeholder impact"];
const options = ["Option A", "Option B", "Option C"];
const initialExtractedFields = Object.fromEntries(
  extractionFields.map((field) => [field, `Editable ${field.toLowerCase()} extracted by AI`]),
) as Record<string, string>;

const initialPrototypeState: PrototypeState = {
  inputMethod: null,
  hasTranscriptFile: false,
  transcriptText: "",
  extractedFields: initialExtractedFields,
  guardMessage: null,
};

function validateStep(screen: ScreenId, state: PrototypeState): string | null {
  if (screen === "newDecision" && !state.inputMethod) {
    return "Choose an input method before continuing.";
  }

  if (screen === "uploadTranscript" && !state.hasTranscriptFile && state.transcriptText.trim().length === 0) {
    return "Upload a transcript file or paste transcript text before AI extraction.";
  }

  if (screen === "reviewExtraction") {
    const missingField = extractionFields.find((field) => state.extractedFields[field].trim().length === 0);
    if (missingField) {
      return `Complete the ${missingField.toLowerCase()} field before continuing.`;
    }
  }

  return null;
}

function getHighestReachablePrototypeIndex(state: PrototypeState) {
  for (let index = 0; index < prototypeOrder.length; index += 1) {
    if (validateStep(prototypeOrder[index], state)) {
      return index;
    }
  }

  return prototypeOrder.length - 1;
}

export default function DecisionFlowLowFidelityPrototype() {
  const [activePage, setActivePage] = React.useState<PackagePage>("cover");
  const [activeScreen, setActiveScreen] = React.useState<ScreenId>("dashboard");
  const [prototypeState, setPrototypeState] = React.useState<PrototypeState>(initialPrototypeState);

  function goNext() {
    const currentIndex = prototypeOrder.indexOf(activeScreen);
    const blocker = validateStep(activeScreen, prototypeState);
    if (blocker) {
      setPrototypeState((current) => ({ ...current, guardMessage: blocker }));
      return;
    }

    const next = prototypeOrder[Math.min(currentIndex + 1, prototypeOrder.length - 1)];
    setPrototypeState((current) => ({ ...current, guardMessage: null }));
    setActiveScreen(next);
  }

  function goToPrototypeScreen(screen: ScreenId) {
    const targetIndex = prototypeOrder.indexOf(screen);
    if (targetIndex === -1) {
      setPrototypeState((current) => ({ ...current, guardMessage: null }));
      setActiveScreen(screen);
      return;
    }

    const highestReachableIndex = getHighestReachablePrototypeIndex(prototypeState);
    if (targetIndex > highestReachableIndex) {
      const blocker = validateStep(prototypeOrder[highestReachableIndex], prototypeState);
      setPrototypeState((current) => ({
        ...current,
        guardMessage: blocker ?? "Complete the current required action before jumping ahead.",
      }));
      setActiveScreen(prototypeOrder[highestReachableIndex]);
      return;
    }

    setPrototypeState((current) => ({ ...current, guardMessage: null }));
    setActiveScreen(screen);
  }

  function goToPrototype(screen: ScreenId) {
    setActivePage("prototype");
    setActiveScreen(screen);
  }

  return (
    <main className="min-h-screen min-w-[1280px] bg-white text-black">
      <header className="sticky top-0 z-20 border-b border-gray-400 bg-white">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <WireBox className="h-9 w-9 items-center justify-center text-xs font-bold">DF</WireBox>
            <div>
              <h1 className="text-base font-semibold">DecisionFlow Low-Fidelity Prototype</h1>
              <p className="text-xs text-gray-600">Desktop MVP UX validation artifact</p>
            </div>
          </div>
          <nav className="flex items-center gap-1" aria-label="Prototype package pages">
            {packagePages.map((page) => (
              <button
                key={page.id}
                className={`h-10 border px-4 text-sm ${
                  activePage === page.id ? "border-black bg-gray-200 font-semibold" : "border-gray-400 bg-white"
                }`}
                onClick={() => setActivePage(page.id)}
              >
                {page.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="px-8 py-8">
        {activePage === "cover" && <CoverPage goToPrototype={goToPrototype} />}
        {activePage === "flow" && <UserFlowPage goToPrototype={goToPrototype} />}
        {activePage === "ia" && <InformationArchitecturePage goToPrototype={goToPrototype} />}
        {activePage === "wireframes" && <WireframesPage goToPrototype={goToPrototype} />}
        {activePage === "components" && <ComponentsPage />}
        {activePage === "prototype" && (
          <PrototypePage
            activeScreen={activeScreen}
            setActiveScreen={goToPrototypeScreen}
            goNext={goNext}
            prototypeState={prototypeState}
            setPrototypeState={setPrototypeState}
          />
        )}
      </section>
    </main>
  );
}

function CoverPage({ goToPrototype }: { goToPrototype: (screen: ScreenId) => void }) {
  return (
    <div className="mx-auto max-w-[1180px]">
      <WireSection title="00 Cover" subtitle="Portfolio project discovery package">
        <div className="grid grid-cols-[1.05fr_0.95fr] gap-8">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-600">Product name</p>
              <h2 className="mt-2 text-5xl font-semibold tracking-normal">DecisionFlow</h2>
            </div>
            <p className="max-w-2xl text-xl leading-8">
              AI-powered decision intelligence platform that transforms unstructured information into structured,
              editable decisions.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <LabelBlock label="MVP scope" value="Desktop-first web application" />
              <LabelBlock label="Prototype fidelity" value="Low-fidelity wireframes" />
              <LabelBlock label="Validation focus" value="Flow, IA, hierarchy, placement" />
              <LabelBlock label="AI principle" value="AI assists, user decides" />
            </div>
            <WireButton onClick={() => goToPrototype("dashboard")}>Open clickable prototype</WireButton>
          </div>
          <WireBox className="min-h-[430px] flex-col gap-5 p-6">
            <div className="flex w-full items-center justify-between border-b border-gray-400 pb-4">
              <span className="font-semibold">Wireframe Package Contents</span>
              <MoreHorizontal className="h-5 w-5" />
            </div>
            {packagePages.map((page) => (
              <div key={page.id} className="flex w-full items-center justify-between border border-gray-400 p-4">
                <span>{page.label}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            ))}
          </WireBox>
        </div>
      </WireSection>
    </div>
  );
}

function UserFlowPage({ goToPrototype }: { goToPrototype: (screen: ScreenId) => void }) {
  const flow = [
    ["Dashboard", "dashboard"],
    ["New Decision", "newDecision"],
    ["Choose Input Method", "newDecision"],
    ["Upload / Paste / Import / Manual", "uploadTranscript"],
    ["AI Extraction", "aiExtraction"],
    ["Review Extracted Information", "reviewExtraction"],
    ["Decision Workspace", "workspace"],
    ["Generate AI Analysis", "workspace"],
    ["AI Recommendation", "recommendation"],
    ["Compare Options", "compare"],
    ["Finalize Decision", "library"],
    ["Decision Library", "library"],
  ] as const;

  return (
    <WireSection title="01 User Flow" subtitle="End-to-end MVP journey with clickable screen nodes">
      <div className="grid grid-cols-4 gap-4">
        {flow.map(([label, target], index) => (
          <React.Fragment key={`${label}-${index}`}>
            <button className="border border-gray-500 bg-white p-4 text-left" onClick={() => goToPrototype(target)}>
              <p className="text-xs text-gray-600">Step {String(index + 1).padStart(2, "0")}</p>
              <p className="mt-2 font-semibold">{label}</p>
            </button>
            {index < flow.length - 1 && (index + 1) % 4 !== 0 ? (
              <div className="-ml-4 flex items-center">
                <ArrowRight className="h-5 w-5" />
              </div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-4 gap-4">
        {["Upload Meeting Transcript", "Paste Meeting Notes", "Import PDF/DOCX", "Manual Entry"].map((item) => (
          <WireBox key={item} className="h-28 flex-col items-start justify-center p-4">
            <p className="text-xs text-gray-600">Input branch</p>
            <p className="mt-2 font-semibold">{item}</p>
          </WireBox>
        ))}
      </div>
    </WireSection>
  );
}

function InformationArchitecturePage({ goToPrototype }: { goToPrototype: (screen: ScreenId) => void }) {
  return (
    <WireSection title="02 Information Architecture" subtitle="Sitemap and primary navigation model">
      <div className="grid grid-cols-[280px_1fr] gap-6">
        <WireBox className="flex-col items-start gap-3 p-5">
          <h3 className="font-semibold">Global Navigation</h3>
          {[
            ["Dashboard", "dashboard"],
            ["New Decision", "newDecision"],
            ["Decision Library", "library"],
            ["Profile", "profile"],
            ["Settings", "settings"],
          ].map(([label, target]) => (
            <button key={label} className="w-full border border-gray-400 p-3 text-left" onClick={() => goToPrototype(target as ScreenId)}>
              {label}
            </button>
          ))}
        </WireBox>
        <div className="grid grid-cols-3 gap-4">
          <SitemapColumn title="Public" items={["Landing", "Login", "Register"]} />
          <SitemapColumn title="Decision Creation" items={["Dashboard", "New Decision", "Upload Transcript", "AI Extraction", "Review Extracted Information"]} />
          <SitemapColumn title="Decision Management" items={["Decision Workspace", "AI Recommendation", "Compare Options", "Decision Library"]} />
          <SitemapColumn title="Account" items={["Profile", "Settings"]} />
          <SitemapColumn title="Reusable Patterns" items={["Forms", "Tables", "Modals", "Loading", "Empty States"]} />
          <SitemapColumn title="AI Review Model" items={["Extract", "User edits", "Analyze", "Recommend", "Human finalizes"]} />
        </div>
      </div>
    </WireSection>
  );
}

function WireframesPage({ goToPrototype }: { goToPrototype: (screen: ScreenId) => void }) {
  return (
    <WireSection title="03 Wireframes" subtitle="All desktop MVP screens named by low-fidelity convention">
      <div className="grid grid-cols-2 gap-8">
        {screens.map((screen) => (
          <div key={screen.id} className="text-left">
            <div className="mb-2 flex justify-end">
              <WireButton variant="secondary" onClick={() => goToPrototype(screen.id)}>
                Open {screen.number}
              </WireButton>
            </div>
            <ScreenFrame screen={screen} compact>
              <ScreenRenderer screen={screen.id} compact />
            </ScreenFrame>
          </div>
        ))}
      </div>
    </WireSection>
  );
}

function ComponentsPage() {
  return (
    <WireSection title="04 Components" subtitle="Reusable grayscale primitives for the low-fidelity system">
      <div className="grid grid-cols-3 gap-6">
        <ComponentSpec title="Button"><WireButton>Primary action</WireButton><WireButton variant="secondary">Secondary action</WireButton></ComponentSpec>
        <ComponentSpec title="Input"><WireInput label="Input" placeholder="Placeholder text" /><WireInput label="Dropdown" placeholder="Select option" /></ComponentSpec>
        <ComponentSpec title="Textarea"><WireInput label="Textarea" placeholder="Long form text area" textarea /></ComponentSpec>
        <ComponentSpec title="Checkbox"><CheckLine label="Checkbox option" /><CheckLine label="Selected option" checked /></ComponentSpec>
        <ComponentSpec title="Sidebar"><Sidebar active="Dashboard" /></ComponentSpec>
        <ComponentSpec title="Top Navigation"><TopNav title="Screen title" /></ComponentSpec>
        <ComponentSpec title="Card"><WireBox className="h-32 flex-col items-start p-4"><p className="font-semibold">Card title</p><Line /><Line short /></WireBox></ComponentSpec>
        <ComponentSpec title="Statistics Card"><StatisticCard label="Metric label" value="24" /></ComponentSpec>
        <ComponentSpec title="Decision Card"><DecisionListItem title="Decision title" status="Draft" /></ComponentSpec>
        <ComponentSpec title="Upload Area"><UploadArea /></ComponentSpec>
        <ComponentSpec title="Progress Indicator"><ProgressBlock /></ComponentSpec>
        <ComponentSpec title="Comparison Table"><ComparisonTable compact /></ComponentSpec>
        <ComponentSpec title="Modal"><ModalBlock /></ComponentSpec>
        <ComponentSpec title="Dialog"><DialogBlock /></ComponentSpec>
        <ComponentSpec title="Empty State"><EmptyStateBlock /></ComponentSpec>
        <ComponentSpec title="Loading State"><LoadingStateBlock /></ComponentSpec>
      </div>
    </WireSection>
  );
}

function PrototypePage({
  activeScreen,
  setActiveScreen,
  goNext,
  prototypeState,
  setPrototypeState,
}: {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  goNext: () => void;
  prototypeState: PrototypeState;
  setPrototypeState: React.Dispatch<React.SetStateAction<PrototypeState>>;
}) {
  const definition = screens.find((screen) => screen.id === activeScreen) ?? screens[0];
  const nextLabel = activeScreen === "library" ? "Flow complete" : "Continue";
  const highestReachableIndex = getHighestReachablePrototypeIndex(prototypeState);

  return (
    <WireSection title="05 Prototype" subtitle="Clickable desktop MVP flow for usability validation">
      <div className="grid grid-cols-[260px_1fr] gap-6">
        <aside className="border border-gray-500 p-4">
          <h3 className="font-semibold">Prototype screens</h3>
          <div className="mt-4 space-y-2">
            {screens.map((screen) => (
              <button
                key={screen.id}
                className={`w-full border p-3 text-left text-sm ${
                  activeScreen === screen.id ? "border-black bg-gray-200 font-semibold" : "border-gray-400 bg-white"
                } ${
                  prototypeOrder.indexOf(screen.id) > highestReachableIndex ? "text-gray-500" : ""
                }`}
                onClick={() => setActiveScreen(screen.id)}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{screen.number} {screen.name}</span>
                  {prototypeOrder.indexOf(screen.id) > highestReachableIndex && <Lock className="h-3.5 w-3.5 shrink-0" />}
                </span>
              </button>
            ))}
          </div>
        </aside>
        <div>
          <ScreenFrame screen={definition}>
            <ScreenRenderer
              screen={activeScreen}
              onNext={goNext}
              prototypeState={prototypeState}
              setPrototypeState={setPrototypeState}
            />
          </ScreenFrame>
          {prototypeState.guardMessage && (
            <div className="mt-4 border border-black bg-gray-100 p-4 text-sm font-semibold" role="status">
              {prototypeState.guardMessage}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border border-gray-400 p-4">
            <p className="text-sm">
              Prototype interaction: required actions must be completed before the next step becomes available.
            </p>
            <WireButton onClick={goNext} disabled={activeScreen === "library"}>
              {nextLabel}
            </WireButton>
          </div>
        </div>
      </div>
    </WireSection>
  );
}

function ScreenFrame({
  screen,
  compact = false,
  children,
}: {
  screen: ScreenDefinition;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="border border-gray-500 bg-white">
      <div className="border-b border-gray-400 p-4">
        <p className="text-xs text-gray-600">{screen.number}</p>
        <h3 className="text-lg font-semibold">{screen.name}</h3>
        {!compact && <p className="mt-1 text-sm text-gray-600">{screen.purpose}</p>}
      </div>
      <div className={compact ? "h-[430px] overflow-hidden p-4" : "min-h-[760px] p-5"}>{children}</div>
    </article>
  );
}

function ScreenRenderer({
  screen,
  compact = false,
  onNext,
  prototypeState,
  setPrototypeState,
}: {
  screen: ScreenId;
  compact?: boolean;
  onNext?: () => void;
  prototypeState?: PrototypeState;
  setPrototypeState?: React.Dispatch<React.SetStateAction<PrototypeState>>;
}) {
  const props = { compact, onNext, prototypeState, setPrototypeState };
  const map: Record<ScreenId, React.ReactNode> = {
    landing: <LandingWire {...props} />,
    login: <LoginWire {...props} />,
    register: <RegisterWire {...props} />,
    dashboard: <DashboardWire {...props} />,
    newDecision: <NewDecisionWire {...props} />,
    uploadTranscript: <UploadTranscriptWire {...props} />,
    aiExtraction: <AIExtractionWire {...props} />,
    reviewExtraction: <ReviewExtractionWire {...props} />,
    workspace: <WorkspaceWire {...props} />,
    recommendation: <RecommendationWire {...props} />,
    compare: <CompareWire {...props} />,
    library: <LibraryWire {...props} />,
    profile: <ProfileWire {...props} />,
    settings: <SettingsWire {...props} />,
  };

  return map[screen];
}

function LandingWire({ compact, onNext }: WireProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border border-gray-500 p-4">
        <WireLogo />
        <div className="flex gap-3 text-sm"><span>Product</span><span>Workflow</span><span>Security</span><span>Login</span></div>
      </div>
      <div className="grid grid-cols-[1fr_360px] gap-6">
        <WireBox className="h-72 flex-col items-start justify-center p-8">
          <p className="text-sm text-gray-600">Hero title</p>
          <h2 className="mt-3 text-4xl font-semibold">Transform messy inputs into structured decisions</h2>
          <p className="mt-4 max-w-xl text-gray-700">AI extracts topics, options, criteria, stakeholders, risks, and actions. Users review before recommendations.</p>
          <WireButton className="mt-6" onClick={onNext}>Start new decision</WireButton>
        </WireBox>
        <WireBox className="h-72 flex-col gap-3 p-5">
          <Line /><Line /><Line short />
          <div className="mt-4 grid w-full grid-cols-2 gap-3"><WireBox className="h-20" /><WireBox className="h-20" /></div>
        </WireBox>
      </div>
      {!compact && <FeatureOverview />}
      <div className="border border-gray-400 p-4 text-sm">Footer placeholder</div>
    </div>
  );
}

function LoginWire({ onNext }: WireProps) {
  return <AuthWire title="Login" fields={["Email", "Password"]} action="Login" footer="Forgot Password | Register link" onNext={onNext} />;
}

function RegisterWire({ onNext }: WireProps) {
  return <AuthWire title="Register" fields={["Name", "Email", "Password", "Confirm Password"]} action="Register" onNext={onNext} />;
}

function DashboardWire({ compact, onNext }: WireProps) {
  return (
    <AppLayout active="Dashboard" compact={compact}>
      <TopNav title="Dashboard" />
      <div className="mt-5 grid grid-cols-4 gap-4">
        {["Total decisions", "In review", "Completed", "Avg confidence"].map((item, index) => <StatisticCard key={item} label={item} value={String([18, 4, 11, 82][index])} />)}
      </div>
      <div className="mt-5 grid grid-cols-[1fr_340px] gap-5">
        <WirePanel title="Recent Decisions">
          <div className="space-y-3">
            {["Vendor selection", "Roadmap prioritization", "Hiring plan"].map((item) => <DecisionListItem key={item} title={item} status="In progress" />)}
          </div>
        </WirePanel>
        <WirePanel title="Start">
          <WireButton onClick={onNext}><Plus className="h-4 w-4" /> New Decision</WireButton>
          <Line /><Line short />
        </WirePanel>
      </div>
    </AppLayout>
  );
}

function NewDecisionWire({ onNext, prototypeState, setPrototypeState }: WireProps) {
  const selectedMethod = prototypeState?.inputMethod ?? null;

  function chooseMethod(method: InputMethod) {
    setPrototypeState?.((current) => ({
      ...current,
      inputMethod: method,
      guardMessage: null,
    }));
  }

  return (
    <AppLayout active="New Decision">
      <TopNav title="New Decision" />
      <WirePanel title="Choose input method" className="mt-5">
        <div className="grid grid-cols-4 gap-4">
          {([
            ["Upload Meeting Transcript", Upload, "upload"],
            ["Paste Meeting Notes", FileText, "paste"],
            ["Import PDF/DOCX", FolderOpen, "import"],
            ["Manual Entry", Menu, "manual"],
          ] satisfies Array<[string, LucideIcon, InputMethod]>).map(([label, Component, method]) => {
            return (
              <button
                key={label}
                className={`h-44 border p-5 text-left ${
                  selectedMethod === method ? "border-black bg-gray-200" : "border-gray-500 bg-white"
                }`}
                onClick={() => chooseMethod(method)}
              >
                <Component className="h-7 w-7" />
                <p className="mt-8 font-semibold">{label}</p>
                <p className="mt-2 text-sm text-gray-600">{selectedMethod === method ? "Selected" : "Begin with this source"}</p>
              </button>
            );
          })}
        </div>
      </WirePanel>
    </AppLayout>
  );
}

function UploadTranscriptWire({ onNext, prototypeState, setPrototypeState }: WireProps) {
  const hasTranscriptFile = prototypeState?.hasTranscriptFile ?? false;
  const transcriptText = prototypeState?.transcriptText ?? "";
  const hasRequiredInput = hasTranscriptFile || transcriptText.trim().length > 0;

  function markFileUploaded() {
    setPrototypeState?.((current) => ({
      ...current,
      hasTranscriptFile: true,
      guardMessage: null,
    }));
  }

  function updateTranscriptText(value: string) {
    setPrototypeState?.((current) => ({
      ...current,
      transcriptText: value,
      guardMessage: value.trim().length > 0 ? null : current.guardMessage,
    }));
  }

  return (
    <AppLayout active="New Decision">
      <TopNav title="Upload Transcript" />
      <div className="mt-5 grid grid-cols-[1fr_360px] gap-5">
        <WirePanel title="Meeting transcript">
          <UploadArea uploaded={hasTranscriptFile} onBrowse={markFileUploaded} />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {hasTranscriptFile ? "Selected file: meeting-transcript.txt" : "Supported file types: TXT, DOCX, PDF"}
            </p>
            <WireButton onClick={onNext} disabled={!hasRequiredInput}>Upload</WireButton>
          </div>
          {!hasRequiredInput && <p className="mt-3 text-sm font-semibold">Required: browse for a file or paste transcript text.</p>}
        </WirePanel>
        <WirePanel title="Paste transcript option">
          <WireInput
            label="Transcript text"
            placeholder="Paste raw transcript..."
            textarea
            value={transcriptText}
            onChange={(event) => updateTranscriptText(event.target.value)}
          />
        </WirePanel>
      </div>
    </AppLayout>
  );
}

function AIExtractionWire({ onNext }: WireProps) {
  return (
    <AppLayout active="Extraction">
      <TopNav title="AI Extraction" />
      <WireBox className="mt-5 min-h-[520px] flex-col justify-center gap-6 p-8">
        <ProgressBlock />
        <div className="w-full max-w-2xl space-y-3">
          {extractionSteps.map((step, index) => (
            <div key={step} className="flex items-center justify-between border border-gray-400 p-3">
              <span>{step}</span>
              <span className="text-sm text-gray-600">{index < 3 ? "Complete" : index === 3 ? "Current" : "Queued"}</span>
            </div>
          ))}
        </div>
        <WireButton onClick={onNext}>View extracted information</WireButton>
      </WireBox>
    </AppLayout>
  );
}

function ReviewExtractionWire({ onNext, prototypeState, setPrototypeState }: WireProps) {
  const extractedFields = prototypeState?.extractedFields ?? initialExtractedFields;

  function updateExtractedField(field: string, value: string) {
    setPrototypeState?.((current) => ({
      ...current,
      extractedFields: {
        ...current.extractedFields,
        [field]: value,
      },
      guardMessage: value.trim().length > 0 ? null : current.guardMessage,
    }));
  }

  return (
    <AppLayout active="Review">
      <TopNav title="Review Extracted Information" />
      <div className="mt-5 grid grid-cols-2 gap-4">
        {extractionFields.map((field) => (
          <WirePanel key={field} title={field}>
            <WireInput
              label={`${field} extracted value`}
              placeholder={`Editable ${field.toLowerCase()}`}
              textarea={field === "Risks" || field === "Action items"}
              value={extractedFields[field]}
              onChange={(event) => updateExtractedField(field, event.target.value)}
            />
            <div className="mt-3 flex justify-end"><WireButton variant="secondary">Edit</WireButton></div>
          </WirePanel>
        ))}
      </div>
      <div className="mt-5 flex justify-end"><WireButton onClick={onNext}>Continue</WireButton></div>
    </AppLayout>
  );
}

function WorkspaceWire({ onNext }: WireProps) {
  return (
    <AppLayout active="Workspace">
      <TopNav title="Decision Workspace" />
      <div className="mt-5 grid grid-cols-[1fr_360px] gap-5">
        <WirePanel title="Decision summary">
          <Line /><Line /><Line short />
          <div className="mt-5 space-y-3">
            {criteria.map((item, index) => <WeightRow key={item} label={item} value={[25, 20, 25, 15, 15][index]} />)}
          </div>
        </WirePanel>
        <WirePanel title="Notes">
          <WireInput label="Decision notes" placeholder="Add notes..." textarea />
          <WireButton className="mt-4 w-full" onClick={onNext}>Generate AI Analysis</WireButton>
        </WirePanel>
      </div>
    </AppLayout>
  );
}

function RecommendationWire({ onNext }: WireProps) {
  return (
    <AppLayout active="Recommendation">
      <TopNav title="AI Recommendation" />
      <div className="mt-5 grid grid-cols-[1fr_360px] gap-5">
        <WirePanel title="Recommended option">
          <WireBox className="h-24 items-center justify-between p-5">
            <div><p className="text-sm text-gray-600">Recommended option</p><p className="text-2xl font-semibold">Option A</p></div>
            <div className="border border-gray-500 p-3">Confidence 82%</div>
          </WireBox>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <TextBlock title="Reasoning" />
            <TextBlock title="Risks" />
            <TextBlock title="Alternatives" />
            <TextBlock title="Next steps" />
          </div>
        </WirePanel>
        <WirePanel title="Actions">
          <WireButton variant="secondary" className="w-full">Regenerate</WireButton>
          <WireButton className="mt-3 w-full" onClick={onNext}>Accept Recommendation</WireButton>
        </WirePanel>
      </div>
    </AppLayout>
  );
}

function CompareWire({ onNext }: WireProps) {
  return (
    <AppLayout active="Compare">
      <TopNav title="Compare Options" />
      <WirePanel title="Comparison table" className="mt-5">
        <ComparisonTable />
      </WirePanel>
      <div className="mt-5 flex justify-end"><WireButton onClick={onNext}>Finalize Decision</WireButton></div>
    </AppLayout>
  );
}

function LibraryWire(_props: WireProps): React.ReactNode {
  return (
    <AppLayout active="Library">
      <TopNav title="Decision Library" />
      <div className="mt-5 flex gap-3">
        <WireInput label="Search" placeholder="Search decisions" />
        <WireBox className="h-[66px] w-60 items-center px-4">Filters</WireBox>
      </div>
      <WirePanel title="Decision list" className="mt-5">
        <div className="space-y-3">
          {["Vendor selection", "Roadmap prioritization", "Pricing model"].map((item, index) => (
            <DecisionListItem key={item} title={item} status={["Final", "Draft", "Archived"][index]} />
          ))}
        </div>
      </WirePanel>
    </AppLayout>
  );
}

function ProfileWire(_props: WireProps): React.ReactNode {
  return (
    <AppLayout active="Profile">
      <TopNav title="Profile" />
      <div className="mt-5 grid grid-cols-2 gap-5">
        <WirePanel title="User information"><WireInput label="Name" placeholder="User name" /><WireInput label="Email" placeholder="Email" /></WirePanel>
        <WirePanel title="Account actions"><CheckLine label="Notifications" checked /><WireButton variant="secondary">Change password</WireButton><WireButton><LogOut className="h-4 w-4" /> Logout</WireButton></WirePanel>
      </div>
    </AppLayout>
  );
}

function SettingsWire(_props: WireProps): React.ReactNode {
  return (
    <AppLayout active="Settings">
      <TopNav title="Settings" />
      <div className="mt-5 grid grid-cols-2 gap-5">
        {["Theme preference", "Language", "Privacy", "AI Preferences"].map((item) => (
          <WirePanel key={item} title={item}>
            <WireInput label={item} placeholder="Select preference" />
            <CheckLine label="Enable setting" checked />
          </WirePanel>
        ))}
      </div>
    </AppLayout>
  );
}

function AuthWire({
  title,
  fields,
  action,
  footer,
  onNext,
}: {
  title: string;
  fields: string[];
  action: string;
  footer?: string;
  onNext?: () => void;
}) {
  return (
    <div className="grid min-h-[620px] grid-cols-[1fr_420px] border border-gray-500">
      <WireBox className="flex-col items-start justify-center gap-5 p-12">
        <WireLogo />
        <h2 className="text-3xl font-semibold">{title}</h2>
        <div className="w-full max-w-md space-y-4">
          {fields.map((field) => <WireInput key={field} label={field} placeholder={field} />)}
          <WireButton className="w-full" onClick={onNext}>{action}</WireButton>
          {footer && <p className="text-sm text-gray-600">{footer}</p>}
        </div>
      </WireBox>
      <WireBox className="m-8 flex-col justify-center gap-4 p-8">
        <Lock className="h-8 w-8" />
        <p className="text-xl font-semibold">Account support panel</p>
        <Line /><Line /><Line short />
      </WireBox>
    </div>
  );
}

function AppLayout({ active, compact = false, children }: { active: string; compact?: boolean; children: React.ReactNode }) {
  return (
    <div className={`grid ${compact ? "grid-cols-[120px_1fr]" : "grid-cols-[230px_1fr]"} border border-gray-500`}>
      <Sidebar active={active} compact={compact} />
      <div className={compact ? "p-3" : "p-5"}>{children}</div>
    </div>
  );
}

function Sidebar({ active, compact = false }: { active: string; compact?: boolean }) {
  const items = [
    ["Dashboard", Home],
    ["New Decision", Plus],
    ["Library", FolderOpen],
    ["Profile", User],
    ["Settings", Settings],
  ] satisfies Array<[string, LucideIcon]>;
  return (
    <aside className="border-r border-gray-500 p-4">
      <WireLogo compact={compact} />
      <div className="mt-5 space-y-2">
        {items.map(([label, Component]) => {
          return (
            <div key={label} className={`flex items-center gap-2 border border-gray-400 p-2 text-sm ${active === label ? "bg-gray-200 font-semibold" : ""}`}>
              <Component className="h-4 w-4" />
              {!compact && label}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function TopNav({ title }: { title: string }) {
  return (
    <div className="flex h-16 items-center justify-between border border-gray-500 px-4">
      <div>
        <p className="text-xs text-gray-600">Workspace</p>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-64 items-center gap-2 border border-gray-400 px-3 text-sm text-gray-600"><Search className="h-4 w-4" /> Search</div>
        <WireButton><Plus className="h-4 w-4" /> New Decision</WireButton>
      </div>
    </div>
  );
}

function FeatureOverview() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {["AI extraction", "Editable structure", "Explainable recommendation"].map((item) => (
        <WireBox key={item} className="h-36 flex-col items-start justify-center p-5">
          <p className="font-semibold">{item}</p>
          <Line /><Line short />
        </WireBox>
      ))}
    </div>
  );
}

function SitemapColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <WireBox className="flex-col items-start gap-3 p-4">
      <h3 className="font-semibold">{title}</h3>
      {items.map((item) => <div key={item} className="w-full border border-gray-400 p-2 text-sm">{item}</div>)}
    </WireBox>
  );
}

function ComponentSpec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <WirePanel title={title}>
      <div className="space-y-3">{children}</div>
    </WirePanel>
  );
}

function WireSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-6 border-b border-gray-400 pb-4">
        <h2 className="text-3xl font-semibold">{title}</h2>
        <p className="mt-1 text-gray-600">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function WirePanel({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`border border-gray-500 bg-white ${className}`}>
      <div className="border-b border-gray-400 p-4 font-semibold">{title}</div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function WireBox({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`flex border border-gray-500 bg-white ${className}`}>{children}</div>;
}

function WireButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 border px-4 text-sm font-semibold disabled:opacity-40 ${
        variant === "primary" ? "border-black bg-gray-200" : "border-gray-500 bg-white"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function WireInput({
  label,
  placeholder,
  textarea = false,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  textarea?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {textarea ? (
        <textarea
          className="mt-2 min-h-28 w-full border border-gray-500 bg-white p-3 text-sm"
          onChange={onChange}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          className="mt-2 h-11 w-full border border-gray-500 bg-white px-3 text-sm"
          onChange={onChange}
          placeholder={placeholder}
          value={value}
        />
      )}
    </label>
  );
}

function WireLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center border border-black text-xs font-bold">DF</div>
      {!compact && <span className="font-semibold">DecisionFlow</span>}
    </div>
  );
}

function LabelBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-500 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

function StatisticCard({ label, value }: { label: string; value: string }) {
  return (
    <WireBox className="h-28 flex-col items-start justify-center p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </WireBox>
  );
}

function DecisionListItem({ title, status }: { title: string; status: string }) {
  return (
    <div className="grid grid-cols-[1fr_120px_120px_110px] items-center gap-3 border border-gray-400 p-3">
      <div><p className="font-semibold">{title}</p><p className="text-sm text-gray-600">Created date placeholder</p></div>
      <span className="border border-gray-400 px-2 py-1 text-center text-sm">{status}</span>
      <span className="text-sm">Owner</span>
      <WireButton variant="secondary">Open</WireButton>
    </div>
  );
}

function UploadArea({ uploaded = false, onBrowse }: { uploaded?: boolean; onBrowse?: () => void }) {
  return (
    <WireBox className="h-72 flex-col items-center justify-center gap-4 border-dashed">
      <Upload className="h-10 w-10" />
      <p className="text-lg font-semibold">{uploaded ? "meeting-transcript.txt selected" : "Drag & Drop upload area"}</p>
      <WireButton variant="secondary" onClick={onBrowse}>{uploaded ? "Replace File" : "Browse File"}</WireButton>
    </WireBox>
  );
}

function ProgressBlock() {
  return (
    <div className="w-full max-w-2xl">
      <div className="h-5 border border-gray-500">
        <div className="h-full w-3/5 bg-gray-300" />
      </div>
      <p className="mt-2 text-center text-sm text-gray-600">Progress indicator</p>
    </div>
  );
}

function ComparisonTable({ compact = false }: { compact?: boolean }) {
  return (
    <table className={`w-full border-collapse text-left text-sm ${compact ? "text-xs" : ""}`}>
      <thead>
        <tr>
          <th className="border border-gray-500 p-3">Criteria</th>
          {options.map((option) => <th key={option} className="border border-gray-500 p-3">{option}</th>)}
          <th className="border border-gray-500 p-3">AI score</th>
          <th className="border border-gray-500 p-3">Recommended</th>
        </tr>
      </thead>
      <tbody>
        {criteria.map((item, index) => (
          <tr key={item}>
            <td className="border border-gray-500 p-3 font-semibold">{item}</td>
            <td className="border border-gray-500 p-3">{80 + index}</td>
            <td className="border border-gray-500 p-3">{72 + index}</td>
            <td className="border border-gray-500 p-3">{69 + index}</td>
            <td className="border border-gray-500 p-3">{86 - index}</td>
            <td className="border border-gray-500 p-3">{index === 0 ? "Option A" : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WeightRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[1fr_220px_70px] items-center gap-4 border border-gray-400 p-3">
      <span className="font-semibold">{label}</span>
      <div className="h-4 border border-gray-500"><div className="h-full bg-gray-300" style={{ width: `${value * 2}%` }} /></div>
      <span>{value}%</span>
    </div>
  );
}

function TextBlock({ title }: { title: string }) {
  return (
    <WireBox className="min-h-40 flex-col items-start p-4">
      <p className="font-semibold">{title}</p>
      <Line /><Line /><Line short />
    </WireBox>
  );
}

function CheckLine({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center gap-3 border border-gray-400 p-3">
      {checked ? <CheckSquare className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function ModalBlock() {
  return (
    <WireBox className="h-52 items-center justify-center bg-gray-100 p-5">
      <WireBox className="h-32 w-64 flex-col p-4"><p className="font-semibold">Modal</p><Line /><WireButton>Action</WireButton></WireBox>
    </WireBox>
  );
}

function DialogBlock() {
  return (
    <WireBox className="h-40 flex-col items-start p-4">
      <p className="font-semibold">Confirm action?</p>
      <Line />
      <div className="mt-auto flex gap-2"><WireButton variant="secondary">Cancel</WireButton><WireButton>Confirm</WireButton></div>
    </WireBox>
  );
}

function EmptyStateBlock() {
  return (
    <WireBox className="h-44 flex-col items-center justify-center gap-3 p-4">
      <FolderOpen className="h-8 w-8" />
      <p className="font-semibold">No decisions yet</p>
      <WireButton>Create decision</WireButton>
    </WireBox>
  );
}

function LoadingStateBlock() {
  return (
    <WireBox className="h-44 flex-col items-center justify-center gap-3 p-4">
      <div className="h-8 w-8 rounded-full border border-gray-500" />
      <p className="font-semibold">Loading...</p>
      <ProgressBlock />
    </WireBox>
  );
}

function Line({ short = false }: { short?: boolean }) {
  return <div className={`mt-3 h-3 bg-gray-300 ${short ? "w-2/3" : "w-full"}`} />;
}

type WireProps = {
  compact?: boolean;
  onNext?: () => void;
  prototypeState?: PrototypeState;
  setPrototypeState?: React.Dispatch<React.SetStateAction<PrototypeState>>;
};
