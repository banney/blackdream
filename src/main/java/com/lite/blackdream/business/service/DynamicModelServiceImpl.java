package com.lite.blackdream.business.service;

import com.lite.blackdream.business.domain.DynamicModel;
import com.lite.blackdream.business.domain.Generator;
import com.lite.blackdream.business.domain.User;
import com.lite.blackdream.business.parameter.dynamicmodel.*;
import com.lite.blackdream.business.repository.DynamicModelRepository;
import com.lite.blackdream.business.repository.GeneratorRepository;
import com.lite.blackdream.business.repository.UserRepository;
import com.lite.blackdream.framework.exception.AppException;
import com.lite.blackdream.framework.component.BaseService;
import com.lite.blackdream.framework.model.PagerResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @author LaineyC
 */
@Service
public class DynamicModelServiceImpl extends BaseService implements DynamicModelService {

    @Autowired
    private DynamicModelRepository dynamicModelRepository;

    @Autowired
    private GeneratorRepository generatorRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public DynamicModel create(DynamicModelCreateRequest request) {
        Long userId = request.getAuthentication().getUserId();

        Long generatorId = request.getGeneratorId();
        Generator generatorPersistence = generatorRepository.selectById(generatorId);
        if(generatorPersistence == null){
            throw new AppException("生成器不存在");
        }

        DynamicModel dynamicModel = new DynamicModel();
        dynamicModel.setId(idWorker.nextId());
        dynamicModel.setName(request.getName());
        dynamicModel.setCreateDate(new Date());
        dynamicModel.setModifyDate(new Date());
        dynamicModel.setSequence(Integer.MAX_VALUE);
        dynamicModel.setIcon(request.getIcon());
        dynamicModel.setIsRootChild(request.getIsRootChild());
        dynamicModel.setIsDelete(false);
        User developer = new User();
        developer.setId(userId);
        dynamicModel.setDeveloper(developer);
        Generator generator = new Generator();
        generator.setId(generatorPersistence.getId());
        dynamicModel.setGenerator(generator);
        dynamicModel.setProperties(request.getProperties());
        dynamicModel.setAssociation(request.getAssociation());
        dynamicModel.setPredefinedAssociation(request.getPredefinedAssociation());
        for(Long childId : request.getChildren()){
            DynamicModel child = new DynamicModel();
            child.setId(childId == 0 ? dynamicModel.getId() : childId);
            dynamicModel.getChildren().add(child);
        }
        dynamicModelRepository.insert(dynamicModel);

        generatorPersistence.setIsOpen(false);
        generatorPersistence.setModifyDate(new Date());
        generatorRepository.update(generatorPersistence);

        return dynamicModel;
    }

    @Override
    public DynamicModel delete(DynamicModelDeleteRequest request) {
        Long id = request.getId();
        DynamicModel dynamicModelPersistence = dynamicModelRepository.selectById(id);
        if(dynamicModelPersistence == null){
            throw new AppException("数据模型不存在");
        }

        Long userId = request.getAuthentication().getUserId();
        if(!userId.equals(dynamicModelPersistence.getDeveloper().getId())){
            throw new AppException("权限不足");
        }

        Generator generatorPersistence = generatorRepository.selectById(dynamicModelPersistence.getGenerator().getId());
        if(generatorPersistence == null){
            throw new AppException("生成器不存在");
        }

        if(generatorPersistence.getIsApplied()){
            throw new AppException("生成器已被应用不能删除");
        }

        dynamicModelRepository.delete(dynamicModelPersistence);

        generatorPersistence.setIsOpen(false);
        generatorPersistence.setModifyDate(new Date());
        generatorRepository.update(generatorPersistence);

        return dynamicModelPersistence;
    }

