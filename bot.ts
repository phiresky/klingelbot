import { init } from "raspi"
import { DigitalOutput, PULL_UP } from "raspi-gpio"
import Telegraf, { ContextMessageUpdate } from "telegraf"
import _TelegrafInlineMenu = require("telegraf-inline-menu")

const TelegrafInlineMenu = (_TelegrafInlineMenu as any) as typeof _TelegrafInlineMenu.default
const debug = false

const token = process.env.BOT_TOKEN
if (!token) throw Error("no token")

let output: DigitalOutput

async function _openDoor() {
	console.log(new Date(), "OPEN")
	if (debug) "(debug mode, noop)"
	if (!debug) output.write(0)
	await sleep(1500)
	console.log(new Date(), "DONE")
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
	// console.log("starting")
	await openDoor()
	ctx.replyWithMarkdown("Opening door for 1.5 seconds...")
}

init(async () => {
	output = new DigitalOutput({ pullResistor: PULL_UP, pin: "GPIO3" })
	// await sleep(500)
	output.write(1)
	console.log("listening")
	/*bot.command("open", async ctx => {
    
  });*/
	bot.use(menu.init())
	bot.launch()

	/*while (true) {
    output.write(1);
    await sleep(10000);
  }*/
})
