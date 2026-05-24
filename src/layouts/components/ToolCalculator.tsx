import { useEffect, useMemo, useState } from "react";
import { toolBySlug, type Tool } from "@/data/tools";

type Values = Record<string, number>;

type Result = {
  label: string;
  value: string;
  secondary?: string;
  warning?: string;
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

function clamp(val: number, min: number): number {
  if (Number.isNaN(val) || !Number.isFinite(val)) return min;
  return Math.max(min, val);
}

function calculate(tool: Tool, values: Values): Result {
  switch (tool.calculator) {
    case "hourlySalary": {
      const hourlyRate = clamp(values.hourlyRate, 0);
      const billableHours = clamp(values.billableHoursPerWeek, 0);
      const weeksOff = clamp(values.weeksOff, 0);
      const workingWeeks = Math.min(52, Math.max(0, 52 - weeksOff));
      const annual = hourlyRate * billableHours * workingWeeks;
      return {
        label: "Estimated annual gross revenue",
        value: money.format(annual),
        secondary: `${numberFmt.format(workingWeeks)} working weeks/year`,
      };
    }
    case "dayRate": {
      const dayRate = clamp(values.dayRate, 0);
      const hoursPerDay = clamp(values.hoursPerDay, 0);
      const daysPerWeek = clamp(values.daysPerWeek, 0);
      const hourly = hoursPerDay > 0 ? dayRate / hoursPerDay : 0;
      const weekly = dayRate * daysPerWeek;
      return {
        label: "Hourly equivalent",
        value: money.format(hourly),
        secondary: `${money.format(weekly)} weekly gross at ${numberFmt.format(daysPerWeek)} days/week`,
      };
    }
    case "takeHome": {
      const targetTakeHome = clamp(values.targetTakeHome, 0);
      const taxReserve = clamp(values.taxReserve, 0);
      const expenseReserve = clamp(values.expenseReserve, 0);
      const platformFee = clamp(values.platformFee, 0);
      const totalReserve = (taxReserve + expenseReserve + platformFee) / 100;
      if (totalReserve >= 1) {
        return {
          label: "Required gross hourly rate",
          value: "N/A",
          secondary: `Total reserve ${pct(totalReserve * 100)} — must be under 100% to calculate a gross rate.`,
        };
      }
      const gross = targetTakeHome / (1 - totalReserve);
      return {
        label: "Required gross hourly rate",
        value: money.format(gross),
        secondary: `Total reserve: ${pct(totalReserve * 100)}`,
      };
    }
    case "projectQuote": {
      const hours = clamp(values.hours, 0);
      const hourlyRate = clamp(values.hourlyRate, 0);
      const contingency = clamp(values.contingency, 0);
      const expenses = clamp(values.expenses, 0);
      const quote = hours * hourlyRate * (1 + contingency / 100) + expenses;
      return {
        label: "Estimated project quote",
        value: money.format(quote),
        secondary: `${numberFmt.format(hours)} hours with ${pct(contingency)} contingency`,
      };
    }
    case "retainer": {
      const includedHours = clamp(values.includedHours, 0);
      const hourlyRate = clamp(values.hourlyRate, 0);
      const premium = clamp(values.availabilityPremium, 0);
      const retainer = includedHours * hourlyRate * (1 + premium / 100);
      return {
        label: "Suggested monthly retainer",
        value: money.format(retainer),
        secondary: `${numberFmt.format(includedHours)} included hours/month`,
      };
    }
    case "breakEven": {
      const monthlyExpenses = clamp(values.monthlyExpenses, 0);
      const targetOwnerPay = clamp(values.targetOwnerPay, 0);
      const hourlyRate = clamp(values.hourlyRate, 0);
      const availableHours = clamp(values.availableHours, 1);
      if (hourlyRate === 0) {
        return {
          label: "Break-even billable hours/month",
          value: "N/A",
          secondary: "Hourly rate must be greater than $0 to calculate break-even hours.",
        };
      }
      const required = (monthlyExpenses + targetOwnerPay) / hourlyRate;
      const utilization = (required / availableHours) * 100;
      return {
        label: "Break-even billable hours/month",
        value: `${numberFmt.format(required)} hours`,
        secondary: `${pct(utilization)} utilization of available work hours`,
      };
    }
    case "lateFee": {
      const invoiceAmount = clamp(values.invoiceAmount, 0);
      const monthlyFeeRate = clamp(values.monthlyFeeRate, 0);
      const daysLate = clamp(values.daysLate, 0);
      const fee = invoiceAmount * (monthlyFeeRate / 100) * (daysLate / 30);
      return {
        label: "Estimated late fee",
        value: money.format(fee),
        secondary: `${numberFmt.format(daysLate)} days late at ${pct(monthlyFeeRate)} monthly`,
      };
    }
    case "processingFee": {
      const amount = clamp(values.amount, 0);
      const percentFee = clamp(values.percentFee, 0);
      const fixedFee = clamp(values.fixedFee, 0);
      const fee = amount * (percentFee / 100) + fixedFee;
      return {
        label: "Estimated processing fee",
        value: money.format(fee),
        secondary: `Net before other costs: ${money.format(amount - fee)}`,
      };
    }
    case "platformFee": {
      const grossAmount = clamp(values.grossAmount, 0);
      const feePercent = clamp(values.feePercent, 0);
      const fee = grossAmount * (feePercent / 100);
      return {
        label: "Estimated service fee",
        value: money.format(fee),
        secondary: `Net before tax/other costs: ${money.format(grossAmount - fee)}`,
      };
    }
    case "meetingCost": {
      const participants = clamp(values.participants, 0);
      const durationMinutes = clamp(values.durationMinutes, 0);
      const hourlyRate = clamp(values.hourlyRate, 0);
      const cost = participants * (durationMinutes / 60) * hourlyRate;
      return {
        label: "Estimated meeting cost",
        value: money.format(cost),
        secondary: `${numberFmt.format(participants)} participants × ${numberFmt.format(durationMinutes)} minutes`,
      };
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
        {tool.inputs.map((input) => {
          const min = input.min ?? 0;
          return (
            <label className="block" key={input.key}>
              <span className="mb-2 block text-sm font-semibold text-dark dark:text-white">{input.label}</span>
              <div className="flex rounded-lg border border-border bg-light dark:bg-darkmode-light">
                {input.suffix === "$" && <span className="px-3 py-3 text-text">$</span>}
                <input
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  min={min}
                  step={input.step ?? 1}
                  type="number"
                  value={values[input.key] ?? min}
                  onChange={(event) => {
                    const raw = event.target.value;
                    const parsed = Number(raw);
                    if (raw === "" || Number.isNaN(parsed)) {
                      setValues((current) => ({ ...current, [input.key]: min }));
                    } else {
                      setValues((current) => ({ ...current, [input.key]: parsed }));
                    }
                  }}
                />
                {input.suffix && input.suffix !== "$" && <span className="px-3 py-3 text-text">{input.suffix}</span>}
              </div>
            </label>
          );
        })}
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
