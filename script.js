function switchTab(id, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('panel-' + id).classList.add('active');
}

function toSup(n) {
  const map = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','.' : '˙'};
  return String(n).split('').map(c => map[c]||c).join('');
}

// ─── ALGEBRAIC DERIVATIVE FUNCTIONS ───────────────────────────
function calcDerivative() {
  const c = parseFloat(document.getElementById('d-coeff').value);
  const e = parseFloat(document.getElementById('d-exp').value);
  if (isNaN(c) || isNaN(e)) { 
    document.getElementById('d-result').innerHTML = '<span class="label">Result</span>Please enter valid numbers.'; 
    return; 
  }
  const nc = c * e;
  const ne = e - 1;
  let result = ne === 0 ? nc + '' : ne === 1 ? nc + 'x' : nc + 'x' + toSup(ne);
  document.getElementById('d-result').innerHTML = '<span class="label">Result</span>f′(x) = ' + result;
  document.getElementById('d-steps').innerHTML = `
    <div class="step"><span class="step-num">1</span>Identify: f(x) = ${c}x${toSup(e)} <span class="badge">coeff=${c}, exp=${e}</span></div>
    <div class="step"><span class="step-num">2</span>Multiply exponent × coefficient → ${e} × ${c} = ${nc}</div>
    <div class="step"><span class="step-num">3</span>Decrease exponent by 1 → ${e} − 1 = ${ne}</div>
    <div class="step"><span class="step-num">4</span>Result: f′(x) = ${result} ✓</div>`;
}

function calcTangentLine() {
  const c = parseFloat(document.getElementById('d-coeff').value);
  const e = parseFloat(document.getElementById('d-exp').value);
  const x0 = parseFloat(document.getElementById('tan-x0').value);
  
  if ([c, e, x0].some(isNaN)) {
    document.getElementById('tan-result').innerHTML = '<span class="label">Error</span>Ensure both derivative function parameters and point x₀ are specified.';
    return;
  }
  const y0 = c * Math.pow(x0, e);
  const m = c * e * Math.pow(x0, e - 1);
  const b = y0 - (m * x0);
  const sign = b >= 0 ? '+ ' + b.toFixed(2) : '- ' + Math.abs(b).toFixed(2);
  
  document.getElementById('tan-result').innerHTML = `
    <span class="label">Tangent Line Result</span>
    <strong>At point:</strong> (${x0}, ${y0.toFixed(2)})<br>
    <strong>Instantaneous Slope (m):</strong> ${m.toFixed(2)}<br>
    <strong>Equation:</strong> y = ${m.toFixed(2)}x ${sign}`;
}

// ─── INTEGRAL AND RIEMANN CALCULATIONS ────────────────────────
function calcIntegral() {
  const c = parseFloat(document.getElementById('i-coeff').value);
  const e = parseFloat(document.getElementById('i-exp').value);
  if (isNaN(c)||isNaN(e)) { 
    document.getElementById('i-result').innerHTML='<span class="label">Result</span>Enter valid numbers.'; 
    return; 
  }
  if (e === -1) {
    document.getElementById('i-result').innerHTML = '<span class="label">Result (indefinite)</span>∫ ' + c + 'x⁻¹ dx = ' + c + ' ln|x| + C';
    return;
  }
  const ne = e+1, nc = c/ne;
  const niceFrac = (c % ne === 0) ? (c/ne)+'' : c+'/'+ne;
  const result = (Math.abs(nc-Math.round(nc))<0.0001 ? Math.round(nc) : niceFrac)+'x'+toSup(ne)+' + C';
  document.getElementById('i-result').innerHTML = '<span class="label">Result (indefinite)</span>∫ '+c+'x'+toSup(e)+' dx = '+result;
}

function calcDefinite() {
  const c = parseFloat(document.getElementById('i-coeff').value);
  const e = parseFloat(document.getElementById('i-exp').value);
  const a = parseFloat(document.getElementById('def-a').value);
  const b = parseFloat(document.getElementById('def-b').value);
  const n = parseInt(document.getElementById('riemann-n').value);
  const method = document.getElementById('riemann-method').value;

  if ([c,e,a,b,n].some(isNaN)) { 
    document.getElementById('def-result').innerHTML='<span class="label">Error</span>Fill coefficient, exponent, bounds (a,b).'; 
    return; 
  }

  // Exact Analytical Solution Calculation
  let exactStr = "";
  if(e === -1) {
    exactStr = (c * (Math.log(Math.abs(b)) - Math.log(Math.abs(a)))).toFixed(6);
  } else {
    const ne = e + 1;
    exactStr = ((c/ne)*(Math.pow(b,ne)-Math.pow(a,ne))).toFixed(6);
  }

  // Riemann Numerical Approximation Implementation
  const dx = (b - a) / n;
  let riemannSum = 0;

  for (let i = 0; i < n; i++) {
    let evalX = a;
    if (method === 'left') evalX = a + i * dx;
    else if (method === 'right') evalX = a + (i + 1) * dx;
    else if (method === 'midpoint') evalX = a + (i + 0.5) * dx;

    const fX = c * Math.pow(evalX, e);
    riemannSum += fX * dx;
  }

  document.getElementById('def-result').innerHTML = `
    <span class="label">Analytical vs Numerical Approximation Comparison</span>
    <strong>Exact Fundamental Value:</strong> ${exactStr}<br>
    <strong>${method.toUpperCase()} Riemann Approximation (${n} splits):</strong> ${riemannSum.toFixed(6)}`;
}

