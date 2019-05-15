const { init } = require("raspi")

const { DigitalOutput, PULL_UP } = require("raspi-gpio")

init(() => {
	const output = new DigitalOutput({ pullResistor: PULL_UP, pin: "GPIO3" })
	output.write(1)
})
