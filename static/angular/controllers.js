var ciqControllers = angular.module('ciqControllers', [
		'ui.bootstrap',
		'ui.sortable',
		'angularFileUpload',
		]);

ciqControllers.controller('HeaderCtrl', ['$scope', '$location',
		function ($scope, $location) {
			$scope.isActive = function (viewLocation) {
				viewLocation = "/" + viewLocation;
				return $location.path().substring(0, viewLocation.length) == viewLocation;
			};
		}]);

ciqControllers.controller('LoginCtrl', ['$scope', '$location', '$http',
		function ($scope, $location, $http) {
			$scope.savedEmail = $.cookie('email_login');
			if ($scope.savedEmail){
				$scope.email_in = $scope.savedEmail;
				$scope.remem_email = true;
			}
			$scope.submitLogin = function(){
				$scope.errorMsg = "";
				if (!$scope.email_in){
					$('#email_in').focus();
					return;
				}
				if (!$scope.password_in){
					$('#password_in').focus();
					return;
				}
				if ($scope.remem_email){
					$.cookie('email_login', $scope.email_in, { expires: 365, path: '/' } );
				} else {
					$.removeCookie('email_login', { path: '/' });
				}
				var data = {
					email_in: $scope.email_in,
					password_in: $scope.password_in,
				};
				$http.post('login_submit', data)
					.success(function(data, status, headers, config){
						window.location = "/app";
					})
					.error(function(data, status, headers, config){
						console.log("ERROR " );
						$scope.errorMsg = "Invalid Login";
					})

			};

		}]);

ciqControllers.controller('QuestionListCtrl', ['$scope', 'Question', 'ImageCategory', 'DemoQuestion', 'CommonCode',
		function ($scope, Question, ImageCategory, DemoQuestion, CommonCode) {
			$scope.questions = Question.query();
			$scope.demoQuestions = DemoQuestion.query();
			$scope.imageCats = ImageCategory.query();
			$scope.imageCatImages = CommonCode.imageCatImages($scope);
			$scope.activeTab = "score";
			$scope.questionList = true;
			$scope.isListView = true;
		}]);

ciqControllers.controller('QuestionDemoEditCtrl', ['$scope', '$window', '$location', '$routeParams', 'CommonCode', 'DemoQuestion',
		function($scope, $window, $location, $routeParams, CommonCode, DemoQuestion) {
			$scope.loadDemoQuestion = function(qid){
				if (qid == 0) {
					return new DemoQuestion({ id: 0, qopts: {} });
				} else {
					return DemoQuestion.get({ qid: qid }, function(){
					});
				}
			};
			$scope.question = $scope.loadDemoQuestion($routeParams.qid);
			$scope.addChoice = function(e){
				if ($scope.question.newChoice){
					$scope.question.qopts.choices.push($scope.question.newChoice);
					$scope.question.newChoice = "";
				}
			};
			$scope.delChoice = function(index){
				$scope.question.qopts.choices.splice(index, 1);
			};
			$scope.$watch('question.qtype', function(){
				var question = $scope.question;
				if (!question.qtype) return;
				if (question.qtype == 11){ // text choice
					if (!question.qopts.choices){
						question.qopts.choices = [];
					}
				} else {
					if (question.qopts.choices){
						delete question.qopts.choices;
					}
				}
			});
			$scope.demoQuestionComplete = function(){
				var q = $scope.question;
				if (q.qtext){
					if (q.qtype == 11) {
						if (q.qopts.choices.length > 1){
							return true;
						}
					} else if (q.qtype == 12){
						return true;
					}
				}
				return false;
			};
			$scope.saveDemoQuestion = function(){
				$scope.question.$save(function(data){
					$location.path("/questions");
				},
				CommonCode.handleServerError(function(validationError){
					console.log("GOT THIS ERROR MSG: " + validationError);
					console.log(validationError);
				}, $scope)
				);

			};
		}]);

