module.exports = function(RED) {
    function M5Joystick(config) {
        RED.nodes.createNode(this, config)
		console.log(config)
    }
    RED.nodes.registerType("m5stack_joystick", M5Joystick)
}
