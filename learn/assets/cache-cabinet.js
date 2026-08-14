const STEPS = [
  {
    url: "/sprint",
    caption:
      'Cold load. No ?sprint= in the URL, so the hook does not yet know the number. It observes ["sprint-board", "active"] and waits for restore to finish.',
    slots: {
      active: { text: '["sprint-board", "active"]', filled: false, hit: true },
      n42: { text: '["sprint-board", 42]', filled: false, hit: false },
      n41: { text: '["sprint-board", 41]', filled: false, hit: false },
      meta: { text: '["sprint-board-meta"]', filled: false, hit: false },
    },
  },
  {
    url: "/sprint  →  GET /api/sprint-board",
    caption:
      "queryFn runs fetchSprintBoardAndCache with sprintNumber undefined. The API calls loadSprintBoard() with no number, so Jira resolveSprint picks the active Sphinx sprint.",
    slots: {
      active: {
        text: '["sprint-board", "active"] fetching…',
        filled: false,
        hit: true,
      },
      n42: { text: '["sprint-board", 42]', filled: false, hit: false },
      n41: { text: '["sprint-board", 41]', filled: false, hit: false },
      meta: { text: '["sprint-board-meta"]', filled: false, hit: false },
    },
  },
  {
    url: "/sprint",
    caption:
      'Response is sprint 42. React Query caches it under the observed key ("active"). cacheSprintBoardResponse also aliases the same payload onto ["sprint-board", 42] and seeds meta once.',
    slots: {
      active: {
        text: '["sprint-board", "active"] = sprint 42 body',
        filled: true,
        hit: true,
      },
      n42: {
        text: '["sprint-board", 42] = same body (alias)',
        filled: true,
        hit: false,
      },
      n41: { text: '["sprint-board", 41]', filled: false, hit: false },
      meta: {
        text: "meta = { activeNumber: 42, recentSprints }",
        filled: true,
        hit: true,
      },
    },
  },
  {
    url: "/sprint?sprint=41  →  GET /api/sprint-board?sprint=41",
    caption:
      'Picker change writes ?sprint=41. New key: ["sprint-board", 41]. Cache miss, so a second fetch runs. Meta is not fetched — enabled: false.',
    slots: {
      active: {
        text: '["sprint-board", "active"] = sprint 42 body',
        filled: true,
        hit: false,
      },
      n42: {
        text: '["sprint-board", 42] = sprint 42 body',
        filled: true,
        hit: false,
      },
      n41: { text: '["sprint-board", 41] fetching…', filled: false, hit: true },
      meta: {
        text: "meta = { activeNumber: 42, recentSprints }",
        filled: true,
        hit: false,
      },
    },
  },
  {
    url: "/sprint?sprint=41",
    caption:
      "Sprint 41 lands in its own board slot. The if (!getQueryData(meta)) guard skips — meta stays 42’s picker list. useSprintBoard overlays meta.recentSprints onto the 41 body so the dropdown does not jump.",
    slots: {
      active: {
        text: '["sprint-board", "active"] = sprint 42 body',
        filled: true,
        hit: false,
      },
      n42: {
        text: '["sprint-board", 42] = sprint 42 body',
        filled: true,
        hit: false,
      },
      n41: {
        text: '["sprint-board", 41] = sprint 41 body',
        filled: true,
        hit: true,
      },
      meta: {
        text: "meta still 42’s list (not overwritten)",
        filled: true,
        hit: true,
      },
    },
  },
  {
    url: "/sprint",
    caption:
      'Back to Active: the hook observes ["sprint-board", "active"] again. That slot is already filled, staleTime is Infinity, so no network. The numeric alias means /sprint?sprint=42 would also be a memory hit.',
    slots: {
      active: {
        text: '["sprint-board", "active"] = sprint 42 body',
        filled: true,
        hit: true,
      },
      n42: {
        text: '["sprint-board", 42] = sprint 42 body',
        filled: true,
        hit: false,
      },
      n41: {
        text: '["sprint-board", 41] = sprint 41 body',
        filled: true,
        hit: false,
      },
      meta: {
        text: "meta still 42’s list",
        filled: true,
        hit: false,
      },
    },
  },
];

const renderSlot = (el, slot) => {
  el.textContent = slot.text;
  el.classList.toggle("filled", slot.filled);
  el.classList.toggle("hit", slot.hit);
};

const initCabinet = () => {
  const root = document.querySelector("[data-cabinet]");
  if (!root) return;

  const urlEl = root.querySelector("[data-url]");
  const captionEl = root.querySelector("[data-caption]");
  const nextBtn = root.querySelector("[data-next]");
  const resetBtn = root.querySelector("[data-reset]");
  const slots = {
    active: root.querySelector('[data-slot="active"]'),
    n42: root.querySelector('[data-slot="n42"]'),
    n41: root.querySelector('[data-slot="n41"]'),
    meta: root.querySelector('[data-slot="meta"]'),
  };

  let index = 0;

  const paint = () => {
    const step = STEPS[index];
    urlEl.innerHTML = `URL <strong>${step.url}</strong>`;
    captionEl.textContent = step.caption;
    renderSlot(slots.active, step.slots.active);
    renderSlot(slots.n42, step.slots.n42);
    renderSlot(slots.n41, step.slots.n41);
    renderSlot(slots.meta, step.slots.meta);
    slots.meta.classList.toggle("meta", step.slots.meta.filled);
    nextBtn.disabled = index >= STEPS.length - 1;
    nextBtn.textContent =
      index >= STEPS.length - 1 ? "End of walkthrough" : "Next step";
  };

  nextBtn.addEventListener("click", () => {
    if (index < STEPS.length - 1) {
      index += 1;
      paint();
    }
  });

  resetBtn.addEventListener("click", () => {
    index = 0;
    paint();
  });

  paint();
};

initCabinet();