ciqControllers.controller('QuestionImagesEditCtrl', ['$scope', '$window', '$location', '$routeParams', '$upload', 'ImageCategory', 'CommonCode',
		function($scope, $window, $location, $routeParams, $upload, ImageCategory, CommonCode) {
			$scope.loadImageQuestion = function(qid){
				if (qid == 0) {
					return new ImageCategory({ id: 0, images: [] });
				} else {
					return ImageCategory.get({ qid: qid });
				}
			};
			$scope.imageQuestion = $scope.loadImageQuestion($routeParams.qid);
			$scope.imgQuestionComplete = function(){
				if (!$scope.imageQuestion.images) return;
				for (var i=0; i<$scope.imageQuestion.images.length; i++){
					var img_info = $scope.imageQuestion.images[i];
					if (!img_info.label){
						return false;
					}
				}
				return $scope.imageQuestion.name;

			};
			$scope.saveImageQuestion = function(){
//				console.log("SIQ:" + JSON.stringify($scope.imageQuestion));
				$scope.imageQuestion.$save(function(data){
//					console.log("SAVED: " + JSON.stringify(data));
					$location.path("/questions");
				},
				CommonCode.handleServerError(function(validationError){
					console.log("GOT THIS ERROR MSG: " + validationError);
					console.log(validationError);
				}, $scope)
				);

			};
			$scope.onFileSelect = function($files){
				for (var i = 0; i < $files.length; i++) {
					var file = $files[i];
					$scope.upload = $upload.upload({
						url: '/put_img', //upload.php script, node.js route, or servlet url
						// method: POST or PUT,
						// headers: {'headerKey': 'headerValue'},
						// withCredentials: true,
						data: {},
						file: file,
						// file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
						/* set file formData name for 'Content-Desposition' header. Default: 'file' */
						//fileFormDataName: myFile, //OR for HTML5 multiple upload only a list: ['name1', 'name2', ...]
						/* customize how data is added to formData. See #40#issuecomment-28612000 for example */
						//formDataAppender: function(formData, key, val){} //#40#issuecomment-28612000
					}).progress(function(evt) {
						console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
					}).success(function(data, status, headers, config) {
						// file is uploaded successfully
						$scope.imageQuestion.images.push({
							label: "",
							img_id: data.id
						});
					});
					//.error(...)
					//.then(success, error, progress); 
				}
			};
			$scope.removeImg = function(imgId){
				var images = $scope.imageQuestion.images;
				var index = -1;
				for (var i=0; i<images.length; i++){
					var image = images[i];
					if (image.img_id == imgId){
						index = i;
						break;
					}
				}
				if (index >= 0){
					images.splice(index, 1);
				}
				return;
				$scope.imageQuestion.images.splice(index, 1);

			};
		}]);

ciqControllers.controller('QuestionEditCtrl', ['$scope', '$window', '$location', '$routeParams', 'Question', 'ImageCategory', 'CommonCode',
		function($scope, $window, $location, $routeParams, Question, ImageCategory, CommonCode) {
			$scope.loadQuestion = function(qid){
				if (qid == 0)
					return new Question({id: 0, qopts: {}});
				return Question.get({qid: qid});
			};
			$scope.question = $scope.loadQuestion($routeParams.qid);
			$scope.imageCats = ImageCategory.query();
			$scope.imageCatImages = CommonCode.imageCatImages($scope);
			$scope.saveQuestion = function(){
				$scope.question.$save(function(data){
					$location.path("/questions");
				},
				CommonCode.handleServerError(function(validationError){
					console.log("GOT THIS ERROR MSG: " + validationError);
					console.log(validationError);
				})
				)
			};
			$scope.questionComplete = function(question){
				if (question.qtext && question.cat && question.qtype) {
					if (question.qtype == 1) {
						if (question.qopts.scaleText >= 0)
							return true;
						else if (question.qopts.scaleText == -1){
							return question.qopts.scaleTextLeft && question.qopts.scaleTextRight;
						}
					} else if (question.qtype == 4) {
						return question.qopts.imageCatId > 0;
					} else 
						return true;

				}
				return false;
				
			}
		}]);

