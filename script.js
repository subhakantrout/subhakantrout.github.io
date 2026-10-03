/**
 * LIQWID PIPS — TRADING SYSTEMS & INDICATOR PORTFOLIO
 * Core Interactive Engine: Candlestick Canvas, Real-Time Ticker, & Indicators
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientBackground();
  initCandlestickSimulator();
  initRiskCalculator();
  initIndicatorModals();
  initNavigation();
  initContactForm();
});

/* ==========================================================================
   1. AMBIENT BACKGROUND PARTICLES
   ========================================================================== */
function initAmbientBackground() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((width * height) / 22000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.4,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.5 + 0.15
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < 0) {
        p.y = height;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
}

/* ==========================================================================
   2. INTERACTIVE CANDLESTICK CHART SIMULATOR
   ========================================================================== */
function initCandlestickSimulator() {
  const canvas = document.getElementById('candlestick-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;

  // State
  let asset = 'XAUUSD';
  let timeframe = '15m';
  let candles = [];
  let hoverIndex = -1;
  let mousePos = { x: -1, y: -1 };
  let isHovering = false;

  // Active Indicator Layers
  const layers = {
    sweeps: true,
    smc: true,
    structure: true,
    waves: false
  };

  // Asset Base Configurations
  const assetConfigs = {
    XAUUSD: { basePrice: 2682.50, pipSize: 0.1, decimals: 2, unit: '$' },
    EURUSD: { basePrice: 1.08450, pipSize: 0.0001, decimals: 5, unit: '' },
    BTCUSD: { basePrice: 67450.0, pipSize: 1.0, decimals: 1, unit: '$' },
    US30:   { basePrice: 42890.0, pipSize: 1.0, decimals: 1, unit: 'pts' }
  };

  function generateCandleData() {
    const config = assetConfigs[asset] || assetConfigs.XAUUSD;
    candles = [];
    let currentPrice = config.basePrice;
    const totalBars = 55;
    const volatility = config.basePrice * 0.0018;

    for (let i = 0; i < totalBars; i++) {
      const dir = (Math.random() > 0.47) ? 1 : -1;
      const change = (Math.random() * volatility) * dir;
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * (volatility * 0.65);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.65);
      const volume = Math.floor(Math.random() * 450 + 120);

      candles.push({
        open, high, low, close, volume,
        time: new Date(Date.now() - (totalBars - i) * 15 * 60 * 1000)
      });

      currentPrice = close;
    }
  }

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    renderChart();
  }

  function renderChart() {
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    if (candles.length === 0) return;

    // Price scales & layout bounds
    const paddingRight = 65;
    const paddingBottom = 28;
    const paddingTop = 20;
    const chartWidth = width - paddingRight;
    const chartHeight = height - paddingBottom - paddingTop;

    // Min & Max prices
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (let c of candles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }

    const priceRange = (maxPrice - minPrice) || 1;
    const paddingBuffer = priceRange * 0.08;
    const scaleMin = minPrice - paddingBuffer;
    const scaleMax = maxPrice + paddingBuffer;
    const scaleRange = scaleMax - scaleMin;

    function getY(price) {
      return paddingTop + (1 - (price - scaleMin) / scaleRange) * chartHeight;
    }

    // Grid lines (horizontal prices)
    const gridCount = 5;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#657888';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridCount; i++) {
      const price = scaleMin + (scaleRange / gridCount) * i;
      const y = getY(price);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      const config = assetConfigs[asset];
      ctx.fillText(price.toFixed(config.decimals), chartWidth + 6, y + 3);
    }

    // Render Candlesticks
    const barSpacing = chartWidth / candles.length;
    const candleWidth = Math.max(3, barSpacing * 0.65);

    // Max volume for volume bar base
    const maxVol = Math.max(...candles.map(c => c.volume));
    const volHeight = 45;

    candles.forEach((c, i) => {
      const x = i * barSpacing + barSpacing / 2;
      const isBull = c.close >= c.open;
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const color = isBull ? '#00E676' : '#FF2A55';
      const glow = isBull ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 42, 85, 0.25)';

      // Volume bar
      const barH = (c.volume / maxVol) * volHeight;
      ctx.fillStyle = isBull ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 42, 85, 0.12)';
      ctx.fillRect(x - candleWidth / 2, height - paddingBottom - barH, candleWidth, barH);

      // Candlestick Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Candlestick Body
      const top = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(closeY - openY));

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, top, candleWidth, bodyH);
    });

    // ----------------------------------------------------
    // INDICATOR LAYER 1: LIQUIDITY SWEEPS (BSL / SSL)
    // ----------------------------------------------------
    if (layers.sweeps && candles.length > 20) {
      // Find significant swing high and swing low in middle range
      let swingHighIdx = 14;
      let swingLowIdx = 26;
      let maxVal = -Infinity;
      let minVal = Infinity;

      for (let i = 10; i < 22; i++) {
        if (candles[i].high > maxVal) {
          maxVal = candles[i].high;
          swingHighIdx = i;
        }
      }
      for (let i = 22; i < 35; i++) {
        if (candles[i].low < minVal) {
          minVal = candles[i].low;
          swingLowIdx = i;
        }
      }

      // Draw Buy Side Liquidity (BSL) Level
      const bslY = getY(maxVal);
      const bslStartX = swingHighIdx * barSpacing;
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(bslStartX, bslY);
      ctx.lineTo(chartWidth, bslY);
      ctx.stroke();
      ctx.setLineDash([]);

      // BSL Label
      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('BSL (EQUAL HIGHS)', bslStartX + 8, bslY - 5);

      // Sweep Marker on a later candle that spiked above
      const sweepCandleIdx = Math.min(candles.length - 8, swingHighIdx + 16);
      const sweepX = sweepCandleIdx * barSpacing + barSpacing / 2;
      const sweepCandleHighY = getY(candles[sweepCandleIdx].high);

      // Neon Sweep Tag
      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1;
      const tagW = 105;
      const tagH = 18;
      ctx.beginPath();
      ctx.roundRect(sweepX - tagW / 2, sweepCandleHighY - 26, tagW, tagH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00F0FF';
      ctx.textAlign = 'center';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('⚡ LIQ SWEEP CONFIRMED', sweepX, sweepCandleHighY - 14);
      ctx.textAlign = 'left';
    }

    // ----------------------------------------------------
    // INDICATOR LAYER 2: SMC ORDER BLOCKS & FVG
    // ----------------------------------------------------
    if (layers.smc && candles.length > 25) {
      // Draw Fair Value Gap (FVG) box
      const fvgStartIdx = 30;
      const fvgX = fvgStartIdx * barSpacing;
      const fvgTop = getY(candles[fvgStartIdx].high * 1.0006);
      const fvgBottom = getY(candles[fvgStartIdx + 2].low * 0.9994);
      const fvgW = barSpacing * 9;
      const fvgH = Math.max(8, fvgBottom - fvgTop);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.fillRect(fvgX, fvgTop, fvgW, fvgH);
      ctx.strokeRect(fvgX, fvgTop, fvgW, fvgH);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('+FVG (IMBALANCE)', fvgX + 6, fvgTop + 12);
    }

    // ----------------------------------------------------
    // INDICATOR LAYER 3: MARKET STRUCTURE (BOS / CHoCH)
    // ----------------------------------------------------
    if (layers.structure && candles.length > 35) {
      const bosIdx = 36;
      const bosX1 = (bosIdx - 8) * barSpacing;
      const bosX2 = (bosIdx + 6) * barSpacing;
      const bosPrice = candles[bosIdx - 8].high;
      const bosY = getY(bosPrice);

      ctx.strokeStyle = '#00E676';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bosX1, bosY);
      ctx.lineTo(bosX2, bosY);
      ctx.stroke();

      ctx.fillStyle = '#00E676';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('BOS ↗', bosX2 - 25, bosY - 4);
    }

    // ----------------------------------------------------
    // INDICATOR LAYER 4: ELLIOTT WAVE 1-2-3-4-5
    // ----------------------------------------------------
    if (layers.waves && candles.length > 40) {
      const wavePoints = [
        { idx: 6,  type: '0', price: candles[6].low },
        { idx: 15, type: '1', price: candles[15].high },
        { idx: 22, type: '2', price: candles[22].low },
        { idx: 35, type: '3', price: candles[35].high },
        { idx: 42, type: '4', price: candles[42].low },
        { idx: 50, type: '5', price: candles[50].high },
      ];

      ctx.strokeStyle = '#FFD166';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      wavePoints.forEach((pt, i) => {
        const x = pt.idx * barSpacing + barSpacing / 2;
        const y = getY(pt.price);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Node circles with wave numbers
      wavePoints.forEach(pt => {
        const x = pt.idx * barSpacing + barSpacing / 2;
        const y = getY(pt.price);

        ctx.fillStyle = '#050B0F';
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFD166';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#FFD166';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pt.type, x, y + 3);
        ctx.textAlign = 'left';
      });
    }

    // ----------------------------------------------------
    // CROSSHAIR & HOVER HUD
    // ----------------------------------------------------
    if (isHovering && mousePos.x >= 0 && mousePos.x <= chartWidth) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, paddingTop);
      ctx.lineTo(mousePos.x, height - paddingBottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag on Right Axis
      const hoverPrice = scaleMax - ((mousePos.y - paddingTop) / chartHeight) * scaleRange;
      const config = assetConfigs[asset];

      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(chartWidth + 2, mousePos.y - 9, paddingRight - 4, 18);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText(hoverPrice.toFixed(config.decimals), chartWidth + 6, mousePos.y + 3);
    }
  }

  // Real-time ticking simulation
  function tickLivePrice() {
    if (candles.length === 0) return;
    const last = candles[candles.length - 1];
    const config = assetConfigs[asset];
    const delta = (Math.random() - 0.48) * (config.pipSize * 2.5);

    last.close += delta;
    if (last.close > last.high) last.high = last.close;
    if (last.close < last.low) last.low = last.close;

    // Update Telemetry Header
    const telBadge = document.getElementById('live-chart-price');
    if (telBadge) {
      telBadge.textContent = `${config.unit}${last.close.toFixed(config.decimals)}`;
      telBadge.style.color = delta >= 0 ? '#00E676' : '#FF2A55';
    }

    renderChart();
  }

  setInterval(tickLivePrice, 1400);

  // Mouse Crosshair Handlers
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
    isHovering = true;

    const chartWidth = rect.width - 65;
    const barSpacing = chartWidth / candles.length;
    hoverIndex = Math.floor(mousePos.x / barSpacing);

    if (hoverIndex >= 0 && hoverIndex < candles.length) {
      const c = candles[hoverIndex];
      const config = assetConfigs[asset];
      const hudO = document.getElementById('hud-open');
      const hudH = document.getElementById('hud-high');
      const hudL = document.getElementById('hud-low');
      const hudC = document.getElementById('hud-close');
      if (hudO) hudO.textContent = c.open.toFixed(config.decimals);
      if (hudH) hudH.textContent = c.high.toFixed(config.decimals);
      if (hudL) hudL.textContent = c.low.toFixed(config.decimals);
      if (hudC) hudC.textContent = c.close.toFixed(config.decimals);
    }

    renderChart();
  });

  canvas.addEventListener('mouseleave', () => {
    isHovering = false;
    renderChart();
  });

  // Asset Switcher Buttons
  document.querySelectorAll('.asset-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.asset-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      asset = btn.dataset.asset;
      generateCandleData();
      renderChart();
    });
  });

  // Timeframe Switcher
  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      timeframe = btn.dataset.tf;
      generateCandleData();
      renderChart();
    });
  });

  // Indicator Layer Toggles
  document.querySelectorAll('.layer-toggle input').forEach(input => {
    input.addEventListener('change', (e) => {
      const layerKey = e.target.dataset.layer;
      layers[layerKey] = e.target.checked;
      renderChart();
    });
  });

  window.addEventListener('resize', resizeCanvas);
  generateCandleData();
  resizeCanvas();
}

