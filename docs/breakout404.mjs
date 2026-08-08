/* @3rg0n/breakout404-core v0.5.0 — https://github.com/3rg0n/breakout404 */
//#region src/theme.ts
var e = {
	background: "#0a0a0a",
	paddle: "#ffffff",
	ball: "#ffffff",
	blocks: [
		"#ff6b6b",
		"#feca57",
		"#48dbfb",
		"#ff9ff3",
		"#54a0ff"
	],
	text: "#ffffff",
	font: "monospace"
};
function t(t) {
	return {
		...e,
		...t
	};
}
function n(e, t) {
	return typeof e.blocks == "string" ? e.blocks : e.blocks[t % e.blocks.length];
}
//#endregion
//#region src/security.ts
var r = ["http:", "https:"], i = "http://localhost";
function a() {
	return typeof window < "u" && window.location?.href ? window.location.href : i;
}
function o(e, t) {
	if (e.startsWith("/")) return !0;
	try {
		let n = t ?? a(), i = new URL(e, n);
		return r.includes(i.protocol);
	} catch {
		return !1;
	}
}
//#endregion
//#region src/renderer.ts
function s(e, t, n, r, i, a) {
	let o = i, s = a;
	e.fillStyle = n.background, e.fillRect(0, 0, o, s), t.blocks.forEach((t) => {
		t.active && (e.fillStyle = t.color, e.fillRect(t.x, t.y, t.width, t.height));
	}), e.fillStyle = n.paddle, e.fillRect(t.paddle.x, t.paddle.y, t.paddle.width, t.paddle.height), e.fillStyle = n.ball, e.beginPath(), e.arc(t.ball.x, t.ball.y, t.ball.radius, 0, Math.PI * 2), e.fill(), r && (e.fillStyle = n.text, e.font = `16px ${n.font}`, e.textAlign = "left", e.fillText(`Score: ${t.score}`, 10, 25), e.textAlign = "right", e.fillText(`Lives: ${t.lives}`, o - 10, 25)), !t.started && !t.gameOver && (e.fillStyle = n.text, e.font = `20px ${n.font}`, e.textAlign = "center", e.fillText("Click or Press Space to Start", o / 2, s * .75)), t.gameOver && (e.fillStyle = n.text, e.font = `32px ${n.font}`, e.textAlign = "center", t.won ? (e.fillText("Page Found!", o / 2, s / 2), e.font = `18px ${n.font}`, e.fillText("You destroyed the 404!", o / 2, s / 2 + 35)) : (e.fillText("Game Over", o / 2, s / 2), e.font = `18px ${n.font}`, e.fillText("Click or Press Space to Restart", o / 2, s / 2 + 35)));
}
//#endregion
//#region src/blocks.ts
var c = {
	4: [
		[
			1,
			0,
			0,
			1,
			0
		],
		[
			1,
			0,
			0,
			1,
			0
		],
		[
			1,
			0,
			0,
			1,
			0
		],
		[
			1,
			1,
			1,
			1,
			1
		],
		[
			0,
			0,
			0,
			1,
			0
		],
		[
			0,
			0,
			0,
			1,
			0
		],
		[
			0,
			0,
			0,
			1,
			0
		]
	],
	0: [
		[
			0,
			1,
			1,
			1,
			0
		],
		[
			1,
			0,
			0,
			0,
			1
		],
		[
			1,
			0,
			0,
			0,
			1
		],
		[
			1,
			0,
			0,
			0,
			1
		],
		[
			1,
			0,
			0,
			0,
			1
		],
		[
			1,
			0,
			0,
			0,
			1
		],
		[
			0,
			1,
			1,
			1,
			0
		]
	]
};
function l(e, t, r) {
	let i = [], a = Math.floor(e * .6 / 19), o = a, s = (e - 19 * a) / 2, l = t * .1, u = [
		"4",
		"0",
		"4"
	], d = s;
	return u.forEach((e) => {
		c[e].forEach((e, t) => {
			e.forEach((e, s) => {
				e === 1 && i.push({
					x: d + s * a,
					y: l + t * o,
					width: a - 2,
					height: o - 2,
					active: !0,
					color: n(r, t)
				});
			});
		}), d += 7 * a;
	}), i;
}
function u(e, t, n, r) {
	if (!r.active) return !1;
	let i = Math.max(r.x, Math.min(e, r.x + r.width)), a = Math.max(r.y, Math.min(t, r.y + r.height)), o = e - i, s = t - a;
	return Math.sqrt(o * o + s * s) < n;
}
//#endregion
//#region src/engine.ts
var d = {
	easy: {
		ballSpeed: 4,
		paddleWidth: 120,
		lives: 5
	},
	medium: {
		ballSpeed: 6,
		paddleWidth: 100,
		lives: 3
	},
	hard: {
		ballSpeed: 8,
		paddleWidth: 80,
		lives: 2
	}
}, f = 4096, p = 1e3 / 60;
function m(e) {
	return e === "easy" || e === "medium" || e === "hard" ? e : "medium";
}
function h(e, t, n, r) {
	return {
		ball: {
			x: e / 2,
			y: t * .7,
			dx: n.ballSpeed * (Math.random() > .5 ? 1 : -1),
			dy: -n.ballSpeed,
			radius: 8
		},
		paddle: {
			x: e / 2 - n.paddleWidth / 2,
			y: t * .85,
			width: n.paddleWidth,
			height: 12
		},
		blocks: l(e, t, r),
		score: 0,
		lives: n.lives,
		gameOver: !1,
		won: !1,
		started: !1
	};
}
function g(e, t, n, r, i) {
	if (!e.started && !e.gameOver) return e.started = !0, { type: "started" };
	if (e.gameOver && !e.won) {
		let a = h(t, n, r, i);
		return e.ball = a.ball, e.paddle = a.paddle, e.blocks = a.blocks, e.score = a.score, e.lives = a.lives, e.gameOver = a.gameOver, e.won = a.won, e.started = !0, { type: "restarted" };
	}
	return null;
}
function _(e, t, n, r) {
	let i = [];
	if (!e.started || e.gameOver) return i;
	let { ball: a, paddle: o, blocks: s } = e;
	if (a.x += a.dx, a.y += a.dy, (a.x - a.radius <= 0 || a.x + a.radius >= n) && (a.dx = -a.dx, a.x = Math.max(a.radius, Math.min(a.x, n - a.radius))), a.y - a.radius <= 0 && (a.dy = -a.dy, a.y = a.radius), a.y + a.radius >= o.y && a.y - a.radius <= o.y + o.height && a.x >= o.x && a.x <= o.x + o.width) {
		let e = ((a.x - o.x) / o.width - .5) * Math.PI * .7, t = Math.sqrt(a.dx * a.dx + a.dy * a.dy);
		a.dx = t * Math.sin(e), a.dy = -Math.abs(t * Math.cos(e)), a.y = o.y - a.radius;
	}
	let c = !1, l = !1, d = v(s);
	return s.forEach((t) => {
		if (t.active && u(a.x, a.y, a.radius, t)) {
			if (t.active = !1, e.score += 10, d--, !c && !l) {
				let e = a.x + a.radius - t.x, n = t.x + t.width - (a.x - a.radius), r = a.y + a.radius - t.y, i = t.y + t.height - (a.y - a.radius);
				Math.min(e, n) < Math.min(r, i) ? c = !0 : l = !0;
			}
			i.push({
				type: "blockDestroyed",
				payload: { remaining: d }
			});
		}
	}), c && (a.dx = -a.dx), l && (a.dy = -a.dy), a.y - a.radius > r && (e.lives--, i.push({
		type: "lifeLost",
		payload: { livesRemaining: e.lives }
	}), e.lives <= 0 ? (e.gameOver = !0, e.won = !1, i.push({
		type: "gameOver",
		payload: { score: e.score }
	})) : (a.x = n / 2, a.y = r * .7, a.dx = t.ballSpeed * (Math.random() > .5 ? 1 : -1), a.dy = -t.ballSpeed, e.started = !1, i.push({ type: "ballReset" }))), s.every((e) => !e.active) && (e.gameOver = !0, e.won = !0, i.push({
		type: "gameWon",
		payload: { score: e.score }
	})), i;
}
function v(e) {
	return e.reduce((e, t) => t.active ? e + 1 : e, 0);
}
//#endregion
//#region src/game.ts
var y = {
	debug() {},
	info() {},
	warn() {},
	error() {}
}, b = 12, x = class {
	constructor(e, n = {}) {
		this.settings = d.medium, this.animationId = null, this.resizeObserver = null, this.lastFrameTime = 0, this.logicalWidth = 800, this.logicalHeight = 600, this.keys = {}, this.boundHandlePointerMove = this.handlePointerMove.bind(this), this.boundHandleKeydown = this.handleKeydown.bind(this), this.boundHandleKeyup = this.handleKeyup.bind(this), this.boundHandleStart = this.handleStart.bind(this), this.boundHandleResize = this.handleResize.bind(this), this.gameLoop = (e = 0) => {
			e - this.lastFrameTime >= 16.666666666666668 && (this.lastFrameTime = e, this.update(), s(this.ctx, this.state, this.theme, this.options.showScore ?? !0, this.logicalWidth, this.logicalHeight)), this.animationId = requestAnimationFrame(this.gameLoop);
		}, this.log = n.logger ?? y;
		let r = typeof e == "string" ? document.querySelector(e) : e;
		if (!r) {
			let t = /* @__PURE__ */ Error(`Container not found: ${e}`);
			throw this.log.error("Container not found", t, { container: String(e) }), t;
		}
		this.canvas = document.createElement("canvas"), this.canvas.style.display = "block", this.canvas.style.width = "100%", this.canvas.style.height = "100%", r.appendChild(this.canvas);
		let i = this.canvas.getContext("2d");
		if (!i) {
			let e = /* @__PURE__ */ Error("Could not get 2D context");
			throw this.log.error("Canvas 2D context unavailable", e), e;
		}
		this.ctx = i, this.options = n, this.theme = t(n.theme);
		let a = m(n.difficulty);
		this.settings = d[a], n.difficulty !== void 0 && n.difficulty !== a && this.log.warn("Invalid difficulty, defaulting to medium", { difficulty: n.difficulty }), n.redirectUrl && !o(n.redirectUrl) && (this.log.warn("Invalid redirectUrl rejected (only http:, https:, or relative paths allowed)", { redirectUrl: n.redirectUrl }), this.options = {
			...n,
			redirectUrl: void 0
		}), this.state = this.createInitialState(), this.resize(), this.setupEventListeners(), this.log.info("Game initialized", {
			difficulty: a,
			showScore: n.showScore ?? !0
		}), this.gameLoop();
	}
	createInitialState() {
		return h(this.logicalWidth, this.logicalHeight, this.settings, this.theme);
	}
	resize() {
		let e = this.canvas.parentElement?.getBoundingClientRect();
		if (!e) return;
		let t = window.devicePixelRatio || 1;
		if (this.logicalWidth = e.width, this.logicalHeight = e.height, this.canvas.width = Math.min(e.width * t, f), this.canvas.height = Math.min(e.height * t, f), this.ctx.setTransform(t, 0, 0, t, 0, 0), this.state) {
			let e = this.state.started, t = this.state.gameOver, n = this.state.won;
			this.state = this.createInitialState(), this.state.started = e, this.state.gameOver = t, this.state.won = n;
		}
	}
	setupEventListeners() {
		this.canvas.addEventListener("mousemove", this.boundHandlePointerMove), this.canvas.addEventListener("touchmove", this.boundHandlePointerMove, { passive: !1 }), window.addEventListener("keydown", this.boundHandleKeydown), window.addEventListener("keyup", this.boundHandleKeyup), this.canvas.addEventListener("click", this.boundHandleStart), this.canvas.addEventListener("touchstart", this.boundHandleStart), this.resizeObserver = new ResizeObserver(this.boundHandleResize), this.canvas.parentElement && this.resizeObserver.observe(this.canvas.parentElement);
	}
	handlePointerMove(e) {
		let t = this.canvas.getBoundingClientRect(), n = ("touches" in e ? e.touches[0].clientX : e.clientX) - t.left, r = t.width - this.state.paddle.width;
		this.state.paddle.x = Math.max(0, Math.min(n - this.state.paddle.width / 2, r));
	}
	handleKeydown(e) {
		this.keys[e.key] = !0, (e.key === " " || e.key === "Enter") && (e.preventDefault(), this.handleStart());
	}
	handleKeyup(e) {
		this.keys[e.key] = !1;
	}
	handleResize() {
		this.resize();
	}
	handleStart() {
		let e = g(this.state, this.logicalWidth, this.logicalHeight, this.settings, this.theme);
		e?.type === "started" ? this.log.info("Game started") : e?.type === "restarted" && this.log.info("Game restarted");
	}
	updatePaddleFromKeys() {
		let e = this.logicalWidth - this.state.paddle.width;
		(this.keys.ArrowLeft || this.keys.a || this.keys.A) && (this.state.paddle.x = Math.max(0, this.state.paddle.x - b)), (this.keys.ArrowRight || this.keys.d || this.keys.D) && (this.state.paddle.x = Math.min(e, this.state.paddle.x + b));
	}
	update() {
		if (!this.state.started || this.state.gameOver) return;
		this.updatePaddleFromKeys();
		let e = _(this.state, this.settings, this.logicalWidth, this.logicalHeight);
		this.handleGameEvents(e);
	}
	handleGameEvents(e) {
		for (let t of e) switch (t.type) {
			case "started":
				this.log.info("Game started");
				break;
			case "restarted":
				this.log.info("Game restarted");
				break;
			case "blockDestroyed":
				this.options.onBlockDestroyed?.(t.payload?.remaining);
				break;
			case "lifeLost":
				this.log.info("Life lost", { livesRemaining: t.payload?.livesRemaining });
				break;
			case "ballReset": break;
			case "gameOver":
				this.log.info("Game over", { score: t.payload?.score });
				break;
			case "gameWon":
				this.log.info("Game won", { score: t.payload?.score }), this.options.onComplete?.(), this.scheduleRedirect();
				break;
		}
	}
	scheduleRedirect() {
		if (!this.options.redirectUrl) return;
		this.log.info("Redirecting", { url: this.options.redirectUrl });
		let e = this.options.redirectDelay ?? 2e3, t = this.options.redirectUrl;
		setTimeout(() => {
			window.location.href = t;
		}, e);
	}
	destroy() {
		this.animationId &&= (cancelAnimationFrame(this.animationId), null), this.resizeObserver &&= (this.resizeObserver.disconnect(), null), this.canvas.removeEventListener("mousemove", this.boundHandlePointerMove), this.canvas.removeEventListener("touchmove", this.boundHandlePointerMove), this.canvas.removeEventListener("click", this.boundHandleStart), this.canvas.removeEventListener("touchstart", this.boundHandleStart), window.removeEventListener("keydown", this.boundHandleKeydown), window.removeEventListener("keyup", this.boundHandleKeyup), this.canvas.remove(), this.log.info("Game destroyed");
	}
	reset() {
		this.state = this.createInitialState(), this.keys = {}, this.log.info("Game reset");
	}
	updateOptions(e) {
		this.options = e, this.theme = t(e.theme);
		let n = m(e.difficulty);
		this.settings = d[n], e.difficulty !== void 0 && e.difficulty !== n && this.log.warn("Invalid difficulty, defaulting to medium", { difficulty: e.difficulty }), e.redirectUrl && !o(e.redirectUrl) && (this.log.warn("Invalid redirectUrl rejected (only http:, https:, or relative paths allowed)", { redirectUrl: e.redirectUrl }), this.options = {
			...e,
			redirectUrl: void 0
		}), this.state = this.createInitialState(), this.keys = {}, this.log.info("Options updated", {
			difficulty: n,
			showScore: e.showScore ?? !0
		});
	}
}, S = x;
//#endregion
export { x as Breakout404Game, d as DIFFICULTY_SETTINGS, f as MAX_CANVAS_DIM, p as TARGET_FRAME_MS, v as countActiveBlocks, h as createInitialState, S as default, e as defaultTheme, o as isValidRedirectUrl, t as mergeTheme, g as startOrRestart, _ as step };