ciqControllers.controller('SurveyListCtrl', ['$scope', 'Survey', 'Question', 'ImageCategory', 'SurveyCode', 'CommonCode',
		function ($scope, Survey, Question, ImageCategory, SurveyCode, CommonCode) {
			$scope.surveys = Survey.query(
				);
			$scope.imageCats = ImageCategory.query();
			$scope.imageCatImages = CommonCode.imageCatImages($scope);
			$scope.questionIds = SurveyCode.questionIds;
			$scope.questions = Question.query({}, function(data){
//				SurveyCode.questionsLoaded($scope);
			});
			$scope.previewSurvey = function(oid){
				for (var i=0; i<$scope.surveys.length; i++){
					var survey = $scope.surveys[i];
					if (survey.id == oid){
						$scope.survey = survey;
//						$scope.questions = instance.questions;
						SurveyCode.questionsLoaded($scope);
						SurveyCode.prepPreview($scope, $scope.survey);
						$("#previewModal").modal();
					}
				}

			};
		}]);

ciqControllers.controller('SurveyPreviewCtrl', ['$scope', 'Survey', 'Question', '$routeParams', 'SurveyCode',
		function ($scope, Survey, Question, $routeParams, SurveyCode) {
			$scope.survey = Survey.get({sid: $routeParams.sid}, function(data){ SurveyCode.organizeSurvey($scope) });
			// TODO: only load survey questions
			$scope.questions = Question.query({}, function(data){
				SurveyCode.questionsLoaded($scope);
			});
			$scope.qSel = {};
			$scope.surveyPreview = true;
			$scope.showBackButton = true;
			$scope.organizeQuestions = function(){
				var questionsById = {};
				for (var i=0; i<$scope.questions.length; i++){
					var q = $scope.questions[i];
					questionsById[q.id] = q;
				}
				$scope.questionsById = questionsById;
			};
		}]);

ciqControllers.controller('SurveyEditCtrl', ['$scope', '$window', '$location', '$routeParams', 'Survey', 'Question', 'SurveyCode', 'CommonCode',
		function($scope, $window, $location, $routeParams, Survey, Question, SurveyCode, CommonCode) {
			// after the survey and questions are loaded, we need to run organizeSurvey
			$scope.loadSurvey = function(sid){
				if (sid == 0) // organizeSurvey should be run after questions load, since this should happen first
					return new Survey({id: 0, questions_by_cat: $scope.startQBC() });
				return Survey.get({sid: sid}, function(){
					$scope.completeCats();
				});
			};
			$scope.startQBC = function(){
				var qbc = {};
				for (var i=0; i<$scope.cats.length;i++){
					qbc[cats[i][0]] = [];
				};
				return qbc;
			};
			$scope.$watch('survey.questions_by_cat', function(){SurveyCode.orgSurvey($scope)}, true);
			$scope.survey = $scope.loadSurvey($routeParams.sid);
			$scope.questions = Question.query({}, function(data){
				SurveyCode.questionsLoaded($scope);
			});
			$scope.qSel = {}; // when a q is selected, it's put in here
			$scope.completeCats = function(){
				// make sure that all cats are represented in the survey
				var survey = $scope.survey;
				var qbc = survey.questions_by_cat;
				allCats:
				for (var i=0; i<$scope.cats.length; i++){
					var catId = $scope.cats[i][0];
					$scope.qSel[catId] = "";
					if (!qbc[catId]){
						qbc[catId] = [];
					}
				}
			};
			$scope.sortableOptionsCats = {
				start: function(e, ui){
			           ui.placeholder.height(ui.item.height());
					   },
				axis: 'y'
			};
			$scope.sortableOptionsQids = {
				start: function(e, ui){
			           ui.placeholder.height(ui.item.height());
					   },
				axis: 'y'
			};
			$scope.qSelChange = function(catId){
				var addQid = parseInt($scope.qSel[catId]);
				$scope.qSel[catId] = "";
				$scope.survey.questions_by_cat[catId].push(addQid);
				return;
				var catId = catInfo[0];
				var catQs = catInfo[1];
				var qid = parseInt($scope.qSel[catId]);
				$scope.qSel[catId] = "";
				catQs.push(qid);
			};
			$scope.delQuestionFromCat = function(qid, catQs){
				qid = parseInt(qid);
				var index = catQs.indexOf(qid);
				console.log("DEL " + qid + " AT " + index);
				catQs.splice(index, 1);
			};
			$scope.saveSurvey = function(){
				$scope.survey.$save(
						function(data){
							console.log("SAVED: " + JSON.stringify(data));
							$location.path("/surveys");
						},
						CommonCode.handleServerError()
						);
			};
			$scope.surveyComplete = function(survey){
				return survey.name ? true : false;
			}
		}]);

