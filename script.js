/*
  G.ARTISAN.A Project Inquiry WebApp
  1) Replace WHATSAPP_NUMBER with your number in international format, without + or spaces.
     Example for Israel: 9725XXXXXXXX
  2) Later, add GOOGLE_APPS_SCRIPT_URL if you want to save data to Google Sheets.
*/

const WHATSAPP_NUMBER = "972559732147"; // TODO: replace with your WhatsApp number
const GOOGLE_APPS_SCRIPT_URL = ""; // Optional later: paste Apps Script Web App URL here

const state = {
  currentStep: 0,
  totalSteps: 12,
  data: {
    budget: "",
    coreService: "",
    addOns: [],
    projectName: "",
    industry: "",
    projectStatus: "",
    projectDescription: "",
    goals: [],
    challenge: "",
    audience: "",
    impressions: [],
    visualDonts: "",
    visualStyles: [],
    references: "",
    deliverables: [],
    timeline: "",
    launchDate: "",
    fullName: "",
    phone: "",
    email: "",
    location: "",
    contactPreference: "",
    notes: ""
  },
  lastWhatsappUrl: ""
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const form = $("#projectForm");
const steps = $$(".step");
const nextBtn = $("#nextBtn");
const prevBtn = $("#prevBtn");
const resetBtn = $("#resetBtn");
const stepCounter = $("#stepCounter");
const progressFill = $("#progressFill");
const reviewBox = $("#reviewBox");
const openWhatsappAgain = $("#openWhatsappAgain");

function getCurrentStepEl() {
  return steps.find(step => Number(step.dataset.step) === state.currentStep);
}

function updateUI() {
  steps.forEach(step => {
    step.classList.toggle("active", Number(step.dataset.step) === state.currentStep);
  });

  const visibleStepNumber = Math.min(state.currentStep + 1, state.totalSteps);
  stepCounter.textContent = state.currentStep === 12
    ? "تم تجهيز الطلب"
    : `الخطوة ${visibleStepNumber} من ${state.totalSteps}`;

  const progress = state.currentStep >= 12 ? 100 : (state.currentStep / (state.totalSteps - 1)) * 100;
  progressFill.style.width = `${Math.max(5, progress)}%`;

  prevBtn.classList.toggle("hidden", state.currentStep === 0 || state.currentStep === 12);

  if (state.currentStep === 0) {
    nextBtn.textContent = "ابدأ الآن";
  } else if (state.currentStep === 11) {
    nextBtn.textContent = "إرسال الطلب";
  } else if (state.currentStep === 12) {
    nextBtn.classList.add("hidden");
  } else {
    nextBtn.classList.remove("hidden");
    nextBtn.textContent = "التالي";
  }

  if (state.currentStep !== 12) {
    nextBtn.classList.remove("hidden");
  }

  if (state.currentStep === 11) {
    renderReview();
  }

  // Scroll behavior:
  // On mobile/tablet the brand panel sits above the form.
  // After moving past the intro, keep the user at the form/progress area instead of jumping back to the hero panel.
  const formPanel = document.querySelector(".form-panel");
  const isStackedLayout = window.matchMedia("(max-width: 980px)").matches;

  if (state.currentStep === 0 || !isStackedLayout || !formPanel) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setSingleValue(field, value, element) {
  state.data[field] = value;

  $$(`[data-field="${field}"]`).forEach(el => el.classList.remove("selected"));
  element.classList.add("selected");
  hideError(field);
}

function toggleMultiValue(field, value, element) {
  const list = state.data[field] || [];
  const noneValues = ["لا أحتاج إضافات حاليًا", "غير متأكد، أحتاج اقتراحًا مناسبًا"];

  if (field === "addOns" && value === "لا أحتاج إضافات حاليًا") {
    state.data[field] = list.includes(value) ? [] : [value];
    $$(`[data-field="${field}"]`).forEach(el => {
      el.classList.toggle("selected", el.dataset.value === value && state.data[field].includes(value));
    });
    return;
  }

  if (field === "addOns" && list.includes("لا أحتاج إضافات حاليًا")) {
    state.data[field] = [];
    $$(`[data-field="${field}"]`).forEach(el => el.classList.remove("selected"));
  }

  if (list.includes(value)) {
    state.data[field] = list.filter(item => item !== value);
    element.classList.remove("selected");
  } else {
    state.data[field] = [...list, value];
    element.classList.add("selected");
  }

  // For deliverables, allow "not sure" with other options because it can be useful.
  if (noneValues.includes(value) && field !== "addOns") {
    element.classList.toggle("selected", state.data[field].includes(value));
  }
}

function attachChoiceHandlers() {
  $$("[data-field]").forEach(element => {
    element.addEventListener("click", () => {
      const field = element.dataset.field;
      const value = element.dataset.value;
      const isMulti = element.classList.contains("multi");

      if (isMulti) {
        toggleMultiValue(field, value, element);
      } else {
        setSingleValue(field, value, element);
      }
    });
  });
}

function syncInputsToState() {
  const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    if (Object.prototype.hasOwnProperty.call(state.data, key)) {
      state.data[key] = String(value).trim();
    }
  }
}

function showError(key) {
  const el = $(`[data-error-for="${key}"]`);
  if (!el) return;

  el.classList.add("visible");

  // When validation fails, take the user directly to the relevant message.
  // This is especially useful on mobile after pressing "التالي" without selecting a budget.
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function hideError(key) {
  const el = $(`[data-error-for="${key}"]`);
  if (el) el.classList.remove("visible");
}

function hideAllErrors() {
  $$(".error-message").forEach(error => error.classList.remove("visible"));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStep(stepIndex) {
  syncInputsToState();
  hideAllErrors();

  switch (stepIndex) {
    case 1:
      if (!state.data.budget) {
        showError("budget");
        return false;
      }
      return true;

    case 2:
      if (!state.data.coreService) {
        showError("coreService");
        return false;
      }
      return true;

    case 4:
      if (!state.data.projectName || !state.data.industry || !state.data.projectStatus) {
        showError("projectInfo");
        return false;
      }
      return true;

    case 6:
      if (!state.data.audience) {
        showError("audience");
        return false;
      }
      return true;

    case 9:
      if (!state.data.timeline) {
        showError("timeline");
        return false;
      }
      return true;

    case 10:
      if (
        !state.data.fullName ||
        !state.data.phone ||
        !state.data.email ||
        !isValidEmail(state.data.email) ||
        !state.data.contactPreference
      ) {
        showError("contactInfo");
        return false;
      }
      return true;

    default:
      return true;
  }
}

function nextStep() {
  if (state.currentStep === 11) {
    submitInquiry();
    return;
  }

  if (!validateStep(state.currentStep)) {
    return;
  }

  state.currentStep = Math.min(12, state.currentStep + 1);
  updateUI();
}

function prevStep() {
  state.currentStep = Math.max(0, state.currentStep - 1);
  updateUI();
}

function clean(value) {
  if (Array.isArray(value)) return value.length ? value.join("، ") : "لم يتم التحديد";
  return value && String(value).trim() ? String(value).trim() : "لم يتم التحديد";
}

function reviewSection(title, rows) {
  const rowsHtml = rows.map(([label, value]) => `
    <div class="review-row">
      <span>${label}</span>
      <span>${clean(value)}</span>
    </div>
  `).join("");

  return `
    <section class="review-section">
      <h3>${title}</h3>
      ${rowsHtml}
    </section>
  `;
}

function renderReview() {
  syncInputsToState();

  reviewBox.innerHTML = [
    reviewSection("الميزانية والخدمات", [
      ["الميزانية", state.data.budget],
      ["الخدمة الأساسية", state.data.coreService],
      ["الخدمات الإضافية", state.data.addOns]
    ]),
    reviewSection("معلومات المشروع", [
      ["اسم المشروع", state.data.projectName],
      ["مجال العمل", state.data.industry],
      ["حالة المشروع", state.data.projectStatus],
      ["وصف مختصر", state.data.projectDescription]
    ]),
    reviewSection("الهدف والتحدي", [
      ["الأهداف", state.data.goals],
      ["التحدي الحالي", state.data.challenge]
    ]),
    reviewSection("الجمهور والاتجاه", [
      ["الجمهور المستهدف", state.data.audience],
      ["الانطباع المطلوب", state.data.impressions],
      ["أشياء غير مرغوبة بصريًا", state.data.visualDonts],
      ["الاتجاه البصري", state.data.visualStyles],
      ["مراجع أو أمثلة", state.data.references]
    ]),
    reviewSection("المخرجات والوقت", [
      ["المخرجات المتوقعة", state.data.deliverables],
      ["الوقت المتوقع", state.data.timeline],
      ["موعد إطلاق / مناسبة", state.data.launchDate]
    ]),
    reviewSection("معلومات التواصل", [
      ["الاسم", state.data.fullName],
      ["رقم الهاتف", state.data.phone],
      ["البريد الإلكتروني", state.data.email],
      ["المدينة / الدولة", state.data.location],
      ["وسيلة التواصل المفضلة", state.data.contactPreference],
      ["ملاحظات إضافية", state.data.notes]
    ])
  ].join("");
}

function buildWhatsappMessage() {
  syncInputsToState();

  return `مرحبًا، قمت بتعبئة استمارة طلب مشروع جديد.

— معلومات التواصل —
الاسم: ${clean(state.data.fullName)}
رقم الهاتف: ${clean(state.data.phone)}
البريد الإلكتروني: ${clean(state.data.email)}
المدينة / الدولة: ${clean(state.data.location)}
وسيلة التواصل المفضلة: ${clean(state.data.contactPreference)}

— الميزانية —
الفئة المختارة: ${clean(state.data.budget)}

— نوع الخدمة —
الخدمة الأساسية: ${clean(state.data.coreService)}
الخدمات الإضافية: ${clean(state.data.addOns)}

— معلومات المشروع —
اسم المشروع: ${clean(state.data.projectName)}
مجال العمل: ${clean(state.data.industry)}
حالة المشروع: ${clean(state.data.projectStatus)}
وصف مختصر: ${clean(state.data.projectDescription)}

— الهدف من المشروع —
الأهداف: ${clean(state.data.goals)}
التحدي الحالي: ${clean(state.data.challenge)}

— الجمهور والاتجاه —
الجمهور المستهدف: ${clean(state.data.audience)}
الانطباع المطلوب: ${clean(state.data.impressions)}
أشياء لا أرغب بها بصريًا: ${clean(state.data.visualDonts)}

— الاتجاه البصري —
الأنماط المختارة: ${clean(state.data.visualStyles)}
مراجع أو أمثلة: ${clean(state.data.references)}

— المخرجات والوقت —
المخرجات المتوقعة: ${clean(state.data.deliverables)}
الوقت المتوقع: ${clean(state.data.timeline)}
موعد إطلاق / مناسبة: ${clean(state.data.launchDate)}

بانتظار تواصلك.`;
}

function buildWhatsappUrl() {
  const message = encodeURIComponent(buildWhatsappMessage());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

async function saveToGoogleSheetsIfConfigured() {
  if (!GOOGLE_APPS_SCRIPT_URL) return { skipped: true };

  const payload = {
    submittedAt: new Date().toISOString(),
    ...state.data
  };

  const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return { ok: true, response };
}

async function submitInquiry() {
  syncInputsToState();
  nextBtn.disabled = true;
  nextBtn.textContent = "جاري الإرسال...";

  try {
    await saveToGoogleSheetsIfConfigured();
  } catch (error) {
    console.warn("Google Sheets save failed or blocked:", error);
    // The WhatsApp flow still continues.
  }

  state.lastWhatsappUrl = buildWhatsappUrl();

  state.currentStep = 12;
  updateUI();

  // Open WhatsApp after the UI updates.
  setTimeout(() => {
    window.open(state.lastWhatsappUrl, "_blank", "noopener,noreferrer");
  }, 450);

  nextBtn.disabled = false;
}

function resetForm() {
  const confirmed = confirm("هل تريد إعادة ضبط الاستمارة من البداية؟");
  if (!confirmed) return;

  form.reset();

  Object.keys(state.data).forEach(key => {
    state.data[key] = Array.isArray(state.data[key]) ? [] : "";
  });

  $$(".selected").forEach(el => el.classList.remove("selected"));
  hideAllErrors();

  state.currentStep = 0;
  state.lastWhatsappUrl = "";
  updateUI();
}

function attachEvents() {
  attachChoiceHandlers();

  nextBtn.addEventListener("click", nextStep);
  prevBtn.addEventListener("click", prevStep);
  resetBtn.addEventListener("click", resetForm);

  openWhatsappAgain.addEventListener("click", () => {
    if (!state.lastWhatsappUrl) {
      state.lastWhatsappUrl = buildWhatsappUrl();
    }
    window.open(state.lastWhatsappUrl, "_blank", "noopener,noreferrer");
  });

  $$("input, textarea").forEach(input => {
    input.addEventListener("input", () => {
      syncInputsToState();
      hideAllErrors();
    });
  });

  window.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag !== "textarea") {
        event.preventDefault();
      }
    }
  });
}

attachEvents();
updateUI();
