const {AngularCustomTransformers} = require('ng-custom-transformers');

module.exports = (config, options, targetOptions) => {
	// Your transformations of "config" ....

	// And the important part here: modifyConfig()
	return AngularCustomTransformers.modifyConfig(config);
};
