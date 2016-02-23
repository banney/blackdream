package com.lite.blackdream.business.controller;

import com.lite.blackdream.business.domain.GeneratorInstance;
import com.lite.blackdream.business.parameter.generatorinstance.*;
import com.lite.blackdream.business.service.GeneratorInstanceService;
import com.lite.blackdream.framework.layer.BaseController;
import com.lite.blackdream.framework.model.PagerResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author LaineyC
 */
@Controller
public class GeneratorInstanceController extends BaseController {

    @Autowired
    private GeneratorInstanceService generatorInstanceService;

    @ResponseBody
    @RequestMapping(params="method=generatorInstance.create")
    public GeneratorInstanceCreateResponse create(GeneratorInstanceCreateRequest request) {
        GeneratorInstance generatorInstance = generatorInstanceService.create(request);
        return new GeneratorInstanceCreateResponse(generatorInstance);
    }

    @ResponseBody
    @RequestMapping(params="method=generatorInstance.delete")
    public GeneratorInstanceDeleteResponse delete(GeneratorInstanceDeleteRequest request) {
        GeneratorInstance generatorInstance = generatorInstanceService.delete(request);
        return new GeneratorInstanceDeleteResponse(generatorInstance);
    }

    @ResponseBody
    @RequestMapping(params="method=generatorInstance.get")
    public GeneratorInstanceGetResponse get(GeneratorInstanceGetRequest request) {
        GeneratorInstance generatorInstance = generatorInstanceService.get(request);
        return new GeneratorInstanceGetResponse(generatorInstance);
    }

    @ResponseBody
    @RequestMapping(params="method=generatorInstance.search")
    public GeneratorInstanceSearchResponse search(GeneratorInstanceSearchRequest request) {
        PagerResult<GeneratorInstance> pagerResult = generatorInstanceService.search(request);
        return new GeneratorInstanceSearchResponse(pagerResult);
    }

    @ResponseBody
    @RequestMapping(params="method=generatorInstance.update")
    public GeneratorInstanceUpdateResponse update(GeneratorInstanceUpdateRequest request) {
        GeneratorInstance generatorInstance = generatorInstanceService.update(request);
        return new GeneratorInstanceUpdateResponse(generatorInstance);
    }

    @ResponseBody
    @RequestMapping(params="method=generatorInstance.run")
    public GeneratorInstanceRunResponse run(GeneratorInstanceRunRequest request) {
        Object result = generatorInstanceService.run(request);
        return new GeneratorInstanceRunResponse(result);
    }

}