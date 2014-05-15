var ciqDirectives = angular.module('ciqDirectives', []);

ciqDirectives.directive('ciqInstanceQuestions', function($rootScope){
	return {
		restrict: 'E',
		scope: {
			instance: '='
		},
		template: '<div ng-repeat="catInfo in instance.cat_scored_info"><h1>Category: {{ catInfo.name }}</h1><ciq-question ng-repeat="sq in catInfo.questions" question="sq"></ciq-question></div>'
	};
});
/*Created by Andrew */
ciqDirectives.directive('ciqHeader', function(){
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: "partials/ciqHeader.html"
    };
});
/*Created by Andrew */
ciqDirectives.directive('ciqLikertQuestion', function(){
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: "partials/ciqLikertQuestion.html",
        controller: function($scope, $element, $attrs) {
            $scope.selected = 0;
            $scope.numberOfRows = 1;
            $scope.openTextArea = function(){
                $scope.numberOfRows = 5;
            };
            $scope.selectOption = function(num){
                $scope.selected = num;
            };
        }
    };
});
/*Created by Andrew */
ciqDirectives.directive('ciqImageQuestion', function () {
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: "partials/ciqImageQuestion.html",
        controller: function ($scope, $element, $attrs) {
            $scope.numberOfImages = [1,2,3,4,5,6];
            $scope.numberOfRows = 1;
            $scope.selected = "";
            $scope.openTextArea = function(){
                $scope.numberOfRows = 5;
            };

            $scope.select= function(item) {
                $scope.selected = item;
            };

            $scope.itemClass = function(item) {
                return item === $scope.selected ? 'active' : undefined;
            };
        }

    }
});
/*Created by Andrew */
ciqDirectives.directive('ciqTextInputQuestion', function () {
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: "partials/ciqTextInputQuestion.html",
        controller: function ($scope, $element, $attrs) {
            $scope.numberOfRows = 1;
            $scope.openTextArea = function(){
                $scope.numberOfRows = 5;
            };
        }
    }
});
/*Created by Andrew */
ciqDirectives.directive('ciqFooter', function () {
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: "partials/ciqFooter.html",
        controller: function ($scope, $element, $attrs) {

        }
    }
});
ciqDirectives.directive('ciqQuestion', function(){
	return {
		restrict: 'EA',
		scope: {
			qtext2: '@qtext',
			qtype2: '@qtype',
			question: '=',
		},
		link: function(scope){
				  // TODO: custom L/R isn't implemented - always this one
				  scope.setScaleText = function(){
					  console.log("SCALE TEXT: " + JSON.stringify(scaleText));

				  }
				  scope.leftScale = "Strongly Disagree";
				  scope.rightScale = "Strongly Agree";
				  if (scope.question){
					  scope.qtext = scope.question.qtext;
					  if (scope.qtype2){
						  scope.qtype = scope.qtype2;
					  } else {
						  scope.qtype = scope.question.qtype;
						  if (scope.qtype == 1){
//							  scope.leftScale = "LLLLL";
//							  scope.rightScale = "RRRRR";
						  }
					  }
				  } else {
					  scope.qtext = scope.qtext2;
					  scope.qtype = scope.qtype2;
				  }
			  },
		templateUrl: "partials/question-template.html"
	};
});
ciqDirectives.directive('ciqFormInput', function(){
	return {
		restrict: 'EA',
		transclude: true,
		scope: {
			labelname: '@',
		},
		link: function(scope){
			  },
		templateUrl: "/static/partials/form-input.html"
	};
});
ciqDirectives.directive('ciqAlerts', function(){
	return {
		restrict: 'E',
		template: '<alert ng-repeat="alert in alerts" type="alert.type" close="alerts.splice($index, 1)">{{ alert.msg }}</alert>'
	};
});

ciqDirectives.directive('ciqLikert', function(){
	return {
		restrict: 'E',
		scope: {
			leftScale : '@',
			rightScale : '@',
		},
		template: '<div class="scale-text">{{leftScale}}</div><div class="scale-select"><div class="scale-select-square-cont pull-left"><div class="scale-select-square-cont pull-left"><div class="scale-select-square-cont pull-left"><div class="scale-select-square-cont pull-left"><div class="scale-select-square-cont pull-left"><div class="scale-select-square"></div></div><div class="scale-select-square"></div></div><div class="scale-select-square"></div></div><div class="scale-select-square"></div></div><div class="scale-select-square"></div></div></div><div class="scale-text">{{rightScale}}</div>'
	};
});

ciqDirectives.directive('ciqAnswers', function(){
	return {
		restrict: 'E',
		scope: {
			question: '=',
			answers: '='
		},
		link: function(scope){
			if (!showLevel(scope)) return;
			if (scope.question.qtype != 1 && scope.question.qtype != 21) return;
			var level = {
				good: 0,
				bad: 0,
				neutral: 0,
				total: 0
			};
			for (answer in scope.answers){
				var count = scope.answers[answer];
				level.total += count;
				if (answer > 3){
					level.good += count;
				} else if (answer < 3){
					level.bad += count;
				} else {
					level.neutral += count;
				}
			}
			scope.level = level;
		},
		templateUrl: '/static/partials/answer-summary.html'
	};
	function showLevel(scope){
		return window._.contains([1, 21], scope.question.qtype);
	};
});


ciqDirectives.directive('ciqEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if(event.which === 13) {
				scope.$apply(function (){
					scope.$eval(attrs.ciqEnter);
				});
				event.preventDefault();
			}
		});
	};
});
