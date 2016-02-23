define(
    ["business/module", "business/api"], function (module) {
        "use strict";

        module.controller("generatorManageController", [
            "$scope", "$modal", "generatorApi", "security",
            function($scope, $modal, generatorApi, security){
                var user = security.getUser();
                $scope.searchRequest = {page:1, pageSize:10, developerId: user.id};

                $scope.pageSizeList = [10, 20, 50, 100];

                $scope.statuses = [
                    {isOpen:true,name:"公开"},
                    {isOpen:false,name:"私有"}
                ];

                $scope.search = function(){
                    generatorApi.search($scope.searchRequest).success(function(pagerResult){
                        $scope.pagerResult = pagerResult;
                    });
                };

                $scope.search();

            }
        ]);
    }
);