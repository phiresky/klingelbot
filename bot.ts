import { init } from "raspi"
import { DigitalInput, DigitalOutput } from "raspi-gpio"
import Telegraf, { ContextMessageUpdate } from "telegraf"
import _TelegrafInlineMenu = require("telegraf-inline-menu")

const TelegrafInlineMenu = (_TelegrafInlineMenu as any) as typeof _TelegrafInlineMenu.default
const debug = true

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

console.log(token)
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
	console.log("starting")
	await _openDoor()
	ctx.replyWithMarkdown("Opening door for 1.5 seconds...")
}

init(async () => {
	output = new DigitalOutput("GPIO21")
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