/* ==========================================================================
   3. PIP & POSITION RISK CALCULATOR
   ========================================================================== */
function initRiskCalculator() {
  const balanceInput = document.getElementById('calc-balance');
  const riskPctInput = document.getElementById('calc-risk-pct');
  const stopLossInput = document.getElementById('calc-sl-pips');
  const pairSelect = document.getElementById('calc-pair');

  const outRiskAmount = document.getElementById('res-risk-amt');
  const outLotSize = document.getElementById('res-lot-size');
  const outPipValue = document.getElementById('res-pip-val');

  if (!balanceInput || !outLotSize) return;

  function calculate() {
    const balance = parseFloat(balanceInput.value) || 10000;
    const riskPct = parseFloat(riskPctInput.value) || 1.0;
    const slPips = parseFloat(stopLossInput.value) || 20;
    const pair = pairSelect ? pairSelect.value : 'XAUUSD';

    // Risk in USD
    const riskUSD = (balance * (riskPct / 100));

    // Standard Pip multipliers
    let pipMultiplier = 10; // For EURUSD / standard FX, 1 standard lot = $10 per pip
    if (pair === 'XAUUSD') {
      pipMultiplier = 10; // 1 lot gold = 100oz, $0.10 price move = $10
    } else if (pair === 'BTCUSD') {
      pipMultiplier = 1;
    } else if (pair === 'US30') {
      pipMultiplier = 5;
    }

    const totalLot = riskUSD / (slPips * pipMultiplier);
    const roundedLots = Math.max(0.01, Math.round(totalLot * 100) / 100);
    const estPipValue = roundedLots * pipMultiplier;

    outRiskAmount.textContent = `$${riskUSD.toFixed(2)}`;
    outLotSize.textContent = `${roundedLots.toFixed(2)} Lots`;
    outPipValue.textContent = `$${estPipValue.toFixed(2)} / pip`;
  }

  [balanceInput, riskPctInput, stopLossInput, pairSelect].forEach(el => {
    if (el) el.addEventListener('input', calculate);
  });

  calculate();
}

