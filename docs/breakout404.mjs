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
//#region src/blocks.ts
var r = {
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
function i(e, t, i) {
	let a = [], o = Math.floor(e * .6 / 19), s = o, c = (e - 19 * o) / 2, l = t * .1, u = [
		"4",
		"0",
		"4"
	], d = c;
	return u.forEach((e) => {
		r[e].forEach((e, t) => {
			e.forEach((e, r) => {
				e === 1 && a.push({
					x: d + r * o,
					y: l + t * s,
					width: o - 2,
					height: s - 2,
					active: !0,
					color: n(i, t)
				});
			});
		}), d += 7 * o;
	}), a;
}
function a(e, t, n, r) {
	if (!r.active) return !1;
	let i = Math.max(r.x, Math.min(e, r.x + r.width)), a = Math.max(r.y, Math.min(t, r.y + r.height)), o = e - i, s = t - a;
	return Math.sqrt(o * o + s * s) < n;
}
//#endregion
//#region src/renderer.ts
function o(e, t, n, r, i, a) {
	let o = i, s = a;
	e.fillStyle = n.background, e.fillRect(0, 0, o, s), t.blocks.forEach((t) => {
		t.active && (e.fillStyle = t.color, e.fillRect(t.x, t.y, t.width, t.height));
	}), e.fillStyle = n.paddle, e.fillRect(t.paddle.x, t.paddle.y, t.paddle.width, t.paddle.height), e.fillStyle = n.ball, e.beginPath(), e.arc(t.ball.x, t.ball.y, t.ball.radius, 0, Math.PI * 2), e.fill(), r && (e.fillStyle = n.text, e.font = `16px ${n.font}`, e.textAlign = "left", e.fillText(`Score: ${t.score}`, 10, 25), e.textAlign = "right", e.fillText(`Lives: ${t.lives}`, o - 10, 25)), !t.started && !t.gameOver && (e.fillStyle = n.text, e.font = `20px ${n.font}`, e.textAlign = "center", e.fillText("Click or Press Space to Start", o / 2, s * .75)), t.gameOver && (e.fillStyle = n.text, e.font = `32px ${n.font}`, e.textAlign = "center", t.won ? (e.fillText("Page Found!", o / 2, s / 2), e.font = `18px ${n.font}`, e.fillText("You destroyed the 404!", o / 2, s / 2 + 35)) : (e.fillText("Game Over", o / 2, s / 2), e.font = `18px ${n.font}`, e.fillText("Click or Press Space to Restart", o / 2, s / 2 + 35)));
}
//#endregion
//#region src/security.ts
var s = ["http:", "https:"];
function c(e) {
	if (e.startsWith("/")) return !0;
	try {
		let t = new URL(e, window.location.href);
		return s.includes(t.protocol);
	} catch {
		return !1;
	}
}
//#endregion
//#region src/game.ts
var l = {
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
}, u = 4096, d = 1e3 / 60, f = {
	debug() {},
	info() {},
	warn() {},
	error() {}
}, p = class {
	constructor(e, n = {}) {
		this.animationId = null, this.resizeObserver = null, this.lastFrameTime = 0, this.logicalWidth = 800, this.logicalHeight = 600, this.gameLoop = (e = 0) => {
			e - this.lastFrameTime >= d && (this.lastFrameTime = e, this.update(), o(this.ctx, this.state, this.theme, this.options.showScore ?? !0, this.logicalWidth, this.logicalHeight)), this.animationId = requestAnimationFrame(this.gameLoop);
		}, this.log = n.logger ?? f;
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
		let a = n.difficulty || "medium";
		this.settings = l[a] ?? l.medium, l[a] || this.log.warn("Invalid difficulty, defaulting to medium", { difficulty: a }), n.redirectUrl && !c(n.redirectUrl) && (this.log.warn("Invalid redirectUrl rejected (only http:, https:, or relative paths allowed)", { redirectUrl: n.redirectUrl }), this.options = {
			...n,
			redirectUrl: void 0
		}), this.state = this.createInitialState(), this.resize(), this.setupEventListeners(), this.log.info("Game initialized", {
			difficulty: a,
			showScore: n.showScore ?? !0
		}), this.gameLoop();
	}
	createInitialState() {
		let e = this.logicalWidth, t = this.logicalHeight;
		return {
			ball: {
				x: e / 2,
				y: t * .7,
				dx: this.settings.ballSpeed * (Math.random() > .5 ? 1 : -1),
				dy: -this.settings.ballSpeed,
				radius: 8
			},
			paddle: {
				x: e / 2 - this.settings.paddleWidth / 2,
				y: t - 40,
				width: this.settings.paddleWidth,
				height: 12
			},
			blocks: i(e, t, this.theme),
			score: 0,
			lives: this.settings.lives,
			gameOver: !1,
			won: !1,
			started: !1
		};
	}
	resize() {
		let e = this.canvas.parentElement?.getBoundingClientRect();
		if (!e) return;
		let t = window.devicePixelRatio || 1;
		if (this.logicalWidth = e.width, this.logicalHeight = e.height, this.canvas.width = Math.min(e.width * t, u), this.canvas.height = Math.min(e.height * t, u), this.ctx.setTransform(t, 0, 0, t, 0, 0), this.state) {
			let e = this.state.started, t = this.state.gameOver;
			this.state = this.createInitialState(), this.state.started = e, this.state.gameOver = t;
		}
	}
	setupEventListeners() {
		let e = (e) => {
			let t = this.canvas.getBoundingClientRect(), n = ("touches" in e ? e.touches[0].clientX : e.clientX) - t.left, r = t.width - this.state.paddle.width;
			this.state.paddle.x = Math.max(0, Math.min(n - this.state.paddle.width / 2, r));
		};
		this.canvas.addEventListener("mousemove", e), this.canvas.addEventListener("touchmove", e);
		let t = {};
		window.addEventListener("keydown", (e) => {
			t[e.key] = !0, (e.key === " " || e.key === "Enter") && (e.preventDefault(), this.handleStart());
		}), window.addEventListener("keyup", (e) => {
			t[e.key] = !1;
		});
		let n = () => {
			let e = this.canvas.getBoundingClientRect().width - this.state.paddle.width;
			(t.ArrowLeft || t.a || t.A) && (this.state.paddle.x = Math.max(0, this.state.paddle.x - 12)), (t.ArrowRight || t.d || t.D) && (this.state.paddle.x = Math.min(e, this.state.paddle.x + 12)), requestAnimationFrame(n);
		};
		n(), this.canvas.addEventListener("click", () => this.handleStart()), this.canvas.addEventListener("touchstart", () => this.handleStart()), this.resizeObserver = new ResizeObserver(() => this.resize()), this.canvas.parentElement && this.resizeObserver.observe(this.canvas.parentElement);
	}
	handleStart() {
		!this.state.started && !this.state.gameOver ? (this.state.started = !0, this.log.info("Game started")) : this.state.gameOver && !this.state.won && (this.state = this.createInitialState(), this.state.started = !0, this.log.info("Game restarted"));
	}
	update() {
		if (!this.state.started || this.state.gameOver) return;
		let { ball: e, paddle: t, blocks: n } = this.state, r = this.canvas.getBoundingClientRect(), i = r.width, o = r.height;
		if (e.x += e.dx, e.y += e.dy, (e.x - e.radius <= 0 || e.x + e.radius >= i) && (e.dx = -e.dx, e.x = Math.max(e.radius, Math.min(e.x, i - e.radius))), e.y - e.radius <= 0 && (e.dy = -e.dy, e.y = e.radius), e.y + e.radius >= t.y && e.y - e.radius <= t.y + t.height && e.x >= t.x && e.x <= t.x + t.width) {
			let n = ((e.x - t.x) / t.width - .5) * Math.PI * .7, r = Math.sqrt(e.dx * e.dx + e.dy * e.dy);
			e.dx = r * Math.sin(n), e.dy = -Math.abs(r * Math.cos(n)), e.y = t.y - e.radius;
		}
		n.forEach((t) => {
			a(e.x, e.y, e.radius, t) && (t.active = !1, this.state.score += 10, e.dy = -e.dy, this.options.onBlockDestroyed?.(n.filter((e) => e.active).length));
		}), e.y - e.radius > o && (this.state.lives--, this.log.info("Life lost", { livesRemaining: this.state.lives }), this.state.lives <= 0 ? (this.state.gameOver = !0, this.state.won = !1, this.log.info("Game over", { score: this.state.score })) : (e.x = i / 2, e.y = o * .7, e.dx = this.settings.ballSpeed * (Math.random() > .5 ? 1 : -1), e.dy = -this.settings.ballSpeed, this.state.started = !1)), n.every((e) => !e.active) && (this.state.gameOver = !0, this.state.won = !0, this.log.info("Game won", { score: this.state.score }), this.options.onComplete?.(), this.options.redirectUrl && (this.log.info("Redirecting", { url: this.options.redirectUrl }), setTimeout(() => {
			window.location.href = this.options.redirectUrl;
		}, this.options.redirectDelay || 2e3)));
	}
	destroy() {
		this.animationId && cancelAnimationFrame(this.animationId), this.resizeObserver && this.resizeObserver.disconnect(), this.canvas.remove(), this.log.info("Game destroyed");
	}
	reset() {
		this.state = this.createInitialState(), this.log.info("Game reset");
	}
}, m = p;
//#endregion
export { p as Breakout404Game, m as default, e as defaultTheme, c as isValidRedirectUrl, t as mergeTheme };
