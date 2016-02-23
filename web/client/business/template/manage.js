define(
    ["business/module", "business/api"], function (module) {
        "use strict";

        module.controller("templateManageController", [
            "$scope", "$modal", "$routeParams", "templateApi",
            function($scope, $modal, $routeParams, templateApi){
                var generatorId = $routeParams.generatorId;

                $scope.searchRequest = {page:1, pageSize:10, generatorId:generatorId};

                $scope.pageSizeList = [10, 20, 50, 100];

                $scope.search = function(){
                    templateApi.search($scope.searchRequest).success(function(pagerResult){
                        $scope.pagerResult = pagerResult;
                    });
                };

                $scope.search();

            }
        ]);
    }
);