ciqControllers.controller('CustomerListCtrl', ['$scope', 'Customer',
		function ($scope, Customer) {
			$scope.customers = Customer.query( function(){
				console.log("CUST: " + JSON.stringify($scope.customers));
				test = window._.select([1,2,3,4,5], function(s){return s>4});
				console.log(test);
			}
			);
			$scope.becomeCustomer = function(cid){
				$.cookie('spoofCust', cid);
				window.location.href = "/app";
			};
		}]);

ciqControllers.controller('CustomerEditCtrl', ['$scope', 'Customer', '$location', '$routeParams', 'CommonCode',
		function ($scope, Customer, $location, $routeParams, CommonCode) {
			$scope.loadCustomer = function(cid){
				if (cid == 0)
					return new Customer({id: 0});
				return Customer.get({cid: cid});
			};
			$scope.customer = $scope.loadCustomer($routeParams.cid);
			$scope.customerComplete = function(){
				var c = $scope.customer;
				if (!c.name || !c.email)
					return false;
				else if (c.password) {
				 	if (c.password != c.password2)
   						return false;
					else
						return true;
				}
				else if (c.id == 0)
					return false;
				return true;
			};
			$scope.saveCustomer = function(){
				$scope.customer.$save(function(data){
//					console.log("SAVED: " + JSON.stringify(data));
					$location.path("/customers");
				}, CommonCode.handleServerError(function(validationError){
					console.log("GOT THIS ERROR MSG: " + validationError);
					console.log(validationError);
				}));
			};
		}]);