/* ==========================================================================
   4. INDICATOR MODAL SYSTEM (Real Pine Script Logic & Code Previews)
   ========================================================================== */
const indicatorDatabase = {
  lse: {
    title: "Liquidity Sweep Engine v2.0",
    subtitle: "Unified SMC + Adaptive Trend-Quality Trading System (Pine Script v6)",
    description: "Detects Buy Side Liquidity (BSL) and Sell Side Liquidity (SSL) pools across major and internal swing periods. Validates institutional stop-hunts using strict wick mitigation and real-time candle-close confirmation to prevent repainting.",
    features: [
      "Dynamic BSL & SSL pool tracking with customizable pivot periods",
      "Wick vs Close mitigation filter with ATR-adaptive tolerance",
      "Minor & Major Market Structure breakdown (BOS / MSS / CHoCH)",
      "Webhook alerts structured for Bybit, MT4/MT5, and Tradovate bridges"
    ],
    pineSnippet: `//@version=6
indicator("Liquidity Sweep Engine", shorttitle = "LSE v2.0", overlay = true,
     max_boxes_count = 500, max_lines_count = 500, max_labels_count = 500)

// Market Structure Inputs
int extSwingLen = input.int(25, "External Swing Period", minval=5, maxval=100)
int intSwingLen = input.int(4, "Internal Swing Period", minval=2, maxval=20)
bool showLiq    = input.bool(true, "Show BSL/SSL Liquidity Levels")

// Liquidity Sweep Detection
var float bslPrice = na
var float sslPrice = na

// Calculate Swings
swingHigh = ta.pivothigh(high, extSwingLen, extSwingLen)
swingLow  = ta.pivotlow(low, extSwingLen, extSwingLen)

if not na(swingHigh)
    bslPrice := swingHigh
if not na(swingLow)
    sslPrice := swingLow

// Sweep Condition: High penetrates BSL but Close finishes back below
isBslSweep = high > bslPrice and close < bslPrice and not na(bslPrice)
if isBslSweep and barstate.isconfirmed
    label.new(bar_index, high, "⚡ SWEEP BSL", color=color.new(#00F0FF, 10), textcolor=color.black, style=label.style_label_down)`
  },

  xau: {
    title: "XAUUSD Liquidity-SMC Precision Desk",
    subtitle: "Multi-Timeframe Gold Order Flow & Institutional Kill Zones (Pine Script v6)",
    description: "Engineered specifically for Gold (XAU/USD) volatility characteristics. Maps Higher Timeframe (4H / 1H) liquidity pools into Lower Timeframe (5m / 15m) execution models with built-in Asian, London, and New York Kill Zone filters.",
    features: [
      "Auto HTF/LTF mapping (4H structural bias -> 5m liquidity execution)",
      "Gold ATR-calibrated sweep tolerance (0.12x ATR / $0.30 - $0.60 precision)",
      "Previous Daily High/Low (PDH/PDL) automated liquidity tags",
      "Kill Zone session background shading (London & NY overlap)"
    ],
    pineSnippet: `//@version=6
indicator("XAUUSD Liquidity-SMC Precision", overlay = true, max_boxes_count = 500)

// HTF & Session Settings
grp_tf = "Timeframe Settings"
in_auto_tf = input.bool(true, "Auto HTF/LTF Mapping", group=grp_tf)
in_custom_htf = input.timeframe("240", "Custom HTF", group=grp_tf)

// Kill Zone Timers (IST / UTC configurable)
in_sess_lon = input.session("1330-1630", "London Kill Zone", group="Sessions")
in_sess_ny  = input.session("1800-2230", "New York Session", group="Sessions")

// Gold-Calibrated Sweep Tolerance
in_sweep_tol = input.float(0.12, "Sweep Tolerance (ATR Mult)", minval=0.01)`
  },

  ew: {
    title: "Elliott Wave Rule Checker [Fixed]",
    subtitle: "Zero-Repaint ZigZag Impulse & FVG Confluence Engine (Pine Script v6)",
    description: "Automated Elliott Wave validator enforcing the 3 Golden Rules as a hard validity gate (Wave 3 never shortest, Wave 2 no 100% retrace, Wave 4 no overlap with Wave 1). Incorporates Fair Value Gap confluence in Wave 2 & 4 retracements.",
    features: [
      "Zero-Repaint Protection: Strict candle-close execution toggle",
      "3 Hard Golden Rules validation gate + soft quality scoring",
      "FVG Institutional confluence inside Wave 2 and Wave 4 reloads",
      "Pessimistic dual-touch TP/SL resolution eliminates survivorship bias"
    ],
    pineSnippet: `//@version=6
indicator("Elliott Wave Rule Checker [Fixed]", overlay = true, max_boxes_count = 500)

// Hard Validity Gates
// Rule 1: Wave 3 must not be the shortest of waves 1, 3, and 5
// Rule 2: Wave 2 cannot retrace more than 100% of Wave 1
// Rule 3: Wave 4 cannot overlap with the price territory of Wave 1

bool rule1Valid = wave3Len >= wave1Len or wave3Len >= wave5Len
bool rule2Valid = wave2Low > wave1Start
bool rule4Valid = wave4Low > wave1High

if rule1Valid and rule2Valid and rule4Valid and barstate.isconfirmed
    // Render Validated 1-2-3-4-5 Impulse Structure
    line.new(w1_x, w1_y, w2_x, w2_y, color=#00F0FF, width=2)`
  },

  prm: {
    title: "Phantom Reversal Model [3:30 AM]",
    subtitle: "Time Theory & Standard Deviation Manipulation Expansion (Pine Script v5/v6)",
    description: "Captures early-session market manipulations during the Sydney/Asian window. Tracks displacement bars and standard deviation price projections to capture high-probability institutional reversals.",
    features: [
      "Time Theory: Specific 03:30 - 05:30 algorithmic expansion window",
      "Standard Deviation projection bands (2.0 - 2.5 SD manipulation zones)",
      "Displacement candle validator with dynamic ATR thresholding",
      "Built-in risk-reward HUD and entry trigger markers"
    ],
    pineSnippet: `//@version=5
indicator("Phantom Reversal Model [3:30 AM]", shorttitle="PRM 3:30", overlay=true)

tz = input.string("GMT+5:30", "Timezone")
sydneySess = input.session("0330-0530", "Sydney Window")
showManip  = input.bool(true, "Show Manipulation Range")

inSession = not na(time(timeframe.period, sydneySess, tz))
var float manipHigh = na
var float manipLow = na

if inSession
    manipHigh := math.max(nz(manipHigh, high), high)
    manipLow  := math.min(nz(manipLow, low), low)`
  }
};