// ─── LIMIT ENGINE SIMULATOR ────────────────────────────────────
function computeEngineLimit() {
  const type = document.getElementById('limit-expr-type').value;
  const target = parseFloat(document.getElementById('limit-target').value);
  if (isNaN(target)) {
    document.getElementById('engine-limit-result').innerText = "Provide a clean real number target.";
    return;
  }

  const f = (x) => {
    if (type === 'sin_x') return Math.sin(x) / x;
    if (type === 'indeterminate_hole') return (Math.pow(x,2) - 4) / (x - 2);
    if (type === 'exp_growth') return x / Math.exp(x);
    return 0;
  };

  // Sample locally very close to target value from the right and left sides
  const h1 = target + 0.00001;
  const h2 = target - 0.00001;
  const valLeft = f(h2);
  const valRight = f(h1);
  const limitAvg = (valLeft + valRight) / 2;

  if (Math.abs(valLeft - valRight) > 0.1) {
    document.getElementById('engine-limit-result').innerHTML = `<span class="label">Result Analysis</span>Limit Diverges / Does Not Exist (DNE) as Left and Right sided views mismatch.`;
  } else {
    document.getElementById('engine-limit-result').innerHTML = `
      <span class="label">Calculated Approximation Target</span>
      Left sided view (x → c⁻): ${valLeft.toFixed(5)}<br>
      Right sided view (x → c⁺): ${valRight.toFixed(5)}<br>
      <strong>Resolved Continuous Target:</strong> ${limitAvg.toFixed(5)}`;
  }
}

// ─── CANVAS GRAPH PLOTTING ENGINE (Desmos-Style) ───────────────
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('graph-tooltip');

let graphXMin = -5, graphXMax = 5;
let graphYMin = -5, graphYMax = 5;

function toScreenCoords(x, y) {
  const sx = ((x - graphXMin) / (graphXMax - graphXMin)) * canvas.width;
  const sy = canvas.height - ((y - graphYMin) / (graphYMax - graphYMin)) * canvas.height;
  return { x: sx, y: sy };
}

function toMathCoords(sx, sy) {
  const mx = graphXMin + (sx / canvas.width) * (graphXMax - graphXMin);
  const my = graphYMin + ((canvas.height - sy) / canvas.height) * (graphYMax - graphYMin);
  return { x: mx, y: my };
}

function evaluateGraphFn(x, type, c, n) {
  if (type === 'power') return c * Math.pow(x, n);
  if (type === 'sin') return c * Math.sin(x * n);
  if (type === 'exp') return c * Math.exp(x);
  return 0;
}

function evaluateGraphDeriv(x, type, c, n) {
  const h = 0.001;
  return (evaluateGraphFn(x + h, type, c, n) - evaluateGraphFn(x - h, type, c, n)) / (2 * h);
}