ciqControllers.controller('EmployeeListCtrl', ['$scope', '$http', '$filter', '$upload', 'Employee', 'EmployeeGroup', 'CommonCode',
		function ($scope, $http, $filter, $upload, Employee, EmployeeGroup, CommonCode) {
			$scope.employees = Employee.query({}, function(){
				$scope.sortEmployeesById();
			});
			$scope.employeeGroups = EmployeeGroup.query({}, function(){
				$scope.groupEmployees();
			});
			$scope.groupsByEmployee = {};
			$scope.groupEmployees = function(){
				var groupsByEmployee = {};
				for (var i=0; i<$scope.employeeGroups.length; i++){
					var group = $scope.employeeGroups[i];
					for (var j=0; j < group.employee_ids.length; j++){
						var eid = group.employee_ids[j];
						groupsByEmployee[eid] = groupsByEmployee[eid] || [];
						groupsByEmployee[eid].push(group.name);
					}
				}
				$scope.groupsByEmployee = groupsByEmployee;
			};
			$scope.newEmployee = new Employee({ id:0 });
			$scope.editEmployee = {};
			$scope.newEmployeeComplete = function(){
				return $scope.employeeComplete($scope.newEmployee);
			};
			$scope.rmFromGroup = function(gid){
				var data = {cmd: "rm", gid: gid, employee_ids: Object.keys($scope.rowSel)};
				$scope.changeGroup(data);
			};
			$scope.addToGroup = function(gid){
				var data = {cmd: "add", gid: gid, employee_ids: Object.keys($scope.rowSel)};
				$scope.changeGroup(data);
			}
			$scope.changeGroup = function(data){
				console.log("CHANGE GROUP " + JSON.stringify(data));
				$http.post('/employee_group', data)
					.success(function(data, status, headers, config){
						console.log("SUCCESS " + JSON.stringify(data));
						var gid = data.gid;
						var employee_ids = data.employee_ids;

						for (var i=0; i<$scope.employeeGroups.length; i++){
							var group = $scope.employeeGroups[i];
							if (group.id == gid){
								group.employee_ids = employee_ids;
							}
						}
						$scope.groupEmployees();
					})
				.error(function(data, status, headers, config){
					if (status == 400){
						// validation error
						var validationError = data;
						var post_data = config.data;
						console.log("VALID ERROR: " + JSON.stringify(validationError));
						console.log("PD: " + JSON.stringify(post_data))
					} else {
						var re = /<th>Exception Value:.*\n.*<pre>(.*)<\/pre>/m;
						var res = re.exec(data);
						console.log(data);
						console.log("500 SERVER ERROR: " + res[1]);
						// TODO: print out some useful error
					}
				});
			};
			$scope.makeGroup = function(){
				bootbox.prompt("Enter group name:", function(result){
					if (result == null) {
						console.log("cancelled");
					} else {
						console.log("NEW group name: " + result);
						var newGroup = new EmployeeGroup({name: result});
						newGroup.$create(function(data){
							$scope.employeeGroups.push(data);
						},
						CommonCode.handleServerError(function(validationError){i
							console.log("VALIDATION ERROR: " + JSON.stringify(validationError));
						})
						);
					}
				});
			};
			$scope.employeeComplete = function(employee){
				return employee.fname && employee.lname && employee.email;
			};
			$scope.selectNone = function(){
				$scope.rowSel = {};
			};
			$scope.selectAll = function(){
				for (var i=0; i<$scope.employees.length; i++){
					$scope.rowSel[$scope.employees[i].id] = true;
				}
			};
			$scope.selectFiltered = function(){
				var filtered = $filter('filter')($scope.employees, $scope.search);
//				console.log("FILTERED: " + filtered.length);
				return filtered.length;

			};
			$scope.selCount = function(){
				return Object.keys($scope.rowSel).length;
			};
			$scope.rowSel = {};
			$scope.rowToggle = function(eid){
				if ($scope.rowSel[eid]){
					delete $scope.rowSel[eid];
				} else {
					$scope.rowSel[eid] = true;
				}
			};
			$scope.sortEmployeesById = function(){
				var out = {};
				for (var i=0; i<$scope.employees.length; i++){
					var e = $scope.employees[i];
					out[e.id] = e;
				}
				$scope.employeesById = out;
			};
			$scope.fields = ['fname','lname','email'];
			$scope.orderby = $scope.fields[0];
			$scope.dirty = function(eid){
				var orig = $scope.employeesById[eid];
				var edit = $scope.editEmployee[eid];
				for (var i=0; i<$scope.fields.length; i++){
					var f = $scope.fields[i];
					if (orig[f] != edit[f])
						return true;
				}
				return false;
			};
			$scope.dirtyAndValid = function(eid){
				if (!$scope.editEmployee[eid]) return;
				if (!$scope.employeeComplete($scope.editEmployee[eid]))
					return false;
				return $scope.dirty(eid);
			};
			$scope.endEdit = function(eid){
				delete $scope.editEmployee[eid];
			};
			$scope.startEdit = function(eid){
				$scope.editEmployee[eid] = new Employee($scope.employeesById[eid]);
			};
			$scope.saveEmployee = function(e){
				e.$save(function(data){
//					console.log("SAVED: " + JSON.stringify(data));
					var eid = data.id;
					if ($scope.employeesById[eid]){
						for (var i=0; i<$scope.fields.length; i++){
							var f = $scope.fields[i];
							$scope.employeesById[eid][f] = data[f];
						}
						delete $scope.editEmployee[eid];
					} else {
						$scope.employees.push(data);
						$scope.employeesById[eid] = data;
						$scope.newEmployee = new Employee({ id:0 });
					}
				}, 
				CommonCode.handleServerError(function(validationError, post_data){
					console.log("GOT THIS ERROR MSG: " + validationError);
					console.log(validationError);
					console.log("POST DATA: " + JSON.stringify(post_data));
				}, $scope
				))};
			$scope.saveEdit = function(eid){
				var e = $scope.editEmployee[eid];
				console.log("SAVE EDIT " + JSON.stringify(e));
				$scope.saveEmployee(e);
			};
			$scope.saveNewEmployee = function(){
				$scope.saveEmployee($scope.newEmployee);
			};
//			$scope.alerts = [
//			{ type: "danger", msg: "MSG 1" },
//				];
			$scope.closeAlert = function(index) {
				$scope.alerts.splice(index, 1);
			};
			$scope.onFileSelect = function($files){
				for (var i = 0; i < $files.length; i++) {
					var file = $files[i];
					$scope.upload = $upload.upload({
						url: '/upload_email_csv',
						data: {},
						file: file,
					}).progress(function(evt) {
						console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
					}).success(function(data, status, headers, config) {
						// file is uploaded successfully
						console.log("CSV UP: " + JSON.stringify(data));
						// probably reload employees here
					})
					.error(function(data, status){
						if (status == 400){
							console.log("UPLOAD CSV 400 " + JSON.stringify(data));
						}
					});
					//.then(success, error, progress); 
				}
			};
		}]);