    @Override
    public DynamicModel get(DynamicModelGetRequest request) {
        Long id = request.getId();
        DynamicModel dynamicModelPersistence = dynamicModelRepository.selectById(id);
        if(dynamicModelPersistence == null){
            throw new AppException("数据模型不存在");
        }
        DynamicModel dynamicModel = new DynamicModel();
        dynamicModel.setId(dynamicModelPersistence.getId());
        dynamicModel.setCreateDate(dynamicModelPersistence.getCreateDate());
        dynamicModel.setModifyDate(dynamicModelPersistence.getModifyDate());
        dynamicModel.setName(dynamicModelPersistence.getName());
        dynamicModel.setIcon(dynamicModelPersistence.getIcon());
        dynamicModel.setIsRootChild(dynamicModelPersistence.getIsRootChild());
        dynamicModel.setProperties(dynamicModelPersistence.getProperties());
        dynamicModel.setAssociation(dynamicModelPersistence.getAssociation());
        dynamicModel.setPredefinedAssociation(dynamicModelPersistence.getPredefinedAssociation());
        User developerPersistence = userRepository.selectById(dynamicModelPersistence.getDeveloper().getId());
        dynamicModel.setDeveloper(developerPersistence);

        Long generatorId = dynamicModelPersistence.getGenerator().getId();
        Generator generatorPersistence = generatorRepository.selectById(generatorId);
        if(generatorPersistence == null){
            throw new AppException("生成器不存在");
        }
        dynamicModel.setGenerator(generatorPersistence);

        dynamicModelPersistence.getChildren().forEach(child -> {
            DynamicModel c = dynamicModelRepository.selectById(child.getId());
            if(c != null){
                dynamicModel.getChildren().add(c);
            }
        });
        return dynamicModel;
    }

    @Override
    public PagerResult<DynamicModel> search(DynamicModelSearchRequest request) {
        Long generatorId = request.getGeneratorId();
        String name = StringUtils.hasText(request.getName())  ? request.getName() : null;
        List<DynamicModel> records = dynamicModelRepository.filter(dynamicModel -> {
            if (dynamicModel.getIsDelete()) {
                return false;
            }
            if (name != null) {
                if (!dynamicModel.getName().contains(name)) {
                    return false;
                }
            }
            if (generatorId != null) {
                if (!generatorId.equals(dynamicModel.getGenerator().getId())) {
                    return false;
                }
            }
            return true;
        });
        Integer page = request.getPage();
        Integer pageSize = request.getPageSize();
        Integer fromIndex = (page - 1) * pageSize;
        Integer toIndex = fromIndex + pageSize > records.size() ? records.size() : fromIndex + pageSize;
        List<DynamicModel> limitRecords = records.subList(fromIndex, toIndex);
        List<DynamicModel> result = new ArrayList<>();
        for(DynamicModel d : limitRecords){
            DynamicModel dynamicModel = new DynamicModel();
            dynamicModel.setId(d.getId());
            dynamicModel.setName(d.getName());
            dynamicModel.setCreateDate(d.getCreateDate());
            dynamicModel.setModifyDate(d.getModifyDate());
            dynamicModel.setIcon(d.getIcon());
            dynamicModel.setIsRootChild(d.getIsRootChild());
            //dynamicModel.setProperties(d.getProperties());
            //dynamicModel.setAssociation(d.getAssociation());
            User developerPersistence = userRepository.selectById(d.getDeveloper().getId());
            dynamicModel.setDeveloper(developerPersistence);
            Generator generatorPersistence = generatorRepository.selectById(d.getGenerator().getId());
            if(generatorPersistence == null){
                throw new AppException("生成器不存在");
            }
            dynamicModel.setGenerator(generatorPersistence);
            d.getChildren().forEach(child -> {
                DynamicModel c = dynamicModelRepository.selectById(child.getId());
                if (c != null) {
                    dynamicModel.getChildren().add(c);
                }
            });
            result.add(dynamicModel);
        }
        return new PagerResult<>(result, (long)records.size());
    }

    @Override
    public List<DynamicModel> query(DynamicModelQueryRequest request) {
        DynamicModel dynamicModelTemplate = new DynamicModel();
        Long generatorId = request.getGeneratorId();
        Generator generator = new Generator();
        generator.setId(generatorId);
        dynamicModelTemplate.setGenerator(generator);

        List<DynamicModel> records = dynamicModelRepository.selectList(dynamicModelTemplate);
        List<DynamicModel> result = new ArrayList<>();
        for(DynamicModel d : records){
            DynamicModel dynamicModel = new DynamicModel();
            dynamicModel.setId(d.getId());
            dynamicModel.setName(d.getName());
            dynamicModel.setCreateDate(d.getCreateDate());
            dynamicModel.setModifyDate(d.getModifyDate());
            dynamicModel.setSequence(d.getSequence());
            dynamicModel.setIcon(d.getIcon());
            dynamicModel.setIsRootChild(d.getIsRootChild());
            dynamicModel.setProperties(d.getProperties());
            dynamicModel.setAssociation(d.getAssociation());
            dynamicModel.setPredefinedAssociation(d.getPredefinedAssociation());

            Generator generatorPersistence = generatorRepository.selectById(generatorId);
            if(generatorPersistence == null){
                throw new AppException("生成器不存在");
            }
            dynamicModel.setGenerator(generatorPersistence);

            d.getChildren().forEach(child -> {
                DynamicModel c = dynamicModelRepository.selectById(child.getId());
                if (c != null) {
                    DynamicModel dynamicModelChild = new DynamicModel();
                    dynamicModelChild.setId(c.getId());
                    dynamicModelChild.setName(c.getName());
                    dynamicModelChild.setModifyDate(c.getModifyDate());
                    dynamicModelChild.setIcon(c.getIcon());
                    dynamicModelChild.setIsRootChild(c.getIsRootChild());
                    dynamicModel.getChildren().add(dynamicModelChild);
                }
            });
            result.add(dynamicModel);
        }
        result.sort((d1, d2) -> {
            int s1 = d1.getSequence();
            int s2 = d2.getSequence();
            return s1 == s2 ? (int)(d1.getId() - d2.getId()) : s1 - s2;
        });
        return result;
    }

