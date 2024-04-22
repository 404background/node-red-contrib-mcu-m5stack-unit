import {Node} from "nodered"

let cache

function getI2C(options, done) {
	const o = cache?.options
	if (o &&
		(o.bus === options.bus) &&
		(o.clock === options.clock) &&
		(o.data === options.data) &&
		(o.hz === options.hz) &&
		(o.address === options.address)) {
		return cache
	}
	cache?.close()
	cache = null

	if (options.bus) {
		const o = globalThis.device.I2C?.[options.bus]
		if (!o) return 

		cache = new (o.io)({
			...o,
			hz: options.hz,
			address: options.address
		})
	}
	else {
		const I2C = globalThis.device?.io?.I2C
		if (!I2C) return
		
		cache = new I2C(options)
	}

	cache.options = options

	return cache
}

class M5Joystick extends Node {
	#options
	#bytes

	onStart(config) {
		super.onStart(config)

		this.#options = config.options
		this.#bytes = 3
	}
	onMessage(msg, done) {
		let options = this.#options
        options = {
            ...options,
            address: msg.address
        }

		try {
			const i2c = getI2C(options)
			if (!i2c)
				return void done()

			msg.payload = new Uint8Array(i2c.read(this.#bytes))
			msg.address = options.address

			done()
			this.status({fill: "green", shape: "dot", text: "node-red:common.status.connected"})

			return msg
		}
		catch (e) {
			done(e)
			this.status({fill: "red", shape: "ring", text: "node-red:common.status.error"})
		}
	}

	static type = "m5stack_joystick"
	static {
		RED.nodes.registerType(this.type, this)
	}
}