ciqControllers.controller('SurveyMgmtCtrl', ['$scope', 'SentSurvey', 'SurveyCode',
		function ($scope, SentSurvey, SurveyCode) {
			$scope.instances = SentSurvey.query();
			$scope.takersCompletedLength = function(instance){
				completed = window._.filter(instance.takers, function(t){return t.complete});
				return completed.length;
			};
			$scope.viewSurvey = function(oid){
				for (var i=0; i<$scope.instances.length; i++){
					var instance = $scope.instances[i];
					if (instance.id == oid){
						console.log("FOUND: " + instance.name);
						$scope.instance = instance;
						$("#previewInstanceModal").modal();
					}
				}

			};
		}]);

ciqControllers.controller('SentDetailsCtrl', ['$scope', '$routeParams', '$http', 'SentSurvey', 'SurveyCode', 'SentResults',
		function ($scope, $routeParams, $http, SentSurvey, SurveyCode, SentResults) {
			$scope.instance = SentSurvey.get({oid: $routeParams.oid});
			$scope.sentQuestions = SentResults.retrieve({oid: $routeParams.oid, test: "ALEX"}, function(data){
				console.log("RESULTS: " + JSON.stringify(data));
			});
			$scope.sectionName = function(sectionId){
				switch(sectionId){
					case 1:
						return "Scored";
					case 2:
						return "Demo";
					case 3:
						return "Custom";
				}
			};
			$scope.logResults = function(taker){
				console.log(JSON.stringify(taker.results));
			};
			$scope.takersCompletedLength = function(instance){
				completed = window._.filter(instance.takers, function(t){return t.complete});
				return completed.length;
			};
			$scope.showQuestionStats = function(answers_by_q){
				console.log("ANS:" + JSON.stringify(answers_by_q));
				if (!answers_by_q){
					return ["No Results"]
				}
				var sum = 0;
				var count = 0;
				var results = [];
				for (a in answers_by_q){
					sum += answers_by_q[a] * a;
					count += 1;
					results.push(a + ": " + answers_by_q[a]);
				}
				var avg = count ? sum / count : "N/A";
				results.unshift("avg:" + avg);
				return results;
			};
			$scope.catScore = function(catId){
				console.log("CATID: " + catId);
				var stats = $scope.instance.results.stats_by_cat[catId];
				var score = parseInt(100 * stats.total / stats.count / 5);
				return score;
			};
			$scope.hasStats = function(catId){return $scope.instance.results.stats_by_cat[catId]}
		}]);

// init for customers
ciqControllers.controller('InitiativeListCtrl', ['$scope', '$routeParams', '$http', 'Initiative', 'CommonCode', 'InitPrefs',
		function($scope, $routeParams, $http, Initiative, CommonCode, InitPrefs){
			$scope.activeTab = 'all'; //starting tab
			$scope.initiatives = Initiative.query();
			// set prefs so that page can load right away without errors
			$scope.initPrefs = {like: [], done: [], hide: []};
			InitPrefs.get({}, function(data){
				$scope.initPrefs = data;
			});
			$scope.listCats = function(catIds){
				return catIds.map(function(catId){
					return $scope.nameFromId(catId, cats);
				}).join(', ');
			};
			$scope.setInitPref = function(which, initiative, remove){
				var list = $scope.initPrefs[which];
				var index = list.indexOf(initiative.id);
				if (remove){
					if (index >= 0){
						list.splice(index, 1);
						$scope.saveInitPref(which, 'rm', initiative.id);
					}
				} else if (index == -1){
					list.push(initiative.id);
					$scope.saveInitPref(which, 'add', initiative.id);
				}
			};
			$scope.saveInitPref = function(which, action, initId){
				var data = {
					which: which,
					action: action,
					init_id: initId
				};
				$http.post('/initiative_update_pref', data)
					.success(function(data){
//						console.log("INIT PREF SAVED");
					})
					.error(function(data, status){
						console.log("UPDATE FAILED!!");
					});

			};
		}]);
