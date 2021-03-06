define(
    ["business/module", "business/api"],
    function (module) {
        "use strict";

        module.controller("templateStrategyManageController", [
            "$scope", "$routeParams", "templateStrategyApi", "viewPage", "confirm",
            function($scope, $routeParams, templateStrategyApi, viewPage, confirm){
                viewPage.setViewPageTitle("生成策略管理");
                var generatorId = $routeParams.generatorId;

                $scope.queryRequest = {generatorId:generatorId};

                $scope.query = function(){
                    templateStrategyApi.query($scope.queryRequest).success(function(templateStrategys){
                        $scope.templateStrategys = templateStrategys;
                    });
                };

                $scope.delete = function(templateStrategy){
                    confirm.open({
                        title:"删除",
                        message:"确定删除【" + templateStrategy.name +"】？",
                        confirm:function(){
                            templateStrategyApi.delete({id:templateStrategy.id}).success(function(){
                                $scope.query();
                            });
                        }
                    });
                };

                $scope.sortableOptions = {
                    update: function(e, ui) {
                        templateStrategyApi.sort({
                            id:ui.item.sortable.model.id,
                            fromIndex:ui.item.sortable.index,
                            toIndex:ui.item.sortable.dropindex
                        });
                    },
                    stop: function(e, ui) {

                    }
                };

                $scope.query();

            }
        ]);
    }
);
