var ciqFilters = angular.module('ciqFilters', [])

ciqFilters.filter('scaleTextLR', function() {
	// this is what is used to fill in the left and right text on the scale input
	return function(question, dir, scaleTextList) {
		if (!question || !question.qopts) return "";
		if (question.qopts.scaleText == -1){
			if (dir == "Left"){
				return question.qopts.scaleTextLeft || "NOT SET";
			} else if (dir = "Right"){
				return question.qopts.scaleTextRight || "NOT SET";
			}
		}
		else {
			var scaleText = question.qopts.scaleText;
			for (var i=0; i < scaleTextList.length; i++){
				var sel = scaleTextList[i];
				if (sel[0] == scaleText){
					var spl = sel[1].split(' / ');
					return (dir == "Left") ? spl[0] : spl[1];
				}
			}
		}
		return "NOT SET";
	};
});

ciqFilters.filter('initAllFilter', function() {
	return function(initiatives, initPrefs) {
		var initTemp = [];
		for (var i=0; i<initiatives.length; i++){
			var init = initiatives[i];
			if (initPrefs.hide.indexOf(init.id) == -1 && initPrefs.done.indexOf(init.id) == -1 && initPrefs.like.indexOf(init.id) == -1){
				initTemp.push(init);
			}
		}
		return initTemp;
	};
});

ciqFilters.filter('initPrefFilter', function() {
	return function(initiatives, initPrefs, which) {
		var initTemp = [];
		if (initPrefs){
			for (var i=0; i<initiatives.length; i++){
				var init = initiatives[i];
				if (initPrefs[which].indexOf(init.id) >= 0){
					initTemp.push(init);
				}
			}
		}
		return initTemp;
	};
});


