const byId = (id) => document.getElementById(id);
const fmt = (x) =>
  x.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

function simulate(P, PMT, rPct, years, n = 12) {
  const r = rPct / 100,
    months = Math.max(1, Math.floor(years * 12)),
    rate = Math.pow(1 + r / n, n / 12) - 1;
  let bal = P,
    contrib = 0,
    rows = [];
  for (let m = 1; m <= months; m++) {
    bal = bal * (1 + rate) + PMT;
    contrib += PMT;
    if (m % 12 === 0)
      rows.push({
        year: m / 12,
        balance: bal,
        contribution: contrib,
        interest: bal - P - contrib,
      });
  }
  return rows;
}

function setupHiDPICanvas(c) {
  const dpr = Math.max(1, window.devicePixelRatio || 1),
    r = c.getBoundingClientRect();
  if (
    c.width !== Math.round(r.width * dpr) ||
    c.height !== Math.round(r.height * dpr)
  ) {
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
  }
  const ctx = c.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

const pathFromSeries = (ctx, data, xS, yS) => {
  data.forEach((v, i) => {
    const x = xS(i),
      y = yS(v);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
};
const drawLine = (ctx, data, xS, yS, color, w = 2) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  pathFromSeries(ctx, data, xS, yS);
  ctx.stroke();
};
const fillBetween = (ctx, top, bottom, xS, yS, color) => {
  ctx.beginPath();
  pathFromSeries(ctx, top, xS, yS);
  for (let i = bottom.length - 1; i >= 0; i--) ctx.lineTo(xS(i), yS(bottom[i]));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};
const fillToZero = (ctx, top, xS, yS, color) => {
  ctx.beginPath();
  pathFromSeries(ctx, top, xS, yS);
  ctx.lineTo(xS(top.length - 1), yS(0));
  ctx.lineTo(xS(0), yS(0));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};
const legend = (ctx, items, x, y0, dy) =>
  items.forEach((it, i) => {
    ctx.fillStyle = it.legend;
    ctx.fillText(it.label, x, y0 + dy * i);
  });

function drawChart(c, { labels, total, principal }) {
  const ctx = setupHiDPICanvas(c),
    r = c.getBoundingClientRect(),
    W = r.width,
    H = r.height;
  const pad = { l: 48, r: 12, t: 10, b: 28 },
    plotW = W - pad.l - pad.r,
    plotH = H - pad.t - pad.b;
  const maxY = Math.max(1, ...total),
    xS = (i) => pad.l + (i / (labels.length - 1 || 1)) * plotW,
    yS = (v) => pad.t + (1 - v / (maxY || 1)) * plotH;

  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "#e5e7eb";
  ctx.strokeRect(pad.l, pad.t, plotW, plotH);
  ctx.font = "12px system-ui";
  ctx.fillStyle = "#666";
  for (let t = 0; t <= 5; t++) {
    const v = (t / 5) * maxY,
      y = yS(v);
    ctx.strokeStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(W - pad.r, y);
    ctx.stroke();
    ctx.fillText(fmt(v), 6, y + 4);
  }

  const items = [
    {
      label: "Total",
      line: "#0369a1",
      legend: "#0369a1",
      fill: null,
      draw: () => drawLine(ctx, total, xS, yS, "#0369a1"),
    },
    {
      label: "Interest",
      line: null,
      legend: "#22c55e",
      fill: "rgba(34,197,94,0.25)",
      draw: () =>
        fillBetween(ctx, total, principal, xS, yS, "rgba(34,197,94,0.25)"),
    },
    {
      label: "Principal",
      line: "#0ea5e9",
      legend: "#0ea5e9",
      fill: "rgba(14,165,233,0.25)",
      draw: () => {
        fillToZero(ctx, principal, xS, yS, "rgba(14,165,233,0.25)");
        drawLine(ctx, principal, xS, yS, "#0ea5e9");
      },
    },
  ];

  items.filter((i) => i.fill).forEach((i) => i.draw());
  drawLine(ctx, total, xS, yS, "#0369a1");
  drawLine(ctx, principal, xS, yS, "#0ea5e9");
  legend(ctx, items, W - pad.r - 110, pad.t + 16, 16);
}

function update() {
  const P = +byId("principal").value || 0,
    PMT = +byId("monthly").value || 0,
    r = +byId("rate").value || 0,
    y = +byId("years").value || 1,
    n = +byId("freq").value || 12;
  const rows = simulate(P, PMT, r, y, n);
  if (!rows.length) return;
  const last = rows.at(-1);

  byId("finalBalance").textContent = fmt(last.balance);
  byId("totalContribution").textContent = fmt(last.contribution);
  byId("totalInterest").textContent = fmt(last.interest);

  byId("tableBody").innerHTML = rows
    .map(
      ({ year, balance, contribution, interest }) => `
    <tr>
        <td class="text-left p-2">${year}</td>
        <td class="text-right p-2">${fmt(balance)}</td>
        <td class="text-right p-2">${fmt(contribution)}</td>
        <td class="text-right p-2">${fmt(interest)}</td>
    </tr>`,
    )
    .join("");

  byId("tBal").textContent = fmt(last.balance);
  byId("tContribution").textContent = fmt(P + last.contribution);
  byId("tInt").textContent = fmt(last.interest);

  const labels = rows.map((r) => r.year),
    total = rows.map((r) => r.balance),
    principal = rows.map((r) => P + r.contribution);
  drawChart(byId("chart"), { labels, total, principal });
}

byId("simulate").addEventListener("click", update);
document.querySelectorAll("[data-preset]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const p = Object.fromEntries(
        btn.dataset.preset
          .split(",")
          .map((kv) => kv.split("=").map((s) => s.trim())),
      ),
      map = { p: "principal", pm: "monthly", r: "rate", y: "years", n: "freq" };
    Object.keys(map).forEach((k) => (byId(map[k]).value = p[k]));
    update();
  }),
);

update();
