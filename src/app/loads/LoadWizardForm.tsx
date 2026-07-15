"use client";

import { useRef, useState } from "react";
import { createLoad } from "./actions";
import { inputClass, primaryButtonClass } from "@/lib/ui";
import { EQUIPMENT_OPTIONS, MODE_OPTIONS } from "@/lib/loadOptions";

const STEPS = [
  { label: "Pickup" },
  { label: "Delivery" },
  { label: "Customer" },
  { label: "Carrier" },
];

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm text-zinc-400 ${className ?? ""}`}>
      {label}
      {children}
    </label>
  );
}

export function LoadWizardForm({
  customers,
  carriers,
}: {
  customers: { id: string; name: string }[];
  carriers: { id: string; name: string }[];
}) {
  const [step, setStep] = useState(0);
  const stepEls = useRef<(HTMLDivElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  function goNext() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function jumpTo(index: number) {
    setStep(index);
  }

  function handlePrimaryClick() {
    if (step !== STEPS.length - 1) {
      goNext();
      return;
    }

    // Final step: validate the whole form (not just this step) before
    // submitting. If something's missing, jump to whichever step has the
    // first invalid field so the user can actually see it, rather than
    // relying on native validation to focus a field that may be slid
    // off-screen in another step.
    const form = formRef.current;
    if (!form) return;
    const fields = form.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input, select, textarea");
    for (const field of fields) {
      if (!field.checkValidity()) {
        const stepIndex = stepEls.current.findIndex((el) =>
          el?.contains(field),
        );
        if (stepIndex !== -1) setStep(stepIndex);
        requestAnimationFrame(() => field.reportValidity());
        return;
      }
    }

    // Submitting via requestSubmit (rather than a type="submit" button
    // whose `type` flips based on step) avoids a browser quirk where a
    // button mutated from type="button" to type="submit" on the same
    // click can submit that very click's default action.
    form.requestSubmit();
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <form
      ref={formRef}
      action={createLoad}
      className="glass overflow-hidden rounded-2xl"
    >
      <div className="flex items-center gap-1 border-b border-white/10 px-6 py-4">
        {STEPS.map((s, i) => {
          const active = i === step;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => jumpTo(i)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  active
                    ? "accent-gradient text-white"
                    : "bg-white/10 text-zinc-300"
                }`}
              >
                {i + 1}
              </span>
              {s.label}
              {i < STEPS.length - 1 && (
                <span className="ml-1 h-px w-4 bg-white/10" />
              )}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {/* Step 1: Pickup */}
          <div
            ref={(el) => {
              stepEls.current[0] = el;
            }}
            className="grid w-full shrink-0 grid-cols-2 gap-3 p-6"
          >
            <Field label="Shipper name (business/location at pickup)" className="col-span-2">
              <input name="shipperName" className={inputClass} />
            </Field>
            <Field label="Pickup address*" className="col-span-2">
              <input name="pickupAddress" required className={inputClass} />
            </Field>
            <Field label="Pickup scheduled time*">
              <input
                name="pickupScheduledAt"
                type="datetime-local"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Equipment*">
              <select
                name="equipment"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select equipment
                </option>
                {EQUIPMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mode*">
              <select
                name="modeType"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select mode
                </option>
                {MODE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pieces">
              <input name="pieces" type="number" className={inputClass} />
            </Field>
            <Field label="Weight (lbs)">
              <input name="weight" type="number" className={inputClass} />
            </Field>
            <Field label="Commodity" className="col-span-2">
              <input name="commodity" className={inputClass} />
            </Field>
            <Field label="Notes" className="col-span-2">
              <textarea name="notes" className={inputClass} />
            </Field>
          </div>

          {/* Step 2: Delivery */}
          <div
            ref={(el) => {
              stepEls.current[1] = el;
            }}
            className="grid w-full shrink-0 grid-cols-2 gap-3 p-6"
          >
            <Field label="Receiver name (business/location at delivery)" className="col-span-2">
              <input name="receiverName" className={inputClass} />
            </Field>
            <Field label="Delivery address*" className="col-span-2">
              <input name="deliveryAddress" required className={inputClass} />
            </Field>
            <Field label="Delivery scheduled time*">
              <input
                name="deliveryScheduledAt"
                type="datetime-local"
                required
                className={inputClass}
              />
            </Field>
          </div>

          {/* Step 3: Customer */}
          <div
            ref={(el) => {
              stepEls.current[2] = el;
            }}
            className="grid w-full shrink-0 grid-cols-2 gap-3 p-6"
          >
            <Field label="Reference # (customer's PO/ref #, optional)" className="col-span-2">
              <input name="referenceNumber" className={inputClass} />
            </Field>
            <Field label="Customer*" className="col-span-2">
              <select name="customerId" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Select customer
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Customer rate ($)*">
              <input
                name="customerRate"
                type="number"
                step="0.01"
                required
                className={inputClass}
              />
            </Field>
          </div>

          {/* Step 4: Carrier */}
          <div
            ref={(el) => {
              stepEls.current[3] = el;
            }}
            className="grid w-full shrink-0 grid-cols-2 gap-3 p-6"
          >
            <Field label="Carrier (assign now or later)" className="col-span-2">
              <select name="carrierId" defaultValue="" className={inputClass}>
                <option value="">Assign later</option>
                {carriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Truck #">
              <input name="truckNumber" className={inputClass} />
            </Field>
            <Field label="Carrier rate ($)">
              <input
                name="carrierRate"
                type="number"
                step="0.01"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white disabled:opacity-0"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handlePrimaryClick}
          className={primaryButtonClass}
        >
          {isLastStep ? "Create load" : "Next →"}
        </button>
      </div>
    </form>
  );
}