// init list for admin
ciqControllers.controller('InitiativeAdminListCtrl', ['$scope', '$routeParams', '$location', 'Initiative', 'CommonCode',
		function($scope, $routeParams, $location, Initiative, CommonCode){
			$scope.initiatives = Initiative.query();
			$scope.listCats = function(catIds){
				return catIds.map(function(catId){
					return $scope.nameFromId(catId, cats);
				}).join(', ');
			};
			$scope.editInit = function(i){
				$location.path("/initiatives_admin/" + i.id);
			};
		}]);
ciqControllers.controller('InitiativeEditCtrl', ['$scope', '$routeParams', '$location', '$upload', 'Initiative', 'CommonCode',
		function($scope, $routeParams, $location, $upload, Initiative, CommonCode){
			$scope.loadInit = function(oid){
				if (oid == 0) {
					return new Initiative({id: 0});
				} else {
					return Initiative.get({oid: oid}, function(data){
						for (var i=0; i<data.tags.length; i++){
							$scope.initCats[data.tags[i]] = true;
						}
				console.log("TTT2: " + JSON.stringify(data));
					});
				}
			};
			$scope.initCats = {};
			$scope.initiative = $scope.loadInit($routeParams.oid);
			$scope.saveInit = function(){
				$scope.initiative.tags = [];
				for (var c in $scope.initCats){
					if ($scope.initCats[c]){
						$scope.initiative.tags.push(c);
					}
				}
				$scope.initiative.$save(function(data){
					$location.path("/initiatives_admin");
//					$scope.initiative = new Initiative({ id: 0 });
				}, CommonCode.handleServerError(function(validationError, post_data){
					console.log("INIT SAVE FAILED")
				}, $scope));
			};
			$scope.dirtyAndValid = function(){
				return $scope.initiative.name && $scope.initiative.descr;
			}
			$scope.onFileSelect = function($files){
				for (var i = 0; i < $files.length; i++) {
					var file = $files[i];
					$scope.upload = $upload.upload({
						url: '/put_img', //upload.php script, node.js route, or servlet url
						// method: POST or PUT,
						// headers: {'headerKey': 'headerValue'},
						// withCredentials: true,
						data: {},
						file: file,
						// file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
						/* set file formData name for 'Content-Desposition' header. Default: 'file' */
						//fileFormDataName: myFile, //OR for HTML5 multiple upload only a list: ['name1', 'name2', ...]
						/* customize how data is added to formData. See #40#issuecomment-28612000 for example */
						//formDataAppender: function(formData, key, val){} //#40#issuecomment-28612000
					}).progress(function(evt) {
						console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
					}).success(function(data, status, headers, config) {
						// file is uploaded successfully
						$scope.initiative.img_id = data.id;
					});
					//.error(...)
					//.then(success, error, progress); 
				}
			};
		}]);