    @Override
    public DynamicModel update(DynamicModelUpdateRequest request) {
        Long id = request.getId();
        DynamicModel dynamicModelPersistence = dynamicModelRepository.selectById(id);
        if(dynamicModelPersistence == null) {
            throw new AppException("数据模型不存在");
        }

        Generator generatorPersistence = generatorRepository.selectById(dynamicModelPersistence.getGenerator().getId());
        if(generatorPersistence == null){
            throw new AppException("生成器不存在");
        }

        Long userId = request.getAuthentication().getUserId();
        if(!userId.equals(generatorPersistence.getDeveloper().getId())){
            throw new AppException("权限不足");
        }

        dynamicModelPersistence.setName(request.getName());
        dynamicModelPersistence.setModifyDate(new Date());
        dynamicModelPersistence.setIcon(request.getIcon());
        dynamicModelPersistence.setIsRootChild(request.getIsRootChild());
        dynamicModelPersistence.getChildren().clear();
        for(Long childId : request.getChildren()){
            DynamicModel child = new DynamicModel();
            child.setId(childId);
            dynamicModelPersistence.getChildren().add(child);
        }
        dynamicModelPersistence.setProperties(request.getProperties());
        dynamicModelPersistence.setAssociation(request.getAssociation());
        dynamicModelPersistence.setPredefinedAssociation(request.getPredefinedAssociation());
        dynamicModelRepository.update(dynamicModelPersistence);

        generatorPersistence.setIsOpen(false);
        generatorPersistence.setModifyDate(new Date());
        generatorRepository.update(generatorPersistence);

        return dynamicModelPersistence;
    }

    @Override
    public DynamicModel sort(DynamicModelSortRequest request) {
        Long id = request.getId();
        DynamicModel dynamicModelPersistence = dynamicModelRepository.selectById(id);
        if(dynamicModelPersistence == null){
            throw new AppException("数据模型不存在");
        }

        Long userId = request.getAuthentication().getUserId();
        if(!userId.equals(dynamicModelPersistence.getDeveloper().getId())){
            throw new AppException("权限不足");
        }

        Generator generatorPersistence = generatorRepository.selectById(dynamicModelPersistence.getGenerator().getId());
        if(generatorPersistence == null){
            throw new AppException("生成器不存在");
        }

        DynamicModel dynamicModelTemplate = new DynamicModel();
        dynamicModelTemplate.setIsDelete(false);
        dynamicModelTemplate.setGenerator(dynamicModelPersistence.getGenerator());
        List<DynamicModel> records = dynamicModelRepository.selectList(dynamicModelTemplate);

        int fromIndex = request.getFromIndex();
        int toIndex = request.getToIndex();
        int size = records.size();
        if(size == 0 || toIndex > size - 1 || fromIndex > size - 1){
            throw new AppException("请保存并刷新数据，重新操作！");
        }

        records.sort((t1, t2) -> {
            int s1 = t1.getSequence();
            int s2 = t2.getSequence();
            return s1 == s2 ? (int)(t1.getId() - t2.getId()) : s1 - s2;
        });

        if(dynamicModelPersistence != records.remove(fromIndex)){
            throw new AppException("请保存并刷新数据，重新操作！");
        }
        records.add(toIndex, dynamicModelPersistence);

        int sequence = 1;
        for(DynamicModel d : records){
            if(sequence != d.getSequence()) {
                d.setSequence(sequence);
                d.setModifyDate(new Date());
                dynamicModelRepository.update(d);
            }
            sequence++;
        }

        generatorPersistence.setModifyDate(new Date());
        generatorRepository.update(generatorPersistence);

        return dynamicModelPersistence;
    }

}
