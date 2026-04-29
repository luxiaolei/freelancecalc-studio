import { useEffect, useMemo, useState } from "react";
import { toolBySlug, type Tool } from "@/data/tools";

type Values = Record<string, number>;

type Result = {
  label: string;
  value: string;
  secondary?: string;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const numberFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function pct(value: number) {
  return `${numberFmt.format(value)}%`;
}

function calculate(tool: Tool, values: Values): Result {
  switch (tool.calculator) {
    case "hourlySalary": {
      const workingWeeks = Math.max(0, 52 - values.weeksOff);
      const annual = values.hourlyRate * values.billableHoursPerWeek * workingWeeks;
      return { label: "Estimated annual gross revenue", value: money.format(annual), secondary: `${numberFmt.format(workingWeeks)} working weeks/year` };
    }
    case "dayRate": {
      const hourly = values.hoursPerDay > 0 ? values.dayRate / values.hoursPerDay : 0;
      const weekly = values.dayRate * values.daysPerWeek;
      return { label: "Hourly equivalent", value: money.format(hourly), secondary: `${money.format(weekly)} weekly gross at ${numberFmt.format(values.daysPerWeek)} days/week` };
    }
    case "takeHome": {
      const totalReserve = (values.taxReserve + values.expenseReserve + values.platformFee) / 100;
      const gross = totalReserve < 1 ? values.targetTakeHome / (1 - totalReserve) : 0;
      return { label: "Required gross hourly rate", value: money.format(gross), secondary: `Total reserve: ${pct(totalReserve * 100)}` };
    }
    case "projectQuote": {
      const quote = values.hours * values.hourlyRate * (1 + values.contingency / 100) + values.expenses;
      return { label: "Estimated project quote", value: money.format(quote), secondary: `${numberFmt.format(values.hours)} hours with ${pct(values.contingency)} contingency` };
    }
    case "retainer": {
      const retainer = values.includedHours * values.hourlyRate * (1 + values.availabilityPremium / 100);
      return { label: "Suggested monthly retainer", value: money.format(retainer), secondary: `${numberFmt.format(values.includedHours)} included hours/month` };
    }
    case "breakEven": {
      const required = (values.monthlyExpenses + values.targetOwnerPay) / values.hourlyRate;
      const utilization = (required / values.availableHours) * 100;
      return { label: "Break-even billable hours/month", value: `${numberFmt.format(required)} hours`, secondary: `${pct(utilization)} utilization of available work hours` };
    }
    case "lateFee": {
      const fee = values.invoiceAmount * (values.monthlyFeeRate / 100) * (values.daysLate / 30);
      return { label: "Estimated late fee", value: money.format(fee), secondary: `${numberFmt.format(values.daysLate)} days late at ${pct(values.monthlyFeeRate)} monthly` };
    }
    case "processingFee": {
      const fee = values.amount * (values.percentFee / 100) + values.fixedFee;
      return { label: "Estimated processing fee", value: money.format(fee), secondary: `Net before other costs: ${money.format(values.amount - fee)}` };
    }
    case "platformFee": {
      const fee = values.grossAmount * (values.feePercent / 100);
      return { label: "Estimated service fee", value: money.format(fee), secondary: `Net before tax/other costs: ${money.format(values.grossAmount - fee)}` };
    }
    case "meetingCost": {
      const cost = values.participants * (values.durationMinutes / 60) * values.hourlyRate;
      return { label: "Estimated meeting cost", value: money.format(cost), secondary: `${numberFmt.format(values.participants)} participants × ${numberFmt.format(values.durationMinutes)} minutes` };
    }
    default:
      return { label: "Result", value: "Not available" };
  }
}

export default function ToolCalculator({ slug }: { slug: string }) {
  const maybeTool = toolBySlug.get(slug);
  if (!maybeTool) return <p>Tool not found.</p>;

  const tool = maybeTool;
  const defaults = useMemo(() => Object.fromEntries(tool.inputs.map((input) => [input.key, Number(input.defaultValue)])), [tool]);
  const [values, setValues] = useState<Values>(defaults);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = { ...defaults };
    for (const input of tool.inputs) {
      const raw = params.get(input.key);
      if (raw !== null && raw.trim() !== "" && !Number.isNaN(Number(raw))) {
        next[input.key] = Number(raw);
      }
    }
    setValues(next);
  }, [defaults, tool.inputs]);

  useEffect(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) params.set(key, String(value));
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);
  }, [values]);

  const result = calculate(tool, values);

  async function copyResult() {
    const text = `${tool.title}: ${result.label} = ${result.value}${result.secondary ? ` (${result.secondary})` : ""}\n${window.location.href}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-2xl border border-border bg-body p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        {tool.inputs.map((input) => (
          <label className="block" key={input.key}>
            <span className="mb-2 block text-sm font-semibold text-dark dark:text-white">{input.label}</span>
            <div className="flex rounded-lg border border-border bg-light dark:bg-darkmode-light">
              {input.suffix === "$" && <span className="px-3 py-3 text-text">$</span>}
              <input
                className="w-full bg-transparent px-3 py-3 outline-none"
                min={input.min}
                step={input.step ?? 1}
                type="number"
                value={values[input.key] ?? 0}
                onChange={(event) => setValues((current) => ({ ...current, [input.key]: Number(event.target.value) }))}
              />
              {input.suffix && input.suffix !== "$" && <span className="px-3 py-3 text-text">{input.suffix}</span>}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-theme-light p-5 dark:bg-darkmode-theme-light">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">{result.label}</p>
        <p className="mt-2 text-4xl font-bold text-dark dark:text-white">{result.value}</p>
        {result.secondary && <p className="mt-2 text-sm">{result.secondary}</p>}
        <button className="btn btn-primary mt-4" type="button" onClick={copyResult}>
          {copied ? "Copied" : "Copy result"}
        </button>
      </div>
    </div>
  );
}