ciqControllers.controller('FullSurveyCtrl', ['$scope', '$http', '$location', '$upload', 'Survey', 'Question', 'ImageCategory', 'DemoQuestion', 'SurveyCode', 'CommonCode', 'Initiative', 'InitPrefs',
		function ($scope, $http, $location, $upload, Survey, Question, ImageCategory, DemoQuestion, SurveyCode, CommonCode, Initiative, InitPrefs) {
			$scope.activeTab = "options";
//			$scope.activeTab = "makeLive";
			$scope.surveyOptions = {};
			$scope.survey = Survey.theone();
			$scope.instance = {};
			$scope.questions = Question.query({}, function(data){
			});
			$http.get('/load_live_survey').success(function(data){
//				console.log("LIVE: " + JSON.stringify(data));
				if (data){
//					console.log("GOT LIVE DATA " + JSON.stringify(data));
					$scope.instance = data;
					$scope.instance.final_date = new Date($scope.instance.final_date);
					$scope.dateSet = true;
				} else {
					console.log("NO LIVE SURVEY");
				}

			});
			$http.get('/get_survey_options').success(function(data){
				$scope.surveyOptions = data;
			});
			$scope.coNameChange = function(){
				$scope.optionChanged('companyName');
			};
			$scope.demoQuestions = DemoQuestion.query();
			$scope.imageCats = ImageCategory.query();
			$scope.imageCatImages = CommonCode.imageCatImages($scope);
			$scope.addCustomQ = function(){
				if ($scope.surveyOptions.newCustomQ){
					if ($scope.surveyOptions.customQuestions.indexOf($scope.surveyOptions.newCustomQ) >= 0){
						console.log("Repeat question");
						return;
					}
					$scope.surveyOptions.customQuestions.push($scope.surveyOptions.newCustomQ);
					$scope.surveyOptions.newCustomQ = "";
					$scope.optionChanged('customQuestions');
				}
			};
			$scope.delCustomQ = function(index){
				$scope.surveyOptions.customQuestions.splice(index, 1);
				$scope.optionChanged('customQuestions');
			};
			$scope.sortableCustomQ = {
				update: function(e, ui) {
							$scope.optionChanged('customQuestions');
						},
				start: function(e, ui){
			           ui.placeholder.height(ui.item.height());
					   },
				axis: 'y'
			};
			$scope.saving = 0;
			$scope.optionChanged = function(name, index){
				index = index || "";
				console.log("option changed: " + name + " index: " + index);
				var value = $scope.surveyOptions[name];
				console.log(value);
				if (index){
					var value = value[index];
				}
				console.log("option changed: " + name + " value: " + value);
				var data = {
					name: name,
					index: index,
					value: value
				};
				$scope.saving++;
				$http.post('update_survey_option', data)
					.success(function(){
						$scope.saving--;
					})
					.error(function(){
					});
			};
			$scope.previewSurvey = function(survey){
				SurveyCode.questionsLoaded($scope);
				SurveyCode.prepPreview($scope, $scope.survey);
				var askDemos = [];
				for (var i=0; i<$scope.demoQuestions.length; i++){
					var dq = $scope.demoQuestions[i];
					if ($scope.surveyOptions.demo[dq.id]){
						askDemos.push(dq);
					}
				}
				$scope.askDemos = askDemos;
				$("#previewModal").modal();
			};
			$scope.onFileSelect = function($files){
				for (var i = 0; i < $files.length; i++) {
					var file = $files[i];
					$scope.upload = $upload.upload({
						url: '/put_img',
						data: {},
						file: file,
					}).progress(function(evt) {
						console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
					}).success(function(data, status, headers, config) {
						// file is uploaded successfully
						$scope.surveyOptions.logoId = data.id;
						$scope.optionChanged('logoId');
					});
					//.error(...)
					//.then(success, error, progress); 
				}
			};
			$scope.removeLogo = function(){
				if (!confirm("really remove")) return;
				$scope.surveyOptions.logoId = "";
				$scope.optionChanged('logoId');
			};
			CommonCode.setupDatePicker($scope);
			$scope.surveyReady = function(){
				return $scope.sendToGroup && $scope.instanceName && $scope.final_date;
			};
			$scope.dateSet = false;
			$scope.setDate = function(){
				$scope.dateSet = true;
			};
			$scope.cancelLive = function(){

				$scope.dateSet = false;
				$scope.instance = {};
			};
			$scope.previewInstance = function(){
				$("#previewInstanceModal").modal();
			};
			$scope.makeLive = function(){
				console.log("MAKE LIVE");
				var data = {
					final_date: $scope.instance.final_date.getTime(),
					send_method: $scope.instance.sendMethod
				};
				$http.post('/survey_sendfull', data)
					.success(function(ret){
						console.log("Survey Sent!!!" + JSON.stringify(ret));
						$scope.instance = ret;
//						instance = ret;
					})
					.error(function(data, status, headers, config){
						if (status == 500){
							if (!$scope.alerts){
								$scope.alerts = [];
							}
							console.log("MSG: " + data);
						} else if (status == 400){
							console.log("400 error: " + JSON.stringify(data));
							$scope.alerts.push({type: "danger", msg: data});
						}
					});
			};
		}]);

ciqControllers.controller('AnalysisCtrl', ['$scope', 'Question',
		function ($scope, Question) {
			$scope.test = "this is a test string";
		}]);

