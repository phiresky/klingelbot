import * as fs from "fs"
import { init } from "raspi"
import { DigitalOutput, PULL_UP } from "raspi-gpio"
import Telegraf, { ContextMessageUpdate } from "telegraf"
import _TelegrafInlineMenu = require("telegraf-inline-menu")
const TelegrafInlineMenu = (_TelegrafInlineMenu as any) as typeof _TelegrafInlineMenu.default
const debug = false

const token = process.env.BOT_TOKEN
const admins = (process.env.ADMINS || "").split(",")

const ringringFifo = process.env.RINGRING_FIFO

if (admins.length === 0) console.warn("no admins set")
if (!token) throw Error("no token")
if (!ringringFifo) console.warn("no ringring detection")

let output: DigitalOutput

// const adminChats = new Set<string>()

function log(...args: any[]) {
	console.log(new Date(), ...args)
}

async function _openDoor() {
	log("OPEN")
	if (debug) log("(debug mode, noop)")
	if (!debug) output.write(0)
	await sleep(1500)
	log("DONE")
	if (!debug) output.write(1)
}

let previous = Promise.resolve()
async function openDoor() {
	let previousprevious = previous
	while (true) {
		await previous
		if (previousprevious === previous) break
		previousprevious = previous
	}

	previous = _openDoor()
	return previous
}

const bot = new Telegraf(token)
const menu = new TelegrafInlineMenu(ctx => `Hey ${ctx.from!.first_name}!`)
menu.setCommand("start")
menu.simpleButton("Open the fucking dooor!", "a", {
	doFunc: ctx => open(ctx),
})

function sleep(time: number) {
	return new Promise(res => setTimeout(res, time))
}

async function open(ctx: ContextMessageUpdate) {
	if (!ctx.from) {
		log("what?")
		return
	}
	log("openDoor", ctx.from.id, ctx.from.first_name, ctx.from.last_name)
	await openDoor()
	ctx.replyWithMarkdown("Opening door for 1.5 seconds...")
}

init(async () => {
	output = new DigitalOutput({ pullResistor: PULL_UP, pin: "GPIO3" })
	// await sleep(500)
	output.write(1)
	log("listening")
	/*bot.command("open", async ctx => {
    
	});*/

	bot.use((ctx, next) => {
		if (
			next &&
			ctx.from &&
			ctx.chat &&
			(admins.includes(String(ctx.from.id)) ||
				admins.includes(String(ctx.chat.id)))
		) {
			if (ctx.chat) {
				log("chat id", ctx.from.id, "=", ctx.chat.id)
				// adminChats.add(String(ctx.chat.id))
			}
			;(next as any)(ctx)
		} else {
			log(
				"msg from unknown user",
				ctx.updateType,
				ctx.message && ctx.message.text,
				ctx.from,
				ctx.chat && ctx.chat!.id,
			)
		}
	})
	bot.use(menu.init())
	bot.launch()

	/*while (true) {
    output.write(1);
    await sleep(10000);
	}*/

	if (ringringFifo) {
		const fifo = fs.createReadStream(ringringFifo, {
			encoding: "utf8",
			autoClose: false,
		})
		fifo.on("data", data => {
			log("got doorbell ring")
			for (const chat of admins) {
				bot.telegram.sendMessage(chat, "The doorbell just rang!")
			}
		})
	}
})
