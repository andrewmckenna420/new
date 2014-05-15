var ciqTakerApp = angular.module('ciqTakerApp', [
		'ui.bootstrap'
		]);

ciqTakerApp.run(function($rootScope){
	$rootScope.addAlertDanger = function($scope, msg) {
		$scope.alerts.push({
			type: "danger",
			msg: msg
		});
	};
});

ciqTakerApp.controller('TakerGetEmailCtrl', ['$scope', '$location', '$window', '$http', 
		function($scope, $location, $window, $http){
			$scope.EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
			$scope.alerts = [
			];
			$scope.closeAlert = function(index) {
				$scope.alerts.splice(index, 1);
			};
			$scope.keyPress = function(e){
				if (e.which == 13){
					$scope.submitEmail();
				}
			};
			$scope.submitEmail = function(){
				$scope.alerts = [];
				var email = $scope.email;
				if (email){
					$http.post($window.location.pathname, {email: email})
						.success(function(data, status, headers, config){
							console.log("TAKER TOKEN, " + JSON.stringify(data.taker_token));
							$window.location.href = "/take/" + data.taker_token;

						})
						.error(function(data, status, headers, config){
							console.log("FAIL: " + JSON.stringify(data));
							if (status == 400){
								var msg = data.msg;
								$scope.addAlertDanger($scope, msg);
							}
						});

				}

			};

		}]);

ciqTakerApp.controller('TakerCtrl', ['$scope', '$location', '$window', '$http', 
		function($scope, $location, $window, $http){
			$scope.answers = {};
			$scope.comments = {};
			$scope.scaleClick = function(answer, qnum){
				$scope.answers[qnum] = answer;
			};
			$scope.imageHl = function(answer, qnum){
				return ($scope.answers[qnum] == answer) ? "img-choice-sel" : "img-choice";
			};
			$scope.scaleHl = function(answer, qnum){
				return ($scope.answers[qnum] == answer) ? "answered" : "";
			};
			$scope.tfHl = function(answer, qnum){
				return "btn btn-" + ( $scope.answers[qnum] == answer ? "success" : "default" );
			};
			$scope.setAnswer = function(answer, qnum){
				$scope.answers[qnum] = answer;
			};
			$scope.requiredQuestions = [];
			$scope.getRequiredQuestions = function(){
				var qrows = $('.question-row');
				var required = [];
				for (var i=0; i<qrows.length; i++){
					var row = $(qrows[i]);
					if (row.find('.question-answer').length){
						required.push(i + 1);
					}
				}
				$scope.requiredQuestions = required;
				console.log("REQ: " + JSON.stringify($scope.requiredQuestions));
			};
			$scope.getRequiredQuestions();
			$scope.questionsRemaining = function(){
				var remaining = $scope.requiredQuestions.length;
				for (var i=0; i<$scope.requiredQuestions.length; i++){
					var qnum = $scope.requiredQuestions[i];
					if ($scope.answers[qnum]){
						remaining -= 1;
					}
				}
				return remaining;
			};
			$scope.remainingText = function(){
				var remaining = $scope.questionsRemaining();
				if (remaining == 0){
					return "All questions answered.";
				} else {
					return "Questions Remaining: " + remaining;
				}
			};
			$scope.submitSurvey = function(){
				console.log("ANSWERS: " + JSON.stringify($scope.answers));
				console.log("COMMENTS: " + JSON.stringify($scope.comments));
				var data = {
					answers: $scope.answers,
					comments: $scope.comments
				}
				$http.post($window.location.pathname, data)
					.success(function(data, status, headers, config){
						console.log("YES, " + JSON.stringify(data));
						$window.location.href = "/thankyou"

					})
				.error(function(data, status, headers, config){
					console.log("FAIL: " + JSON.stringify(data));
				});
				return;
//				if ($scope.questionsRemaining()){
//					return;
//				}
				$scope.submitAlert = null;
				var qrows = $('.question-row');
				var submitAnswers = {};
				for (var i=0; i<qrows.length; i++){
					var row = qrows[i];
					var rid = $(row).prop('id').replace('question-', '');
					var qanswer = $scope.answers[rid];
					submitAnswers[rid] = {id: rid, answers: qanswer};
					var comment = $('#question-comment-' + rid).val();
					if (comment) {
						submitAnswers[rid].comment = comment;
					}
				}
				console.log("SUBMIT A: " + JSON.stringify(submitAnswers));
				console.log("COMPLETE");
				$http.post($window.location.pathname, submitAnswers)
					.success(function(data, status, headers, config){
						console.log("YES, " + JSON.stringify(data));
						$window.location.href = "/thankyou"

					})
				.error(function(data, status, headers, config){
					console.log("FAIL: " + JSON.stringify(data));
				});
			};
			//	$scope.submitAlert = { type: "danger", msg: "MSG 1" } ;
			$scope.closeSubmitAlert = function(){
				$scope.submitAlert = null;
			};
		}]);