function updateGraph() {
  const type = document.getElementById('graph-fn').value;
  const c = parseFloat(document.getElementById('graph-c').value) || 1;
  const n = parseFloat(document.getElementById('graph-n').value) || 1;
  const showDeriv = document.getElementById('show-deriv').checked;
  const showTangent = document.getElementById('show-tangent').checked;
  const tXWrap = document.getElementById('tangent-x-wrap');
  
  if(showTangent) tXWrap.style.display = "flex";
  else tXWrap.style.display = "none";
  
  const tangentX = parseFloat(document.getElementById('tangent-x').value);
  document.getElementById('tangent-x-val').innerText = tangentX.toFixed(1);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Grid Lines
  ctx.strokeStyle = '#E2E0FA';
  ctx.lineWidth = 1;
  for (let i = graphXMin; i <= graphXMax; i++) {
    let pt = toScreenCoords(i, 0);
    ctx.beginPath(); ctx.moveTo(pt.x, 0); ctx.lineTo(pt.x, canvas.height); ctx.stroke();
  }
  for (let j = graphYMin; j <= graphYMax; j++) {
    let pt = toScreenCoords(0, j);
    ctx.beginPath(); ctx.moveTo(0, pt.y); ctx.lineTo(canvas.width, pt.y); ctx.stroke();
  }

  // Draw Primary Axes Axes
  ctx.strokeStyle = '#AFA9EC';
  ctx.lineWidth = 2;
  let origin = toScreenCoords(0, 0);
  ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(canvas.width, origin.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, canvas.height); ctx.stroke();

  // Plot Base Expression Function Curve
  ctx.beginPath();
  ctx.strokeStyle = '#3C3489';
  ctx.lineWidth = 2.5;
  let first = true;
  for (let sx = 0; sx < canvas.width; sx++) {
    let mx = toMathCoords(sx, 0).x;
    let my = evaluateGraphFn(mx, type, c, n);
    let sCoords = toScreenCoords(mx, my);
    if (sCoords.y >= 0 && sCoords.y <= canvas.height) {
      if (first) { ctx.moveTo(sCoords.x, sCoords.y); first = false; }
      else ctx.lineTo(sCoords.x, sCoords.y);
    }
  }
  ctx.stroke();

  // Plot Numerical Derivative Component Line
  if (showDeriv) {
    ctx.beginPath();
    ctx.strokeStyle = '#7F77DD';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    let firstD = true;
    for (let sx = 0; sx < canvas.width; sx++) {
      let mx = toMathCoords(sx, 0).x;
      let my = evaluateGraphDeriv(mx, type, c, n);
      let sCoords = toScreenCoords(mx, my);
      if (sCoords.y >= 0 && sCoords.y <= canvas.height) {
        if (firstD) { ctx.moveTo(sCoords.x, sCoords.y); firstD = false; }
        else ctx.lineTo(sCoords.x, sCoords.y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Plot Tangent Line Configuration
  if (showTangent) {
    let tanY = evaluateGraphFn(tangentX, type, c, n);
    let m = evaluateGraphDeriv(tangentX, type, c, n);
    
    ctx.beginPath();
    ctx.strokeStyle = '#639922';
    ctx.lineWidth = 2;
    
    let xStart = graphXMin;
    let yStart = tanY + m * (xStart - tangentX);
    let xEnd = graphXMax;
    let yEnd = tanY + m * (xEnd - tangentX);
    
    let pStart = toScreenCoords(xStart, yStart);
    let pEnd = toScreenCoords(xEnd, yEnd);
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pEnd.x, pEnd.y);
    ctx.stroke();

    // Plot Point Point Node on Line
    let pCenter = toScreenCoords(tangentX, tanY);
    ctx.beginPath();
    ctx.fillStyle = '#27500A';
    ctx.arc(pCenter.x, pCenter.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
}

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const mathPt = toMathCoords(sx, sy);

  const type = document.getElementById('graph-fn').value;
  const c = parseFloat(document.getElementById('graph-c').value) || 1;
  const n = parseFloat(document.getElementById('graph-n').value) || 1;
  
  const realY = evaluateGraphFn(mathPt.x, type, c, n);
  const dCoords = toScreenCoords(mathPt.x, realY);

  if (Math.abs(sy - dCoords.y) < 20) {
    tooltip.style.display = 'block';
    tooltip.style.left = (sx + 15) + 'px';
    tooltip.style.top = (sy - 25) + 'px';
    tooltip.innerText = `X: ${mathPt.x.toFixed(2)}, Y: ${realY.toFixed(2)}`;
  } else {
    tooltip.style.display = 'none';
  }
});

canvas.addEventListener('mouseleave', () => tooltip.style.display = 'none');
window.addEventListener('load', updateGraph);


// ─── LIMITS DATA & RENDERING ───────────────────────────────────
const limitsData = {
  basic: {
    label: '📘 Basic Limits',
    items: [
      { title: 'Constant Limit', formula: 'lim x→a [c] = c', example: 'lim x→5 [7] = 7', note: 'A constant stays constant regardless of x.' },
      { title: 'Identity Limit', formula: 'lim x→a [x] = a', example: 'lim x→3 [x] = 3', note: 'Direct substitution for simple x.' },
      { title: 'Polynomial', formula: 'lim x→a p(x) = p(a)', example: 'lim x→2 (x²+1) = 5', note: 'Substitute directly for polynomials.' },
      { title: 'Rational Function', formula: 'lim x→a f(x)/g(x) = f(a)/g(a)', example: 'if g(a) ≠ 0', note: 'Direct substitution when denominator ≠ 0.' },
      { title: 'Sum Rule', formula: 'lim [f+g] = lim f + lim g', example: 'lim(x²+x) = lim x² + lim x', note: 'Limits distribute over addition.' },
      { title: 'Product Rule', formula: 'lim [f·g] = lim f · lim g', example: 'lim x·sin x = lim x · lim sin x', note: 'Limits distribute over multiplication.' },
      { title: 'Quotient Rule', formula: 'lim [f/g] = lim f / lim g', example: 'provided lim g ≠ 0', note: 'Limits distribute over division if denominator ≠ 0.' },
      { title: 'Power Rule', formula: 'lim [f(x)]ⁿ = [lim f(x)]ⁿ', example: 'lim (x+1)³ = (lim x+1)³', note: 'Limits distribute through integer powers.' },
      { title: 'Squeeze Theorem', formula: 'g≤f≤h & lim g=lim h=L ⟹ lim f=L', example: 'Used for lim x·sin(1/x)=0', note: 'Sandwich f between two limits.' },
    ]
  },
  trig: {
    label: '📐 Trigonometric Limits',
    items: [
      { title: 'Fundamental Trig Limit', formula: 'lim x→0 sin(x)/x = 1', example: 'lim x→0 sin(3x)/3x = 1', note: 'Most important trig limit. x must be in radians.' },
      { title: 'Cosine Limit', formula: 'lim x→0 (1−cos x)/x = 0', example: 'Proof: multiply by (1+cos x)/(1+cos x)', note: 'Second fundamental trig limit.' },
      { title: 'Tangent Limit', formula: 'lim x→0 tan(x)/x = 1', example: 'Follows from sin/cos and sin(x)/x=1', note: 'Since cos(0)=1.' },
      { title: 'sin at infinity', formula: 'lim x→∞ sin(x)/x = 0', example: 'sin x bounded, 1/x→0', note: 'Squeeze: −1/x ≤ sin x/x ≤ 1/x.' },
      { title: 'lim sin(ax)/bx', formula: 'lim x→0 sin(ax)/(bx) = a/b', example: 'lim sin(2x)/5x = 2/5', note: 'Scale using the fundamental limit.' },
      { title: 'lim sin(ax)/sin(bx)', formula: 'lim x→0 sin(ax)/sin(bx) = a/b', example: 'lim sin(3x)/sin(x) = 3', note: 'Both approach 0, use ratio of rates.' },
      { title: 'Trig at π/2', formula: 'lim x→π/2 cos x/(π/2−x) = 1', example: 'Substitution t=π/2−x', note: 'Converts to sin(t)/t form.' },
      { title: 'Inverse Trig', formula: 'lim x→0 arcsin(x)/x = 1', example: 'lim x→0 arctan(x)/x = 1', note: 'Small angle approximations for inverse trig.' },
    ]
  },
  exp: {
    label: '🔢 Exponential & Logarithm Limits',
    items: [
      { title: "Euler's Number", formula: 'lim x→∞ (1+1/x)ˣ = e', example: 'e ≈ 2.71828...', note: 'The definition of e via limits.' },
      { title: "Euler's (general form)", formula: 'lim x→∞ (1+a/x)ˣ = eᵃ', example: 'lim(1+2/x)ˣ = e²', note: 'Generalization of e definition.' },
      { title: 'eˣ at 0', formula: 'lim x→0 (eˣ−1)/x = 1', example: 'Derivative of eˣ at x=0', note: 'Fundamental exponential limit.' },
      { title: 'aˣ at 0', formula: 'lim x→0 (aˣ−1)/x = ln a', example: 'lim(2ˣ−1)/x = ln 2', note: 'Generalization with base a.' },
      { title: 'ln at 0', formula: 'lim x→0 ln(1+x)/x = 1', example: 'Taylor: ln(1+x)≈x for small x', note: 'First-order approximation.' },
      { title: 'ln at ∞', formula: 'lim x→∞ ln(x)/x = 0', example: 'Logarithm grows slower than linear', note: 'By L\'Hôpital: (1/x)/1 → 0.' },
      { title: 'Exponential dominates', formula: 'lim x→∞ xⁿ/eˣ = 0', example: 'lim x²/eˣ = 0', note: 'eˣ grows faster than any polynomial.' },
      { title: 'ln at 0⁺', formula: 'lim x→0⁺ ln(x) = −∞', example: 'log curve goes down near x=0', note: 'One-sided limit from the right.' },
      { title: 'x·ln(x) at 0⁺', formula: 'lim x→0⁺ x·ln(x) = 0', example: 'By L\'Hôpital on ln(x)/(1/x)', note: 'Indeterminate 0·∞ form.' },
    ]
  },
  inf: {
    label: '♾️ Limits at Infinity',
    items: [
      { title: '1/x at infinity', formula: 'lim x→∞ 1/x = 0', example: 'Horizontal asymptote y=0', note: 'Fundamental infinity limit.' },
      { title: 'Polynomial ratio', formula: 'lim x→∞ (aₙxⁿ+...)/(bₙxⁿ+...) = aₙ/bₙ', example: 'lim(3x²+x)/(2x²−1) = 3/2', note: 'Divide by highest power of x.' },
      { title: 'Lower degree wins', formula: 'lim x→∞ p(x)/q(x) = 0 if deg(p)<deg(q)', example: 'lim x/(x²+1) = 0', note: 'Numerator grows slower.' },
      { title: 'Higher degree diverges', formula: 'lim x→∞ p(x)/q(x) = ±∞ if deg(p)>deg(q)', example: 'lim x³/x = lim x² = ∞', note: 'Numerator dominates.' },
      { title: 'Infinity arithmetic', formula: 'lim x→∞ (√(x²+1)−x)', example: '= lim 1/(√(x²+1)+x) = 0', note: 'Multiply by conjugate to resolve ∞−∞.' },
      { title: 'Rational at −∞', formula: 'lim x→−∞ 1/x = 0', example: 'Same result from negative direction', note: 'Both ±∞ give same result for 1/x.' },
      { title: 'sin/cos at ∞', formula: 'lim x→∞ sin(x) = DNE', example: 'Oscillates, no single value', note: 'Limit does not exist (DNE) for oscillating functions.' },
      { title: 'Horizontal asymptote', formula: 'y = L if lim x→±∞ f(x) = L', example: 'lim x→∞ 1/(x+1) = 0 → y=0', note: 'Horizontal asymptotes found via infinity limits.' },
    ]
  },
  hopital: {
    label: "⚖️ L'Hôpital's Rule",
    items: [
      { title: "L'Hôpital — 0/0 form", formula: 'lim f/g [0/0] = lim f′/g′', example: 'lim x→0 sin x/x = lim cos x/1 = 1', note: "Differentiate top and bottom separately, NOT the quotient rule." },
      { title: "L'Hôpital — ∞/∞ form", formula: 'lim f/g [∞/∞] = lim f′/g′', example: 'lim x→∞ ln x/x = lim (1/x)/1 = 0', note: "Same rule applies for ∞/∞ indeterminate form." },
      { title: '0·∞ form', formula: 'Rewrite: f·g = f/(1/g) or g/(1/f)', example: 'lim x→0⁺ x·ln x = lim ln x/(1/x)', note: 'Convert to fraction, then apply rule.' },
      { title: '∞−∞ form', formula: 'Combine into single fraction first', example: 'lim(1/x − 1/sin x) → combine', note: 'Find common denominator, then apply rule.' },
      { title: '0⁰ form', formula: 'Take ln: lim ln(fᵍ) = lim g·ln f', example: 'lim x→0⁺ xˣ → e^(lim x ln x) = e⁰ = 1', note: 'Logarithm converts power to product.' },
      { title: '1^∞ form', formula: 'lim (1+f)^(1/f) as f→0 = e', example: 'lim x→∞ (1+1/x)ˣ = e', note: 'Classic 1^∞ indeterminate.' },
      { title: '∞⁰ form', formula: 'Take ln: lim g·ln f where f→∞, g→0', example: 'lim x→∞ x^(1/x) = e^0 = 1', note: 'Logarithm + L\'Hôpital resolves it.' },
      { title: 'Repeated application', formula: 'Apply rule again if still indeterminate', example: 'lim x²/eˣ → 2x/eˣ → 2/eˣ = 0', note: "Apply L'Hôpital multiple times if needed." },
    ]
  },
  special: {
    label: '⭐ Special & Advanced Limits',
    items: [
      { title: 'Sandwich (Squeeze)', formula: 'g≤f≤h, lim g=lim h=L → lim f=L', example: 'lim x·sin(1/x)=0 (squeeze with ±x)', note: 'Trap f between two known limits.' },
      { title: 'One-sided limits', formula: 'lim x→a⁺ f(x) ≠ lim x→a⁻ f(x) → DNE', example: 'lim x→0 |x|/x: left=−1, right=1', note: 'Limit exists iff both sides agree.' },
      { title: 'Absolute value', formula: 'lim x→0 |x|/x = DNE', example: 'Left limit=−1, Right limit=1', note: 'Classic one-sided limit example.' },
      { title: 'Floor function', formula: 'lim x→n⁺ ⌊x⌋ = n, lim x→n⁻ ⌊x⌋ = n−1', example: 'lim x→2⁺ ⌊x⌋ = 2', note: 'Floor has jump discontinuities at integers.' },
      { title: 'Continuity criterion', formula: 'f continuous at a ⟺ lim x→a f(x) = f(a)', example: 'sin, cos, eˣ are continuous everywhere', note: 'Continuity = limit matches function value.' },
      { title: 'Infinite limit (vertical asymptote)', formula: 'lim x→a f(x) = ±∞', example: 'lim x→0 1/x² = +∞', note: 'Function blows up → vertical asymptote at x=a.' },
      { title: 'Composition limit', formula: 'lim f(g(x)) = f(lim g(x))', example: 'if f is continuous at lim g', note: 'Continuous functions commute with limits.' },
      { title: 'Derivative as a limit', formula: 'f′(a) = lim h→0 [f(a+h)−f(a)]/h', example: 'd/dx[x²] = lim(x+h)²−x²)/h = 2x', note: 'The definition of the derivative.' },
      { title: 'Integral as a limit', formula: '∫ₐᵇ f dx = lim n→∞ Σ f(xᵢ)Δx', example: 'Riemann sum definition', note: 'Area under curve as infinite sum.' },
    ]
  }
};

const allLimitCategories = ['basic','trig','exp','inf','hopital','special'];
let currentLimitCat = 'all';

function renderLimits() {
  const container = document.getElementById('limit-cards-container');
  const cats = currentLimitCat === 'all' ? allLimitCategories : [currentLimitCat];
  container.innerHTML = cats.map(cat => {
    const sec = limitsData[cat];
    const rows = sec.items.map(item => `
      <div style="border-bottom:1px solid #CECBF6;padding:.75rem 0;">
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
          <span style="font-size:13px;font-weight:600;color:#3C3489;min-width:170px">${item.title}</span>
          <code style="font-size:13px;color:#534AB7;background:#EEEDFE;padding:2px 7px;border-radius:5px;font-family:monospace">${item.formula}</code>
        </div>
        <div style="font-size:12px;color:#7F77DD;margin-top:3px"><strong>e.g.</strong> ${item.example}</div>
        <div style="font-size:12px;color:#888;margin-top:2px;font-style:italic">${item.note}</div>
      </div>`).join('');
    return `<div class="card" style="margin-bottom:.75rem"><h3>${sec.label}</h3>${rows}</div>`;
  }).join('');
}

function setLimitCat(cat, el) {
  currentLimitCat = cat;
  document.querySelectorAll('#panel-limits .cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderLimits();
}

renderLimits();

// ─── RULES DATA & RENDERING ────────────────────────────────────
const rulesData = {
  diff: {
    label: '🔵 Differentiation Rules',
    items: [
      { name: 'Power Rule', formula: 'd/dx[xⁿ] = n·xⁿ⁻¹', example: 'x⁵ → 5x⁴' },
      { name: 'Constant Rule', formula: 'd/dx[c] = 0', example: 'd/dx[9] = 0' },
      { name: 'Constant Multiple', formula: 'd/dx[c·f] = c·f′', example: 'd/dx[5x³] = 15x²' },
      { name: 'Sum / Difference', formula: 'd/dx[f±g] = f′±g′', example: 'd/dx[x²+x] = 2x+1' },
      { name: 'Product Rule', formula: '(fg)′ = f′g + fg′', example: 'd/dx[x·sin x] = sin x + x cos x' },
      { name: 'Quotient Rule', formula: '(f/g)′ = (f′g − fg′)/g²', example: 'd/dx[sin x/x]' },
      { name: 'Chain Rule', formula: 'd/dx[f(g(x))] = f′(g(x))·g′(x)', example: 'd/dx[sin(x²)] = 2x cos(x²)' },
      { name: 'Exponential eˣ', formula: 'd/dx[eˣ] = eˣ', example: 'd/dx[e³ˣ] = 3e³ˣ' },
      { name: 'Exponential aˣ', formula: 'd/dx[aˣ] = aˣ·ln a', example: 'd/dx[2ˣ] = 2ˣ·ln 2' },
      { name: 'Natural Log', formula: 'd/dx[ln x] = 1/x', example: 'd/dx[ln(x²)] = 2/x' },
      { name: 'Log base a', formula: 'd/dx[logₐx] = 1/(x·ln a)', example: 'd/dx[log₂x] = 1/(x ln 2)' },
      { name: 'Implicit Diff.', formula: 'Diff. both sides; treat y as f(x)', example: 'x²+y²=1 → 2x+2y·y′=0' },
      { name: 'Inverse Function', formula: '(f⁻¹)′(x) = 1/f′(f⁻¹(x))', example: '(arcsin)′=1/√(1−x²)' },
      { name: 'Logarithmic Diff.', formula: 'Take ln both sides, then differentiate', example: 'y=xˣ → ln y = x ln x → y′/y = 1+ln x' },
      { name: 'Parametric', formula: 'dy/dx = (dy/dt)/(dx/dt)', example: 'x=cos t, y=sin t → dy/dx = −cos t/sin t' },
    ]
  },
  integ: {
    label: '🟢 Integration Rules',
    items: [
      { name: 'Power Rule', formula: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C', example: '∫x³ dx = x⁴/4 + C (n≠−1)' },
      { name: 'Constant', formula: '∫c dx = cx + C', example: '∫7 dx = 7x + C' },
      { name: 'Constant Multiple', formula: '∫c·f dx = c·∫f dx', example: '∫5x² dx = 5·∫x² dx' },
      { name: 'Sum / Difference', formula: '∫(f±g) dx = ∫f dx ± ∫g dx', example: '∫(x²+x) dx = x³/3 + x²/2 + C' },
      { name: 'eˣ', formula: '∫eˣ dx = eˣ + C', example: '∫e²ˣ dx = e²ˣ/2 + C' },
      { name: 'aˣ', formula: '∫aˣ dx = aˣ/ln(a) + C', example: '∫2ˣ dx = 2ˣ/ln 2 + C' },
      { name: '1/x', formula: '∫1/x dx = ln|x| + C', example: '∫1/(2x) dx = ln|x|/2 + C' },
      { name: 'Integration by Parts', formula: '∫u dv = uv − ∫v du', example: '∫x·eˣ dx = x·eˣ − eˣ + C' },
      { name: 'u-Substitution', formula: '∫f(g(x))·g′(x)dx = ∫f(u)du', example: '∫2x(x²+1)⁵dx, u=x²+1' },
      { name: 'Partial Fractions', formula: 'Split rational into simpler fractions', example: '1/(x²−1) = 1/(2(x−1)) − 1/(2(x+1))' },
      { name: 'Definite Integral', formula: '∫ₐᵇ f dx = F(b) − F(a)', example: '∫₀¹ x² dx = 1/3' },
      { name: 'Trig Substitution', formula: 'For √(a²−x²): x=a sin θ', example: '√(1−x²): x=sin θ, dx=cos θ dθ' },
      { name: 'Improper Integral', formula: '∫₁^∞ 1/xᵖ dx = 1/(p−1) if p>1', example: '∫₁^∞ 1/x² dx = 1' },
      { name: 'Tabular (Repeated IBP)', formula: 'Use table for repeated by-parts', example: '∫x²·eˣ dx — 3 rounds of IBP' },
    ]
  },
  trig: {
    label: '📐 Trigonometric Derivatives & Integrals',
    items: [
      { name: 'd/dx[sin x]', formula: '= cos x', example: 'd/dx[sin 3x] = 3 cos 3x' },
      { name: 'd/dx[cos x]', formula: '= −sin x', example: 'd/dx[cos 2x] = −2 sin 2x' },
      { name: 'd/dx[tan x]', formula: '= sec²x', example: 'd/dx[tan x²] = 2x sec²(x²)' },
      { name: 'd/dx[cot x]', formula: '= −csc²x', example: 'd/dx[cot 5x] = −5 csc²(5x)' },
      { name: 'd/dx[sec x]', formula: '= sec x · tan x', example: 'd/dx[sec 2x] = 2 sec 2x tan 2x' },
      { name: 'd/dx[csc x]', formula: '= −csc x · cot x', example: 'd/dx[csc x²] = −2x csc x² cot x²' },
      { name: 'd/dx[arcsin x]', formula: '= 1/√(1−x²)', example: 'Domain: |x| < 1' },
      { name: 'd/dx[arccos x]', formula: '= −1/√(1−x²)', example: 'Domain: |x| < 1' },
      { name: 'd/dx[arctan x]', formula: '= 1/(1+x²)', example: 'd/dx[arctan 2x] = 2/(1+4x²)' },
      { name: '∫sin x dx', formula: '= −cos x + C', example: '∫sin 2x dx = −cos 2x/2 + C' },
      { name: '∫cos x dx', formula: '= sin x + C', example: '∫cos 3x dx = sin 3x/3 + C' },
      { name: '∫tan x dx', formula: '= ln|sec x| + C', example: '= −ln|cos x| + C' },
      { name: '∫cot x dx', formula: '= ln|sin x| + C', example: '' },
      { name: '∫sec x dx', formula: '= ln|sec x + tan x| + C', example: '' },
      { name: '∫csc x dx', formula: '= ln|csc x − cot x| + C', example: '' },
      { name: '∫sec²x dx', formula: '= tan x + C', example: '' },
      { name: '∫csc²x dx', formula: '= −cot x + C', example: '' },
      { name: '∫sec x tan x dx', formula: '= sec x + C', example: '' },
      { name: '∫1/√(1−x²) dx', formula: '= arcsin x + C', example: '' },
      { name: '∫1/(1+x²) dx', formula: '= arctan x + C', example: '' },
    ]
  },
  series: {
    label: '∑ Series & Taylor Expansions',
    items: [
      { name: 'Geometric Series', formula: 'Σ arⁿ = a/(1−r) for |r|<1', example: 'Σ (1/2)ⁿ = 2' },
      { name: 'Harmonic Series', formula: 'Σ 1/n = diverges', example: '1+1/2+1/3+... = ∞' },
      { name: 'p-series', formula: 'Σ 1/nᵖ converges if p>1', example: 'Σ 1/n² = π²/6' },
      { name: 'Taylor Series', formula: 'f(x) = Σ f⁽ⁿ⁾(a)/n! · (x−a)ⁿ', example: 'Centered at a' },
      { name: 'Maclaurin (a=0)', formula: 'f(x) = Σ f⁽ⁿ⁾(0)/n! · xⁿ', example: 'Special case of Taylor' },
      { name: 'eˣ expansion', formula: 'eˣ = 1 + x + x²/2! + x³/3! + ...', example: 'e¹ = 1+1+0.5+0.167+...' },
      { name: 'sin x expansion', formula: 'sin x = x − x³/3! + x⁵/5! − ...', example: 'Odd powers only' },
      { name: 'cos x expansion', formula: 'cos x = 1 − x²/2! + x⁴/4! − ...', example: 'Even powers only' },
      { name: 'ln(1+x)', formula: 'ln(1+x) = x − x²/2 + x³/3 − ...', example: 'Valid for |x|≤1, x≠−1' },
      { name: '1/(1−x)', formula: '= 1 + x + x² + x³ + ...', example: 'Valid for |x|<1' },
      { name: 'Ratio Test', formula: 'L = lim |aₙ₊₁/aₙ|; L<1 conv, L>1 div', example: 'Common convergence test' },
      { name: 'Root Test', formula: 'L = lim ⁿ√|aₙ|; L<1 conv, L>1 div', example: 'Good for nᵗʰ power terms' },
    ]
  },
  theorems: {
    label: '📜 Key Theorems',
    items: [
      { name: 'Fundamental Theorem (Part 1)', formula: 'd/dx[∫ₐˣ f(t)dt] = f(x)', example: 'Differentiation undoes integration', note: 'If f is continuous on [a,b]' },
      { name: 'Fundamental Theorem (Part 2)', formula: '∫ₐᵇ f dx = F(b) − F(a)', example: '∫₀² x dx = [x²/2]₀² = 2', note: 'F is any antiderivative of f' },
      { name: 'Mean Value Theorem (Diff.)', formula: '∃c∈(a,b): f′(c)=[f(b)−f(a)]/(b−a)', example: 'Average rate = instantaneous rate', note: 'f must be differentiable on (a,b)' },
      { name: 'Mean Value Theorem (Int.)', formula: '∃c∈(a,b): f(c)=1/(b−a)·∫ₐᵇ f dx', example: 'Average value of f on [a,b]', note: '' },
      { name: "Rolle's Theorem", formula: 'f(a)=f(b) ⟹ ∃c: f′(c)=0', example: 'f(0)=f(2)=0 → f′(c)=0 somewhere', note: 'Special case of MVT' },
      { name: "Intermediate Value Theorem", formula: 'f continuous, f(a)<k<f(b) ⟹ ∃c: f(c)=k', example: 'Proves root existence', note: '' },
      { name: "Extreme Value Theorem", formula: 'f continuous on [a,b] ⟹ has max & min', example: 'Always attains extremes on closed interval', note: '' },
      { name: "L'Hôpital's Theorem", formula: '0/0 or ∞/∞: lim f/g = lim f′/g′', example: 'lim sin x/x = lim cos x/1 = 1', note: '' },
      { name: "Squeeze Theorem", formula: 'g≤f≤h, lim g=lim h=L → lim f=L', example: 'lim x²sin(1/x)=0', note: '' },
      { name: "Chain Rule (Theorem)", formula: 'If g diff at x, f diff at g(x): (f∘g)′=f′(g)·g′', example: 'Composition differentiation', note: '' },
    ]
  }
};

const allRuleCategories = ['diff','integ','trig','series','theorems'];
let currentRuleCat = 'all';

function renderRules() {
  const container = document.getElementById('rule-cards-container');
  const cats = currentRuleCat === 'all' ? allRuleCategories : [currentRuleCat];
  container.innerHTML = cats.map(cat => {
    const sec = rulesData[cat];
    const rows = sec.items.map(item => `
      <div style="display:grid;grid-template-columns:170px 1fr;gap:6px 12px;padding:.6rem 0;border-bottom:1px solid #CECBF6;align-items:start">
        <div style="font-size:13px;font-weight:600;color:#3C3489">${item.name}</div>
        <div>
          <code style="font-size:13px;color:#534AB7;background:#EEEDFE;padding:2px 7px;border-radius:5px;font-family:monospace;display:inline-block">${item.formula}</code>
          ${item.example ? `<div style="font-size:12px;color:#7F77DD;margin-top:3px">${item.example}</div>` : ''}
          ${item.note ? `<div style="font-size:11px;color:#888;font-style:italic;margin-top:2px">${item.note}</div>` : ''}
        </div>
      </div>`).join('');
    return `<div class="card" style="margin-bottom:.75rem"><h3>${sec.label}</h3>${rows}</div>`;
  }).join('');
}

function setRuleCat(cat, el) {
  currentRuleCat = cat;
  document.querySelectorAll('#panel-rules .cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderRules();
}

renderRules();


// ─── GAMIFIED INTEGRATED QUIZ SYSTEM ───────────────────────────
const allQuestions = {
  derivatives: [
    { q: 'What is d/dx[x⁵]?', opts: ['5x⁴', 'x⁴', '5x⁵', '4x⁴'], ans: 0 },
    { q: 'What is d/dx[eˣ]?', opts: ['xeˣ⁻¹', 'eˣ', 'e', '1'], ans: 1 },
    { q: 'd/dx[ln x] = ?', opts: ['ln x', '1', '1/x', 'x'], ans: 2 },
    { q: 'What is d/dx[sin x]?', opts: ['−cos x', 'cos x', 'sin x', '−sin x'], ans: 1 },
    { q: 'What is d/dx[cos x]?', opts: ['sin x', 'cos x', '−sin x', '−cos x'], ans: 2 },
  ],
  integrals: [
    { q: '∫2x dx = ?', opts: ['x² + C', '2x + C', 'x²/2 + C', '2 + C'], ans: 0 },
    { q: '∫cos x dx = ?', opts: ['−sin x + C', 'sin x + C', 'cos x + C', 'tan x + C'], ans: 1 },
    { q: '∫xⁿ dx = ?', opts: ['xⁿ⁻¹/(n−1) + C', 'nxⁿ + C', 'xⁿ⁺¹/(n+1) + C', 'xⁿ + C'], ans: 2 },
  ],
  limits: [
    { q: 'lim x→0 of sin(x)/x = ?', opts: ['0', '∞', '1', 'undefined'], ans: 2 },
    { q: 'lim x→∞ of 1/x = ?', opts: ['1', '∞', '−1', '0'], ans: 3 },
    { q: 'lim x→∞ of (1+1/x)ˣ = ?', opts: ['1', '∞', 'e', '2'], ans: 2 },
  ],
  rules: [
    { q: 'The Power Rule states d/dx[xⁿ] = ?', opts: ['nxⁿ', 'xⁿ⁺¹', 'n·xⁿ⁻¹', '(n−1)xⁿ⁻¹'], ans: 2 },
    { q: 'Product Rule: (fg)′ = ?', opts: ['f′g′', 'f′g + fg′', 'fg′ − f′g', 'f′/g′'], ans: 1 },
  ]
};

let currentCategory = 'all';
let activeQuestions = [];
let qi = 0, correct = 0, total = 0;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setCategory(cat, el) {
  currentCategory = cat;
  document.querySelectorAll('#panel-quiz .cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const labels = { all: 'All Topics', derivatives: 'Derivatives', integrals: 'Integrals', limits: 'Limits', rules: 'Rules' };
  document.getElementById('quiz-category-label').textContent = labels[cat];
  startQuiz();
}

function startQuiz() {
  let pool = [];
  if (currentCategory === 'all') {
    Object.values(allQuestions).forEach(arr => pool.push(...arr));
  } else {
    pool = allQuestions[currentCategory] || [];
  }
  activeQuestions = shuffle(pool).slice(0, 5);
  qi = 0; correct = 0; total = 0;
  document.getElementById('score-num').textContent = '0/0';
  document.getElementById('score-fill').style.width = '0%';
  renderQuestion();
}

function renderQuestion() {
  const area = document.getElementById('question-area');
  if (qi >= activeQuestions.length) {
    const pct = Math.round((correct / activeQuestions.length) * 100);
    area.innerHTML = `
      <div style="text-align:center;padding:1rem 0">
        <div style="font-size:2rem;margin-bottom:.5rem">🏆</div>
        <div style="font-size:16px;font-weight:600;color:#3C3489;">Quiz complete!</div>
        <div style="font-size:14px;color:#534AB7;margin-bottom:1rem">Final Score: ${correct}/${activeQuestions.length} (${pct}%)</div>
        <button class="btn" onclick="startQuiz()">Restart ↺</button>
      </div>`;
    return;
  }
  const q = activeQuestions[qi];
  const shuffledOpts = q.opts.map((o, i) => ({ o, correct: i === q.ans }));
  
  area.innerHTML = `
    <div style="font-size:14px;font-weight:500;margin-bottom:.75rem;color:#26215C">${qi+1}/${activeQuestions.length}. ${q.q}</div>
    <div class="quiz-opt">${shuffledOpts.map(item =>
      `<button class="quiz-btn" onclick="answerQ(${item.correct},this)">${item.o}</button>`
    ).join('')}</div>`;
}

function answerQ(isCorrect, clickedBtn) {
  total++;
  document.querySelectorAll('.quiz-btn').forEach(b => {
    b.disabled = true;
    if (b.outerHTML.includes('true')) b.classList.add('correct');
  });
  if (!isCorrect) clickedBtn.classList.add('wrong');
  else correct++;
  
  document.getElementById('score-num').textContent = correct+'/'+total;
  document.getElementById('score-fill').style.width = Math.round((correct/total)*100)+'%';
  setTimeout(() => { qi++; renderQuestion(); }, 1000);
}

startQuiz();


