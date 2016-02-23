define(
    ["angular", "business/module", "business/api"],
    function (angular, module) {
        "use strict";

        module.controller("dataModelManageController", [
            "$scope", "$modal", "$routeParams", "dataModelApi", "templateStrategyApi", "dynamicModelApi", "generatorInstanceApi", "$q","alert",
            function($scope, $modal, $routeParams, dataModelApi, templateStrategyApi, dynamicModelApi, generatorInstanceApi, $q, alert){
                var generatorInstanceId = $routeParams.generatorInstanceId;
                var dynamicModelCache = {};
                var dataModelCache = {};
                var dynamicModelKeysCache = {};
                var $outScope = $scope;
                $scope.dataModel = {};
                $scope.validateMessageCache = {};

                $scope.hashKey = function(entity){
                    return entity.$$hashKey.split(":")[1];
                };

                $scope.validateMessages = {
                    name:{
                        required:"必输项",
                        maxlength:"最长50位"
                    }
                };

                $scope.getMessage = function(field, $error, validateMessages){
                    for(var k in $error)
                        return validateMessages[field][k];
                };

                generatorInstanceApi.get({id: generatorInstanceId}).success(function(generatorInstance){
                    $scope.generatorInstance = generatorInstance;

                    templateStrategyApi.query({generatorId:generatorInstance.generator.id}).success(function(templateStrategys){
                        $scope.templateStrategys = templateStrategys;
                        for(var i = 0 ; i < templateStrategys.length ; i++){
                            if(generatorInstance.templateStrategy && generatorInstance.templateStrategy.id == templateStrategys[i].id){
                                $scope.templateStrategyControl.selectedItem = templateStrategys[i];
                                break;
                            }
                        }
                    });

                    var dynamicModelApiQuery = dynamicModelApi.query({generatorId:generatorInstance.generator.id}).success(function(dynamicModels){
                        $scope.dynamicModels = dynamicModels;
                        var i;
                        var dynamicModel;
                        for(i = 0 ; i < dynamicModels.length ; i++){
                            dynamicModel = dynamicModels[i];
                            dynamicModelCache[dynamicModel.id] = dynamicModel;
                        }
                        for(i = 0 ; i < dynamicModels.length ; i++){
                            var j;
                            dynamicModel = dynamicModels[i];
                            var children = dynamicModel.children;
                            dynamicModel.children = [];
                            for(j = 0 ; j < children.length ; j++){
                                var child = children[j];
                                dynamicModel.children.push(dynamicModelCache[child.id]);
                            }

                            var propertiesMessages = {};
                            var associationMessages = {};
                            $scope.validateMessageCache[dynamicModel.id] = {
                                propertiesMessages:propertiesMessages,
                                associationMessages:associationMessages
                            };

                            var propertiesKeys = {dateTypeKeys:{},dataModelTypeKeys:{}};
                            var associationKeys = {dateTypeKeys:{},dataModelTypeKeys:{}};
                            dynamicModelKeysCache[dynamicModel.id] = {propertiesKeys: propertiesKeys, associationKeys:associationKeys};
                            for(j = 0 ; j < dynamicModel.properties.length ; j++){
                                var property = dynamicModel.properties[j];
                                if(property.type == "Date"){
                                    propertiesKeys.dateTypeKeys[property.name] = true;
                                }
                                else if(property.type == "Model"){
                                    propertiesKeys.dataModelTypeKeys[property.name] = true;
                                }

                                var validator = property.validator;
                                if(validator){
                                    var fieldMessages = propertiesMessages[property.name] = {};
                                    if(validator.required){
                                        fieldMessages.required = "必输项";
                                    }
                                    if(validator.min != null && validator.min != undefined){
                                        fieldMessages.min = "最小" + validator.min;
                                    }
                                    if(validator.max != null && validator.max != undefined){
                                        fieldMessages.max = "最大" + validator.max;
                                    }
                                    if(validator.minlength != null && validator.minlength != undefined){
                                        fieldMessages.minlength = "最短" + validator.minlength + "位";
                                    }
                                    if(validator.maxlength != null && validator.maxlength != undefined){
                                        fieldMessages.maxlength = "最长" + validator.maxlength + "位";
                                    }
                                    if(validator.pattern != null && validator.pattern != undefined){
                                        fieldMessages.pattern = "格式不匹配" + validator.pattern;
                                    }
                                }
                            }
                            for(j = 0 ; j < dynamicModel.association.length ; j++){
                                var property = dynamicModel.association[j];
                                if(property.type == "Date"){
                                    associationKeys.dateTypeKeys[property.name] = true;
                                }
                                else if(property.type == "Model"){
                                    associationKeys.dataModelTypeKeys[property.name] = true;
                                }

                                var validator = property.validator;
                                if(validator){
                                    var fieldMessages = associationMessages[property.name] = {};
                                    if(validator.required){
                                        fieldMessages.required = "必输项";
                                    }
                                    if(validator.min != null && validator.min != undefined){
                                        fieldMessages.min = "最小" + validator.min;
                                    }
                                    if(validator.max != null && validator.max != undefined){
                                        fieldMessages.max = "最大" + validator.max;
                                    }
                                    if(validator.minlength != null && validator.minlength != undefined){
                                        fieldMessages.minlength = "最短" + validator.minlength + "位";
                                    }
                                    if(validator.maxlength != null && validator.maxlength != undefined){
                                        fieldMessages.maxlength = "最长" + validator.maxlength + "位";
                                    }
                                    if(validator.pattern != null && validator.pattern != undefined){
                                        fieldMessages.pattern = "格式不匹配" + validator.pattern;
                                    }
                                }
                            }
                        }
                    });

                    var dataModel;
                    var dataModelApiTree = dataModelApi.tree({rootId: generatorInstance.dataModel.id}).success(function(_dataModel){
                        dataModel = _dataModel;
                    });

                    $q.all([dynamicModelApiQuery, dataModelApiTree]).then(function(){
                        var init = function(sourceDataModel, targetDataModel){
                            dataModelCache[targetDataModel.id] = targetDataModel;
                            targetDataModel.id = sourceDataModel.id;
                            targetDataModel.children = [];
                            for(var i = 0 ; i < sourceDataModel.children.length ; i++){
                                var sourceChild = sourceDataModel.children[i];
                                var targetChild = {
                                    id:sourceChild.id,
                                    name:sourceChild.name,
                                    parent:targetDataModel,
                                    dynamicModel: dynamicModelCache[sourceChild.dynamicModel.id],
                                    properties:{},
                                    association:[]
                                };
                                targetDataModel.children.push(targetChild);
                                init(sourceChild, targetChild);
                            }
                        };
                        init(dataModel, $scope.dataModel);
                    });
                });

                $scope.runResult = [];
                $scope.run = function(){
                    if(!$outScope.templateStrategyControl.selectedItem){
                        alert.show("未选择生成策略");
                        return;
                    }
                    $modal.open({
                        size: "lg",
                        templateUrl: "dataModel/console.html",
                        controller: ["$scope","$modalInstance",function ($scope, $modalInstance){
                            $scope.runResult = $outScope.runResult;
                            $scope.runResult.push({type:"message",content:"正在生成并压缩代码..."});
                            generatorInstanceApi.run({id:generatorInstanceId,templateStrategyId:$outScope.templateStrategyControl.selectedItem.id}).success(function(result){
                                if(angular.isArray(result)){
                                    $scope.runResult.push({type:"error",content :result});
                                }
                                else{
                                    $scope.runResult.push({type:"url",content :result});
                                }
                            });

                            $scope.confirm = function(){
                                $modalInstance.close();
                            };

                            $scope.clear = function(){
                                $scope.runResult.length = 0;
                            };
                        }]
                    });
                };

                $scope.consoleModalOpen = function(){
                    $modal.open({
                        size: "lg",
                        templateUrl: "dataModel/console.html",
                        controller: ["$scope","$modalInstance",function ($scope, $modalInstance){
                            $scope.runResult = $outScope.runResult;
                            $scope.confirm = function(){
                                $modalInstance.close();
                            };

                            $scope.clear = function(){
                                $scope.runResult.length = 0;
                            };
                        }]
                    });
                };

                $scope.templateStrategyControl = {
                    selectedItem: null,
                    select: function(templateStrategy){
                        generatorInstanceApi.update({id:generatorInstanceId, templateStrategyId:templateStrategy.id}).success(function(){
                            $scope.templateStrategyControl.selectedItem = templateStrategy;
                        });
                    }
                };

                $scope.dataModelControl = {
                    dirtyData:{
                        deleteData:{},
                        updateData:{},
                        hasDirtyData:function(){
                            var k;
                            for(k in $scope.dataModelControl.dirtyData.deleteData){
                                return true;
                            }
                            for(k in $scope.dataModelControl.dirtyData.updateData){
                                return true;
                            }
                            return false
                        },
                        addDeleteData:function(dataModel){
                            if(dataModel.id > 0){
                                $scope.dataModelControl.dirtyData.deleteData[dataModel.id] = dataModel;
                            }
                            delete $scope.dataModelControl.dirtyData.updateData[dataModel.id];
                        },
                        addUpdateData:function(dataModel){
                            $scope.dataModelControl.dirtyData.updateData[dataModel.id] = dataModel;
                        }
                    },
                    formatProperties:function(dynamicModel, properties){
                        var newProperties = {};
                        var dynamicModelKeys = dynamicModelKeysCache[dynamicModel.id];
                        for(var k in properties){
                            if(properties[k] == undefined || properties[k] == null){
                                continue;
                            }
                            if(k in dynamicModelKeys.propertiesKeys.dateTypeKeys){
                                newProperties[k] = new Date(properties[k]).getTime();
                            }
                            else if(k in dynamicModelKeys.propertiesKeys.dataModelTypeKeys){
                                newProperties[k] = properties[k].id;
                            }
                            else{
                                newProperties[k] = properties[k];
                            }
                        }
                        return newProperties;
                    },
                    formatAssociation:function(dynamicModel, association){
                        var newAssociation = [];
                        var dynamicModelKeys = dynamicModelKeysCache[dynamicModel.id];
                        for(var i = 0 ; i < association.length ;i++){
                            var property = association[i];
                            var newProperty = {};
                            for(var k in property){
                                if(property[k] == undefined || property[k] == null){
                                    continue;
                                }
                                if(k in dynamicModelKeys.associationKeys.dateTypeKeys){
                                    newProperty[k] = new Date(property[k]).getTime();
                                }
                                else if(k in dynamicModelKeys.associationKeys.dataModelTypeKeys){
                                    newProperty[k] = property[k].id;
                                }
                                else{
                                    newProperty[k] = property[k];
                                }
                            }
                            newAssociation.push(newProperty);
                        }
                        return newAssociation;
                    },
                    saveDirty: function(){
                        var data = $scope.dataModelControl.dirtyData;
                        var k;
                        for(k in data.updateData){
                            (function(){
                                var dataModel = data.updateData[k];
                                dataModelApi.update({
                                    id:dataModel.id,
                                    rootId:$scope.generatorInstance.dataModel.id,
                                    name:dataModel.name,
                                    dynamicModelId:dataModel.dynamicModel.id,
                                    properties:$scope.dataModelControl.formatProperties(dataModel.dynamicModel,dataModel.properties),
                                    association:$scope.dataModelControl.formatAssociation(dataModel.dynamicModel,dataModel.association)
                                }).success(function(){
                                    delete data.updateData[dataModel.id];
                                    if(dataModel.$scope && dataModel.$scope.dataModelEditForm){
                                        dataModel.$scope.dataModelEditForm.$setPristine();
                                    }
                                });
                            })();
                        }
                        for(k in data.deleteData){
                            (function(){
                                var dataModel = data.deleteData[k];
                                dataModelApi.delete({
                                    id:dataModel.id,
                                    rootId:$scope.generatorInstance.dataModel.id
                                }).success(function(){
                                    delete data.deleteData[dataModel.id];
                                });
                            })();
                        }
                    },
                    index: new Date().getTime(),
                    add: function(dynamicModel, parent){
                        parent = parent == null ? $scope.dataModel : parent;
                        var id = ($scope.dataModelControl.index++).toString(32);

                        var dynamicModelProperties = dynamicModel.properties;
                        var properties = {};
                        for(var i = 0 ; i < dynamicModelProperties.length ; i++){
                            var property = dynamicModelProperties[i];
                            if(property.defaultValue != null){
                                properties[property.name] = property.defaultValue;
                            }
                        }

                        var dataModel = {id: 0 - id, dynamicModel: dynamicModel, parent:parent, properties:properties, association:[], name:"新建" + dynamicModel.name + "_" + id,$view:true};
                        dataModelApi.create({
                            rootId:$scope.generatorInstance.dataModel.id,
                            name:dataModel.name,
                            dynamicModelId:dataModel.dynamicModel.id,
                            generatorInstanceId:$scope.generatorInstance.id,
                            parentId:dataModel.parent.id,
                            properties:dataModel.properties,
                            association:dataModel.association
                        }).success(function(d){
                            dataModel.id = d.id;
                            dataModelCache[dataModel.id] = dataModel;
                            if(dataModel.$scope && dataModel.$scope.dataModelEditForm){
                                dataModel.$scope.dataModelEditForm.$setPristine();
                            }
                            if(!parent.children){
                                parent.children = [];
                            }
                            parent.children.push(dataModel);
                            parent.$expend = true;
                            $scope.tabsControl.add(dataModel);
                        });
                    },
                    view:function(dataModel){
                        if(dataModel.$view || $scope.tabsControl.contains(dataModel)){
                            $scope.tabsControl.add(dataModel);
                        }
                        else{
                            dataModelApi.get({id:dataModel.id, rootId: $scope.generatorInstance.dataModel.id}).success(function(dm){
                                dataModel.$view = true;
                                dataModel.properties = dm.properties;
                                dataModel.association = dm.association;

                                var dynamicModelKeys = dynamicModelKeysCache[dataModel.dynamicModel.id];
                                for(var k in dataModel.properties){
                                    if(k in dynamicModelKeys.propertiesKeys.dataModelTypeKeys){
                                        var propertyDataModel = dataModelCache[dataModel.properties[k]];
                                        dataModel.properties[k] = {id:propertyDataModel.id,name:propertyDataModel.name};
                                    }
                                }
                                for(var i = 0 ; i < dataModel.association.length ;i++){
                                    var property = dataModel.association[i];
                                    for(var k in property){
                                        if(k in dynamicModelKeys.associationKeys.dataModelTypeKeys){
                                            var propertyDataModel = dataModelCache[property[k]];
                                            property[k] = {id:propertyDataModel.id,name:propertyDataModel.name};
                                        }
                                    }
                                }

                                $scope.tabsControl.add(dataModel);
                            });
                        }
                    },
                    "delete":function(parent, $index, child){
                        parent.children.splice($index, 1);
                        delete dataModelCache[child.id];
                        $scope.dataModelControl.dirtyData.addDeleteData(child);
                        $scope.tabsControl.remove(child);
                    }
                };

                $scope.tabsControl = {
                    data:[],
                    add:function(dataModel){
                        $scope.tabsControl.remove(dataModel);
                        dataModel.active = true;
                        $scope.tabsControl.data.splice(0, 0, dataModel);
                        if($scope.tabsControl.data.length > 20){
                            $scope.tabsControl.data.length = 20;
                        }
                    },
                    contains:function(dataModel){
                        var data = $scope.tabsControl.data;
                        for(var i = 0 ; i < data.length ; i++){
                            if(dataModel == data[i]){
                                return true;
                            }
                        }
                        return false;
                    },
                    remove:function(dataModel){
                        var data = $scope.tabsControl.data;
                        for(var i = 0 ; i < data.length ; i++){
                            if(dataModel == data[i]){
                                data.splice(i, 1);
                                break;
                            }
                        }
                    },
                    initScope:function(dataModel, $scope){
                        dataModel.$scope = $scope;
                        $scope.sortableOptions ={
                            update: function(e, ui) {
                            },
                            stop: function(e, ui) {
                                $scope.dataModelEditForm.$setDirty();
                            }
                        };
                        $scope.$watch("dataModelEditForm.$dirty",function(newValue, oldValue){
                            if(newValue){
                                $scope.dataModelControl.dirtyData.addUpdateData(dataModel);
                            }
                        });
                    },
                    addProperty:function(dataModel){
                        var association = dataModel.dynamicModel.association;
                        var record = {};
                        for(var i = 0 ; i < association.length ; i++){
                            var property = association[i];
                            if(property.defaultValue != null){
                                record[property.name] = property.defaultValue;
                            }
                        }
                        dataModel.association.push(record);
                        dataModel.$scope.dataModelEditForm.$setDirty();
                    },
                    removeProperty:function(dataModel, $index){
                        dataModel.association.splice($index, 1);
                        dataModel.$scope.dataModelEditForm.$setDirty();
                    }
                };

                $scope.dataModelPickerModalOpen = function(dataModel, valueModel, propertyName, title, $ctrl){
                    $modal.open({
                        templateUrl: "dataModel/dataModelPicker.html",
                        controller: ["$scope","$modalInstance",function ($scope, $modalInstance){
                            $scope.dataModel = $outScope.dataModel;
                            $scope.title = "选择" + title;

                            $scope.select = function(selectDataModel){
                                valueModel[propertyName] = {id:selectDataModel.id,name:selectDataModel.name};
                                $outScope.dataModelControl.dirtyData.addUpdateData(dataModel);
                                $modalInstance.close();
                            };

                            $scope.clear = function(){
                                valueModel[propertyName] = null;
                                $ctrl.$setViewValue(null);
                                $ctrl.$render();
                                $outScope.dataModelControl.dirtyData.addUpdateData(dataModel);
                                $modalInstance.close();
                            };

                            $scope.confirm = function(){
                                $modalInstance.close();
                            };

                        }]
                    });
                };

            }
        ]);
    }
);