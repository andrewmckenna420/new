var ciqApp = angular.module('ciqApp', [
		'ngRoute',
		'ciqControllers',
		'ciqServices',
		'ciqFilters',
		'ciqDirectives'
		]);

ciqApp.config(['$routeProvider', function($routeProvider){
	$routeProvider.
	when('/questions', {
		templateUrl: '/static/partials/question-list.html',
		controller: 'QuestionListCtrl'
	}).
	when('/questions/:qid', {
		templateUrl: '/static/partials/question-edit.html',
		controller: 'QuestionEditCtrl'
	}).
	when('/questions_img_cats/:qid', {
		templateUrl: '/static/partials/question-images-edit.html',
		controller: 'QuestionImagesEditCtrl'
	}).
	when('/questions_demo/:qid', {
		templateUrl: '/static/partials/question-demo-edit.html',
		controller: 'QuestionDemoEditCtrl'
	}).
	when('/surveys', {
		templateUrl: '/static/partials/survey-list.html',
		controller: 'SurveyListCtrl'
	}).
	when('/surveys/preview/:sid', {
		templateUrl: '/static/partials/survey-preview.html',
		controller: 'SurveyPreviewCtrl'
	}).
	when('/surveys/send/:sid', {
		templateUrl: '/static/partials/survey-send.html',
		controller: 'SurveySendCtrl'
	}).
	when('/surveys/:sid', {
		templateUrl: '/static/partials/survey-edit.html',
		controller: 'SurveyEditCtrl'
	}).
	when('/sent', {
		templateUrl: '/static/partials/sent-list.html',
		controller: 'SentListCtrl'
	}).
	when('/customers', {
		templateUrl: '/static/partials/customer-list.html',
		controller: 'CustomerListCtrl'
	}).
	when('/customers/:cid', {
		templateUrl: '/static/partials/customer-edit.html',
		controller: 'CustomerEditCtrl'
	}).
	when('/employees', {
		templateUrl: '/static/partials/employee-list.html',
		controller: 'EmployeeListCtrl'
	}).
	when('/initiatives_admin', {
		templateUrl: '/static/partials/initiative-admin-list.html',
		controller: 'InitiativeAdminListCtrl'
	}).
	when('/initiatives_admin/:oid', {
		templateUrl: '/static/partials/initiative-edit.html',
		controller: 'InitiativeEditCtrl'
	}).
	when('/initiatives', {
		templateUrl: '/static/partials/initiative-list.html',
		controller: 'InitiativeListCtrl'
	}).
	when('/initiatives/:oid', {
		templateUrl: '/static/partials/initiative-profile.html',
		controller: 'InitiativeEditCtrl'
	}).
	when('/survey_mgmt', {
		templateUrl: '/static/partials/survey-mgmt.html',
		controller: 'SurveyMgmtCtrl'
	}).
//	when('/survey_mgmt/sendfull', {
//		templateUrl: '/static/partials/sendfull.html',
//		controller: 'SendFullCtrl'
//	}).
//	when('/survey_mgmt/sendbuyin', {
//		templateUrl: '/static/partials/sendbuyin.html',
//		controller: 'SendBuyinCtrl'
//	}).
	when('/survey_mgmt/fullsurvey', {
		templateUrl: '/static/partials/fullsurvey.html',
		controller: 'FullSurveyCtrl'
	}).
	when('/survey_mgmt/:oid', {
		templateUrl: '/static/partials/sent-details.html',
		controller: 'SentDetailsCtrl'
	}).
	when('/analysis', {
		templateUrl: '/static/partials/analysis.html',
		controller: 'AnalysisCtrl'
	}).
	otherwise({
		redirectTo: '/dashboard'
	});
}]);

// django token
ciqApp.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.common['X-CSRFToken'] = $.cookie('csrftoken');
}]);

ciqApp.run(function($rootScope, $window) {
	$rootScope.cats = $window.cats;
	$rootScope.qtypes = $window.qtypes;
	$rootScope.scaleText = $window.scaleText;
	$rootScope.ciqAdmin = $window.ciqAdmin;
	$rootScope.nameFromId = function(lid, list){
		for (var i=0; i< list.length; i++){
			if (list[i][0] == lid)
				return list[i][1];
		}
		return "NOT FOUND";
	};
	$rootScope.noSpoof = function(){
		$.removeCookie('spoofCust');
		$window.location.href = "/app";
	};
	$rootScope.btnClass = "btn btn-primary";
	$rootScope.btnCheckboxClass = "btn btn-primary btn-checkbox";
});
