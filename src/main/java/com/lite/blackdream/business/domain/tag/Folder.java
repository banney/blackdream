package com.lite.blackdream.business.domain.tag;

import com.lite.blackdream.framework.el.Context;
import com.lite.blackdream.framework.el.Parser;
import com.lite.blackdream.framework.util.FileUtil;

/**
 * @author LaineyC
 */
public class Folder extends Tag {

    private String name;

    public Folder(){

    }

    public Folder clone(){
        Folder folder = (Folder)super.clone();
        folder.setName(this.getName());
        return folder;
    }

    public void execute(Context context){
        Context exeContext = new Context();
        exeContext.mergeVariable(context);
        Global global = (Global)context.getVariable("global");
        Long generateId = global.getGenerateId();
        Long userId = global.getUser().getId();
        String generatePath = FileUtil.codebasePath + FileUtil.fileSeparator + userId + FileUtil.fileSeparator + generateId;
        String folder = generatePath + FileUtil.fileSeparator + this.getName();
        folder = Parser.parseString(folder.replace(FileUtil.fileSeparator, "/"), exeContext);
        FileUtil.mkdirs(folder);
        this.getChildren().forEach(child -> {
            child.setParent(this);
            child.execute(exeContext);
        });
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}