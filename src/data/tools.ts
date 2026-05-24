export type ToolInput = {
  key: string;
  label: string;
  type?: "number" | "select";
  defaultValue: number | string;
  min?: number;
  step?: number;
  suffix?: string;
  options?: { label: string; value: string }[];
};

export type Tool = {
  slug: string;
  title: string;
  description: string;
  intent: string;
  calculator: string;
  inputs: ToolInput[];
  formula: string;
  assumptions: string[];
  example: string;
  faqs: { question: string; answer: string }[];
  related: string[];
  disclaimer: string;
};

const commonDisclaimer =
  "Informational estimate only. This tool is not legal, tax, financial, payroll, or accounting advice. Verify platform fees and local rules before making decisions.";

export const tools: Tool[] = [
  {
    slug: "freelance-hourly-to-salary-calculator",
    title: "Freelance Hourly to Salary Calculator",
    description: "Convert a freelance hourly rate into an annualized gross revenue estimate using billable hours, weeks off, and utilization assumptions.",
    intent: "calculate freelance annual revenue",
    calculator: "hourlySalary",
    inputs: [
      { key: "hourlyRate", label: "Hourly rate", defaultValue: 75, min: 0, step: 1, suffix: "$" },
      { key: "billableHoursPerWeek", label: "Billable hours per week", defaultValue: 25, min: 0, step: 1 },
      { key: "weeksOff", label: "Weeks off per year", defaultValue: 4, min: 0, step: 1 },
    ],
    formula: "Annual gross revenue = hourly rate × billable hours per week × (52 − weeks off).",
    assumptions: ["Uses gross revenue before taxes and business expenses.", "Billable hours exclude admin, sales, learning, and unpaid meetings.", "Weeks off include holidays, sick days, vacation, and unpaid downtime."],
    example: "$75/hour × 25 billable hours × 48 working weeks = $90,000 annual gross revenue.",
    faqs: [
      { question: "Is this the same as salary?", answer: "No. It is a gross revenue equivalent. Employees may receive benefits, paid leave, and employer tax contributions that freelancers usually price separately." },
      { question: "Should I include non-billable hours?", answer: "No. Use hours you can realistically bill clients. Non-billable work is captured indirectly by choosing a lower weekly billable-hour number." },
    ],
    related: ["day-rate-to-hourly-rate-converter", "utilization-billable-hours-break-even-calculator", "desired-take-home-rate-calculator"],
    disclaimer: commonDisclaimer,
  },
  {
    slug: "day-rate-to-hourly-rate-converter",
    title: "Day Rate to Hourly Rate Converter",
    description: "Translate day rates into hourly rates and weekly gross revenue for freelance, consulting, and agency pricing discussions.",
    intent: "convert day rate to hourly rate",
    calculator: "dayRate",
    inputs: [
      { key: "dayRate", label: "Day rate", defaultValue: 600, min: 0, step: 10, suffix: "$" },
      { key: "hoursPerDay", label: "Billable hours per day", defaultValue: 8, min: 1, step: 0.5 },
      { key: "daysPerWeek", label: "Billable days per week", defaultValue: 4, min: 0, step: 0.5 },
    ],
    formula: "Hourly equivalent = day rate ÷ billable hours per day. Weekly gross = day rate × billable days per week.",
    assumptions: ["Assumes the day rate covers one billable day only.", "Does not include expenses, retainers, taxes, or platform fees."],
    example: "$600/day ÷ 8 hours = $75/hour; 4 billable days/week = $2,400 weekly gross.",
    faqs: [
      { question: "Why convert day rate to hourly?", answer: "It helps compare client proposals that mix hourly, daily, and project pricing." },
      { question: "How many hours should I count in a day?", answer: "Count only billable hours. If a day includes meetings, breaks, and admin, a realistic billable day is often 5–6 hours rather than 8." },
    ],
    related: ["freelance-hourly-to-salary-calculator", "project-quote-estimator", "retainer-pricing-calculator"],
    disclaimer: commonDisclaimer,
  },
  {
    slug: "desired-take-home-rate-calculator",
    title: "Desired Take-Home Rate Calculator",
    description: "Estimate the gross hourly rate needed to reach a target take-home rate after platform fees, tax reserve, and expense reserve.",
    intent: "estimate gross freelance rate from take-home target",
    calculator: "takeHome",
    inputs: [
      { key: "targetTakeHome", label: "Target take-home per hour", defaultValue: 60, min: 0, step: 1, suffix: "$" },
      { key: "taxReserve", label: "Tax reserve", defaultValue: 25, min: 0, step: 1, suffix: "%" },
      { key: "expenseReserve", label: "Business expense reserve", defaultValue: 10, min: 0, step: 1, suffix: "%" },
      { key: "platformFee", label: "Platform/payment fee", defaultValue: 5, min: 0, step: 1, suffix: "%" },
    ],
    formula: "Required gross rate = target take-home ÷ (1 − tax reserve − expense reserve − platform fee).",
    assumptions: ["Uses percentage reserves only; fixed fees are not included.", "Tax reserve is a planning assumption, not tax advice."],
    example: "$60 target ÷ (1 − 25% − 10% − 5%) = $100 gross hourly rate.",
    faqs: [
      { question: "Is the tax percentage accurate?", answer: "No. It is a reserve assumption for planning. Ask a qualified professional for tax-specific guidance." },
      { question: "What if I have both percentage and fixed costs?", answer: "Enter fixed costs in the percentage fields by estimating their share of your typical gross rate, or use a higher reserve to cover both." },
    ],
    related: ["stripe-fee-calculator", "upwork-fee-calculator", "freelance-hourly-to-salary-calculator"],
    disclaimer: commonDisclaimer,
  },
  {
    slug: "project-quote-estimator",
    title: "Project Quote Estimator",
    description: "Build a simple project quote from estimated hours, hourly rate, contingency, and optional pass-through expenses.",
    intent: "estimate freelance project quote",
    calculator: "projectQuote",
    inputs: [
      { key: "hours", label: "Estimated hours", defaultValue: 40, min: 0, step: 1 },
      { key: "hourlyRate", label: "Hourly rate", defaultValue: 85, min: 0, step: 1, suffix: "$" },
      { key: "contingency", label: "Contingency buffer", defaultValue: 15, min: 0, step: 1, suffix: "%" },
      { key: "expenses", label: "Pass-through expenses", defaultValue: 0, min: 0, step: 1, suffix: "$" },
    ],
    formula: "Quote = hours × hourly rate × (1 + contingency %) + expenses.",
    assumptions: ["Contingency covers estimation risk and normal project uncertainty.", "Does not replace a written scope of work."],
    example: "40 hours × $85 × 1.15 + $0 = $3,910 quote.",
    faqs: [
      { question: "How much contingency should I add?", answer: "Many freelancers start with 10–25% depending on scope clarity, revision risk, and client responsiveness." },
      { question: "Should I include taxes in the quote?", answer: "This tool estimates the pre-tax quote. Add sales tax or VAT separately based on your jurisdiction and client location." },
    ],
    related: ["retainer-pricing-calculator", "meeting-cost-calculator", "desired-take-home-rate-calculator"],
    disclaimer: commonDisclaimer,
  },
  {
    slug: "retainer-pricing-calculator",
    title: "Retainer Pricing Calculator",
    description: "Estimate a monthly retainer price from included hours, target rate, availability premium, and unused-time policy.",
    intent: "calculate monthly retainer pricing",
    calculator: "retainer",
    inputs: [
      { key: "includedHours", label: "Included hours per month", defaultValue: 20, min: 0, step: 1 },
      { key: "hourlyRate", label: "Target hourly rate", defaultValue: 90, min: 0, step: 1, suffix: "$" },
      { key: "availabilityPremium", label: "Availability premium", defaultValue: 10, min: 0, step: 1, suffix: "%" },
    ],
    formula: "Monthly retainer = included hours × hourly rate × (1 + availability premium %).",
    assumptions: ["Assumes unused time does not roll over unless your contract says so.", "Availability has a cost because it reserves calendar capacity."],
    example: "20 hours × $90 × 1.10 = $1,980/month.",
    faqs: [
      { question: "Why add an availability premium?", answer: "Retainers reserve capacity and reduce your ability to sell that time elsewhere." },
      { question: "What happens if the client uses fewer hours?", answer: "Unused hours typically do not roll over. The retainer is a capacity reservation, not a prepaid hour bank, unless your contract specifies otherwise." },
    ],
    related: ["project-quote-estimator", "utilization-billable-hours-break-even-calculator", "day-rate-to-hourly-rate-converter"],
    disclaimer: commonDisclaimer,
  },
  {
    slug: "utilization-billable-hours-break-even-calculator",
    title: "Utilization and Billable-Hours Break-Even Calculator",
    description: "Estimate the billable hours needed to cover monthly expenses and target owner pay at a chosen hourly rate.",
    intent: "calculate billable hours break-even",
    calculator: "breakEven",
    inputs: [
      { key: "monthlyExpenses", label: "Monthly business expenses", defaultValue: 1500, min: 0, step: 50, suffix: "$" },
      { key: "targetOwnerPay", label: "Target owner pay", defaultValue: 6000, min: 0, step: 100, suffix: "$" },
      { key: "hourlyRate", label: "Average hourly rate", defaultValue: 100, min: 1, step: 1, suffix: "$" },
      { key: "availableHours", label: "Available work hours/month", defaultValue: 160, min: 1, step: 1 },
    ],
    formula: "Break-even billable hours = (monthly expenses + target owner pay) ÷ hourly rate. Utilization = billable hours ÷ available hours.",
    assumptions: ["Uses monthly gross target before taxes.", "Available hours include admin time, so utilization should not be 100%."],
    example: "($1,500 + $6,000) ÷ $100 = 75 billable hours; 75 ÷ 160 = 46.9% utilization.",
    faqs: [
      { question: "What utilization is realistic?", answer: "It varies by business model. Solo freelancers often need room for sales, admin, learning, and unpaid communication." },
      { question: "Does 100% utilization mean I am fully booked?", answer: "No. Utilization is billable hours divided by available work hours. Even at 70–80% utilization, you should still reserve time for pipeline building and skill development." },
    ],
    related: ["freelance-hourly-to-salary-calculator", "desired-take-home-rate-calculator", "retainer-pricing-calculator"],
    disclaimer: commonDisclaimer,
  },
  {
    slug: "invoice-late-fee-calculator",
    title: "Invoice Late Fee Calculator",
    description: "Estimate a simple invoice late fee from invoice amount, days late, and monthly late-fee percentage.",
    intent: "calculate invoice late fee",
    calculator: "lateFee",
    inputs: [
      { key: "invoiceAmount", label: "Invoice amount", defaultValue: 2500, min: 0, step: 10, suffix: "$" },
      { key: "monthlyFeeRate", label: "Monthly late-fee rate", defaultValue: 1.5, min: 0, step: 0.1, suffix: "%" },
      { key: "daysLate", label: "Days late", defaultValue: 15, min: 0, step: 1 },
    ],
    formula: "Estimated late fee = invoice amount × monthly late-fee rate × days late ÷ 30.",
    assumptions: ["Uses simple prorated monthly fee, not compounding.", "Only charge fees permitted by your contract and local rules."],
    example: "$2,500 × 1.5% × 15 ÷ 30 = $18.75.",
    faqs: [
      { question: "Can I always charge this?", answer: "No. Late fees depend on your contract and applicable rules. Treat this as a math helper only." },
      { question: "Should late fees compound monthly?", answer: "This calculator uses simple proration. Compounding depends on your contract terms and local regulations on interest caps." },
    ],
    related: ["project-quote-estimator", "desired-take-home-rate-calculator", "stripe-fee-calculator"],
    disclaimer: commonDisclaimer,
  },
  {
    slug: "stripe-fee-calculator",
    title: "Stripe Fee Calculator",
    description: "Estimate Stripe-style card processing fees from gross charge, percentage fee, and fixed per-transaction fee.",
    intent: "calculate Stripe processing fee",
    calculator: "processingFee",
    inputs: [
      { key: "amount", label: "Charge amount", defaultValue: 100, min: 0, step: 1, suffix: "$" },
      { key: "percentFee", label: "Percentage fee", defaultValue: 2.9, min: 0, step: 0.1, suffix: "%" },
      { key: "fixedFee", label: "Fixed fee", defaultValue: 0.3, min: 0, step: 0.01, suffix: "$" },
    ],
    formula: "Fee = amount × percentage fee + fixed fee. Net = amount − fee.",
    assumptions: ["Defaults are a common US card example, not a universal Stripe price.", "Cross-border, currency, disputes, tax, and other fees may differ."],
    example: "$100 × 2.9% + $0.30 = $3.20 fee; net = $96.80.",
    faqs: [
      { question: "Are these official Stripe fees?", answer: "The defaults are an example. Always verify the current fee schedule in your Stripe account and country." },
      { question: "How do I calculate the amount to charge so I net a specific amount?", answer: "Divide your desired net by (1 − percentage fee) and add the fixed fee. For example, to net $100: ($100 + $0.30) ÷ 0.9707 ≈ $103.32." },
    ],
    related: ["desired-take-home-rate-calculator", "project-quote-estimator", "upwork-fee-calculator"],
    disclaimer: commonDisclaimer,
  },
  {
    slug: "upwork-fee-calculator",
    title: "Upwork Fee Calculator",
    description: "Estimate net freelance revenue after a configurable Upwork-style service fee percentage.",
    intent: "calculate Upwork service fee",
    calculator: "platformFee",
    inputs: [
      { key: "grossAmount", label: "Gross client payment", defaultValue: 1000, min: 0, step: 10, suffix: "$" },
      { key: "feePercent", label: "Service fee", defaultValue: 10, min: 0, step: 0.5, suffix: "%" },
    ],
    formula: "Service fee = gross amount × fee %. Net before tax = gross amount − service fee.",
    assumptions: ["Fee defaults are configurable because platform rules can change.", "Does not include withdrawal, currency, tax, or payment-processing effects."],
    example: "$1,000 × 10% = $100 service fee; net before tax = $900.",
    faqs: [
      { question: "Why is the fee editable?", answer: "Platform fee schedules can change by contract, country, or date. Editable inputs make the math reusable." },
      { question: "Does Upwork charge different rates for new clients?", answer: "Upwork uses a tiered service fee based on lifetime billing with each client. Set the percentage to match your current contract tier." },
    ],
    related: ["desired-take-home-rate-calculator", "stripe-fee-calculator", "freelance-hourly-to-salary-calculator"],
    disclaimer: commonDisclaimer,
  },
  {
    slug: "meeting-cost-calculator",
    title: "Meeting Cost Calculator",
    description: "Estimate the labor cost of a meeting from participant count, duration, and blended hourly rate.",
    intent: "calculate meeting cost",
    calculator: "meetingCost",
    inputs: [
      { key: "participants", label: "Participants", defaultValue: 5, min: 1, step: 1 },
      { key: "durationMinutes", label: "Duration", defaultValue: 60, min: 1, step: 5, suffix: "min" },
      { key: "hourlyRate", label: "Blended hourly rate", defaultValue: 80, min: 0, step: 1, suffix: "$" },
    ],
    formula: "Meeting cost = participants × duration minutes ÷ 60 × blended hourly rate.",
    assumptions: ["Uses a blended hourly rate across all participants.", "Does not measure opportunity cost, context switching, or follow-up work."],
    example: "5 people × 60 minutes ÷ 60 × $80 = $400 meeting cost.",
    faqs: [
      { question: "What rate should I use?", answer: "Use a blended loaded cost for employees or the average billable/market rate for freelancers and consultants." },
      { question: "Does this include opportunity cost?", answer: "No. This calculator estimates direct labor cost. The opportunity cost of pulling people away from other work is usually higher than the direct cost." },
    ],
    related: ["project-quote-estimator", "retainer-pricing-calculator", "utilization-billable-hours-break-even-calculator"],
    disclaimer: commonDisclaimer,
  },
];

export const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]));
