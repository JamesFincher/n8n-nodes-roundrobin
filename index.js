// This file is used for development only
// For production the build files are used
module.exports = {
	nodeClasses: {
		RoundRobin: require('./dist/nodes/RoundRobin/RoundRobin.node.js').RoundRobin
	}
}; 