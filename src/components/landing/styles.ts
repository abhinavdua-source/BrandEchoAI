// Shared button looks from the handoff. Filled ink buttons turn red on hover.
const base =
  "inline-flex items-center justify-center rounded-btn font-medium transition-colors duration-200 ease-glide";

export const btnInk = `${base} bg-ink px-[22px] py-[14px] text-[16px] text-on-dark hover:bg-red hover:text-white`;

export const btnOutline = `${base} border border-outline px-[22px] py-[14px] text-[16px] text-ink hover:border-ink hover:text-ink`;
