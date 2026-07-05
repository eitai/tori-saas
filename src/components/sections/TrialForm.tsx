import { useEffect, useRef, useState } from "react";
import { useReveal } from "../../hooks/useReveal";
import { STUDIO_URL_CTA } from "../../lib/site";
import { Check, ArrowLeft } from "../icons";

/**
 * §10 — "התחילו ניסיון" lead form. Frontend-only: client validation → success
 * state. There is NO backend and NO data is sent or stored (so no real privacy
 * concern — the disclaimer covers it). The success state is the second
 * conversion: it honestly routes the impressed business owner to E&M Studio.
 */

const BIZ_TYPES = [
  "מספרה / ברבר",
  "קליניקה / טיפולים",
  "סטודיו (יוגה / פילאטיס / ציפורניים)",
  "אחר",
];

type Field = "name" | "business" | "type" | "contact";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "success";

/** Accepts an Israeli mobile OR a plausible email. */
function isValidContact(raw: string): boolean {
  const v = raw.trim();
  if (v.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  let d = v.replace(/[\s\-().]/g, "");
  if (d.startsWith("+972")) d = "0" + d.slice(4);
  else if (d.startsWith("972")) d = "0" + d.slice(3);
  return /^05\d{8}$/.test(d);
}

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none transition placeholder:text-ink-faint focus:ring-2 motion-reduce:transition-none";
const inputOk = "border-line focus:border-indigo focus:ring-indigo/20";
const inputBad = "border-rose/60 ring-2 ring-rose/10 focus:ring-rose/25";

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mt-1.5 text-sm text-rose">
      {children}
    </p>
  );
}

export default function TrialForm() {
  const ref = useRef<HTMLElement>(null);
  const timer = useRef<number | null>(null);
  const refs = useRef<
    Partial<Record<Field, HTMLInputElement | HTMLSelectElement | null>>
  >({});

  const [values, setValues] = useState({
    name: "",
    business: "",
    type: "",
    contact: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  useReveal(ref, "[data-reveal]", { start: "top 80%" });

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  const setField = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (values.name.trim().length < 2) e.name = "נשמח לדעת איך לפנות אליכם";
    if (values.business.trim().length < 2) e.business = "מה שם העסק?";
    if (!values.type) e.type = "בחרו סוג עסק";
    if (!isValidContact(values.contact))
      e.contact = "טלפון נייד (050-1234567) או אימייל תקין";
    return e;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status !== "idle") return;
    const e = validate();
    setErrors(e);
    const firstBad = (Object.keys(e) as Field[]).find((k) => e[k]);
    if (firstBad) {
      refs.current[firstBad]?.focus();
      return;
    }
    setStatus("sending");
    // No backend by design — simulate then show the honest success state.
    timer.current = window.setTimeout(() => setStatus("success"), 800);
  };

  return (
    <section ref={ref} id="trial" className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <div
          data-reveal
          className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo to-indigo-deep p-1 shadow-2xl shadow-indigo/25"
        >
          <div className="rounded-[1.85rem] bg-white p-7 sm:p-10">
            {status === "success" ? (
              <div role="status" className="py-4 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-wash text-success-deep">
                  <Check width={32} height={32} />
                </span>
                <h2 className="mt-6 font-heading text-2xl font-extrabold text-ink sm:text-3xl">
                  🎉 מעולה! חשבון הדמו שלך מוכן
                </h2>
                <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-soft">
                  רגע של כנות: תורי הוא מוצר בדיוני — דמו פורטפוליו של E&amp;M
                  Studio. רוצים מערכת אמיתית כזו לעסק שלכם, בנויה בקוד מותאם
                  אישית? בואו נדבר.
                </p>
                <a
                  href={STUDIO_URL_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo px-7 py-3.5 font-heading font-bold text-white shadow-lg shadow-indigo/25 transition hover:bg-indigo-deep"
                >
                  לאתר של E&amp;M Studio
                  <ArrowLeft width={18} height={18} />
                </a>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">
                    מתחילים ניסיון חינם
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-ink-soft">
                    ממלאים פרטים ורואים איך זה מרגיש. בלי כרטיס אשראי, בלי
                    התחייבות.
                  </p>
                </div>

                <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="t-name" className="mb-1.5 block text-sm font-medium text-ink">
                      שם מלא
                    </label>
                    <input
                      id="t-name"
                      ref={(el) => {
                        refs.current.name = el;
                      }}
                      type="text"
                      autoComplete="name"
                      placeholder="ישראל ישראלי"
                      value={values.name}
                      onChange={(e) => setField("name", e.target.value)}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "t-name-err" : undefined}
                      className={`${inputBase} ${errors.name ? inputBad : inputOk}`}
                    />
                    {errors.name && <FieldError id="t-name-err">{errors.name}</FieldError>}
                  </div>

                  <div>
                    <label htmlFor="t-biz" className="mb-1.5 block text-sm font-medium text-ink">
                      שם העסק
                    </label>
                    <input
                      id="t-biz"
                      ref={(el) => {
                        refs.current.business = el;
                      }}
                      type="text"
                      autoComplete="organization"
                      placeholder="מספרת דניאל"
                      value={values.business}
                      onChange={(e) => setField("business", e.target.value)}
                      aria-invalid={!!errors.business}
                      aria-describedby={errors.business ? "t-biz-err" : undefined}
                      className={`${inputBase} ${errors.business ? inputBad : inputOk}`}
                    />
                    {errors.business && (
                      <FieldError id="t-biz-err">{errors.business}</FieldError>
                    )}
                  </div>

                  <div>
                    <label htmlFor="t-type" className="mb-1.5 block text-sm font-medium text-ink">
                      סוג עסק
                    </label>
                    <select
                      id="t-type"
                      ref={(el) => {
                        refs.current.type = el;
                      }}
                      value={values.type}
                      onChange={(e) => setField("type", e.target.value)}
                      aria-invalid={!!errors.type}
                      aria-describedby={errors.type ? "t-type-err" : undefined}
                      className={`${inputBase} ${values.type ? "" : "text-ink-faint"} ${
                        errors.type ? inputBad : inputOk
                      }`}
                    >
                      <option value="" disabled>
                        בחרו סוג עסק
                      </option>
                      {BIZ_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {errors.type && <FieldError id="t-type-err">{errors.type}</FieldError>}
                  </div>

                  <div>
                    <label htmlFor="t-contact" className="mb-1.5 block text-sm font-medium text-ink">
                      טלפון או אימייל
                    </label>
                    <input
                      id="t-contact"
                      ref={(el) => {
                        refs.current.contact = el;
                      }}
                      type="text"
                      inputMode="text"
                      dir="ltr"
                      placeholder="050-1234567"
                      value={values.contact}
                      onChange={(e) => setField("contact", e.target.value)}
                      aria-invalid={!!errors.contact}
                      aria-describedby={errors.contact ? "t-contact-err" : undefined}
                      className={`${inputBase} text-right ${
                        errors.contact ? inputBad : inputOk
                      }`}
                    />
                    {errors.contact && (
                      <FieldError id="t-contact-err">{errors.contact}</FieldError>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="mt-1 w-full rounded-full bg-indigo py-4 font-heading text-lg font-bold text-white shadow-lg shadow-indigo/25 transition hover:bg-indigo-deep disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
                  >
                    {status === "sending" ? "רגע…" : "פותחים חשבון דמו"}
                  </button>

                  <p className="text-center text-xs text-ink-faint sm:col-span-2">
                    הטופס להדגמה בלבד — לא נשלחים ולא נשמרים נתונים.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
