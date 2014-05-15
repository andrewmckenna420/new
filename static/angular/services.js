var ciqServices = angular.module('ciqServices', ['ngResource']);

ciqServices.factory('Question', ['$resource',
		function($resource){
			return $resource('/question/:qid', {  }, {
				query: {method:'GET', params:{qid:'list'}, isArray:true},
			});
		}]);
ciqServices.factory('ImageCategory', ['$resource',
		function($resource){
			return $resource('/image_category/:qid', {  }, {
				query: {method:'GET', params:{qid:'list'}, isArray:true},
			});
		}]);
ciqServices.factory('DemoQuestion', ['$resource',
		function($resource){
			return $resource('/demo_question/:qid', {  }, {
				query: {method:'GET', params:{qid:'list'}, isArray:true},
			});
		}]);
ciqServices.factory('Survey', ['$resource',
		function($resource){
			return $resource('/survey/:sid', {  }, {
				query: {method:'GET', params:{sid:'list'}, isArray:true},
				theone: {method: 'GET', params:{sid:'theone'}}
			});
		}]);
ciqServices.factory('Customer', ['$resource',
		function($resource){
			return $resource('/customer/:cid', {  }, {
				query: {method:'GET', params:{cid:'list'}, isArray:true},
			});
		}]);
ciqServices.factory('Employee', ['$resource',
		function($resource){
			return $resource('/employee/:cid', {  }, {
				query: {method:'GET', params:{cid:'list'}, isArray:true},
			});
		}]);
ciqServices.factory('EmployeeGroup', ['$resource',
		function($resource){
			return $resource('/employee_group/:cid', {  }, {
				query: {method:'GET', params:{cid:'list'}, isArray:true},
				create: {method:'POST', params:{cid:'create'} },
			});
		}]);
ciqServices.factory('SentResults', ['$resource',
		function($resource){
			return $resource('/sent_results/:oid', {  }, {
				retrieve: {method:'GET', isArray:true},
			});
		}]);
ciqServices.factory('SentSurvey', ['$resource',
		function($resource){
			return $resource('/sent_survey/:oid', {  }, {
				query: {method:'GET', params:{oid:'list'}, isArray:true},
			});
		}]);
ciqServices.factory('Initiative', ['$resource',
		function($resource){
			return $resource('/initiative/:oid', {  }, {
				query: {method:'GET', params:{oid:'list'}, isArray:true},
			});
		}]);
ciqServices.factory('InitPrefs', ['$resource',
		function($resource){
			return $resource('/initiative_get_prefs', {  }, {
			});
		}]);

// code that could be useful to many controllers
ciqServices.factory('CommonCode', [
		function(){
			var common = {};
			// precess 500 error and display relevant info
			common.handleServerError = function(failFun, $scope){
				failFun = failFun ? failFun : function(){};
				return function(response){
					console.log(response.config.data);
					var code = response.status;
					var data = response.data;
					if (code == 500){
						var re = /<th>Exception Value:.*\n.*<pre>(.*)<\/pre>/m;
						var res = re.exec(data);
						console.log(response);
						console.log("500 SERVER ERROR: " + res[1]);
					} else if (code == 400) {
						console.log("Validation failed: " + JSON.stringify(data));
						if ($scope){
							if (!$scope.alerts){
								$scope.alerts = [];
							}
							$scope.alerts.push({type: "danger", msg: data});
						}
						failFun(data, response.config.data); // return the original request
					}
				};
			};
			common.setupDatePicker = function($scope){
				$scope.today = function() {
					$scope.final_date = new Date();
				};
				$scope.showWeeks = false;
				$scope.dateOptions = {
					'year-format': "'yy'",
					'starting-day': 1
				};
				$scope.open = function($event) {
					console.log("OPENED " + $scope.opened);
					$event.preventDefault();
					$event.stopPropagation();
					$scope.opened = true;
				};
				$scope.minDate = new Date();
				$scope.opened = false;
			};
			common.imageCatImages = function($scope, ImageCategory){
				return function(oid){
					for (var i=0; i < $scope.imageCats.length; i++){
						if ($scope.imageCats[i].id == oid){
							return $scope.imageCats[i].images;
						}
					}
					return [];
				};
			};
			return common;
		}]);

// common code for survey pages
ciqServices.factory('SurveyCode', [
		function(){
			var surveyCode = {};
			surveyCode.questionIds = function(survey){
				var qids = [];
				var qbc = survey.questions_by_cat;
				for (var i in qbc){
					qids = qids.concat(qbc[i])
				}
				return qids;
			};
			surveyCode.inQuestions = function($scope){
				// get a list of questions in a survey
//				console.log(" IN Q");
				var survey = $scope.survey;
				var qbc = survey.questions_by_cat;
				qs = [];
				for (var catId in qbc){
					var catQids = qbc[catId];
					var qGone = [];
					for (var j=0; j<catQids.length; j++){
						var qid = catQids[j];
						if ($scope.questionsById[qid])
							qs.push(qid);
						else
							qGone.push(qid);
					}
					for (var j=0; j<qGone.length; j++){
						var qid = qGone[j];
						var index = catQids.indexOf(qid);
						catQids.splice(index, 1);
					}
				}
				$scope.inQuestions = qs;
				return qs;
			};
			surveyCode.questionsLoaded = function($scope){
				var questionsById = {};
				for (var i=0; i<$scope.questions.length; i++){
					var q = $scope.questions[i];
					questionsById[q.id] = q;
				}
				$scope.questionsById = questionsById;
				surveyCode.orgSurvey($scope);
			};
			surveyCode.orgSurvey = function($scope){
				var survey = $scope.survey;
				if (!survey.questions_by_cat || !$scope.questionsById)
					return [];
				surveyCode.inQuestions($scope);
				var catAvailableQuestions = {};
				for (var catId in survey.questions_by_cat){
					catAvailableQuestions[catId] = [];
				}
				for (var i=0; i<$scope.questions.length; i++){
					var q = $scope.questions[i];
					var qid = q.id;
					if ($scope.inQuestions.indexOf(qid) >= 0)
						continue;
					var qCatId = q.cat;
					catAvailableQuestions[qCatId].push(q);
				}
				$scope.catAvailableQuestions = catAvailableQuestions;
			};
			surveyCode.prepPreview = function($scope, survey){
				var qbc = survey.questions_by_cat;
				for (var catId in qbc){
					var ql = [];
					for (var j=0; j<qbc[catId].length;j++){
						var qid = qbc[catId][j];
						var q = $scope.questionsById[qid];
						ql.push(q);
					}
					qbc[catId] = ql;
				}
			};
			return surveyCode;
		}
		]);