function initIndicatorModals() {
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalSub = document.getElementById('modal-sub');
  const modalDesc = document.getElementById('modal-desc');
  const modalFeatures = document.getElementById('modal-features');
  const modalCode = document.getElementById('modal-code');
  const copyBtn = document.getElementById('modal-copy-btn');

  if (!backdrop) return;

  function openModal(id) {
    const data = indicatorDatabase[id];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalSub.textContent = data.subtitle;
    modalDesc.textContent = data.description;

    modalFeatures.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
    modalCode.textContent = data.pineSnippet;

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.open-indicator-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.indicator;
      openModal(id);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeModal();
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(modalCode.textContent).then(() => {
        copyBtn.textContent = 'COPIED TO CLIPBOARD ✓';
        copyBtn.style.color = '#00E676';
        setTimeout(() => {
          copyBtn.textContent = 'COPY CODE';
          copyBtn.style.color = '';
        }, 2200);
      });
    });
  }
}

/* ==========================================================================
   5. NAVIGATION & SCROLL POLISH
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  const toggle = document.querySelector('.mobile-nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isVisible = menu.style.display === 'flex';
      menu.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        menu.style.flexDirection = 'column';
        menu.style.position = 'absolute';
        menu.style.top = '72px';
        menu.style.left = '0';
        menu.style.right = '0';
        menu.style.background = '#04080B';
        menu.style.padding = '1.5rem';
        menu.style.borderBottom = '1px solid rgba(0, 240, 255, 0.2)';
      }
    });
  }
}

/* ==========================================================================
   6. CONTACT FORM FEEDBACK
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-terminal-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    btn.innerHTML = 'TRANSMITTING TELEMETRY...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = 'SIGNAL TRANSMITTED ✓';
      btn.style.background = '#00E676';
      btn.style.color = '#000000';
      form.reset();

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 3500);
    }, 1200);
  });
}
