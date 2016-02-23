package com.lite.blackdream.business.controller;

import com.lite.blackdream.business.domain.User;
import com.lite.blackdream.business.parameter.user.*;
import com.lite.blackdream.business.service.UserService;
import com.lite.blackdream.framework.layer.BaseController;
import com.lite.blackdream.framework.model.PagerResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import javax.servlet.http.HttpServletRequest;

/**
 * @author LaineyC
 */
@Controller
public class UserController extends BaseController {

    @Autowired
    private UserService userService;

    @ResponseBody
    @RequestMapping(params="method=user.create")
    public UserCreateResponse create(UserCreateRequest request) {
        User user = userService.create(request);
        return new UserCreateResponse(user);
    }

    @ResponseBody
    @RequestMapping(params="method=user.get")
    public UserGetResponse get(UserGetRequest request) {
        User user = userService.get(request);
        return new UserGetResponse(user);
    }

    @ResponseBody
    @RequestMapping(params="method=user.login")
    public UserLoginResponse login(UserLoginRequest request, HttpServletRequest servletRequest) {
        User user = userService.login(request);
        servletRequest.getSession().setAttribute("user", user);
        return new UserLoginResponse(user);
    }

    @ResponseBody
    @RequestMapping(params="method=user.logout")
    public UserLogoutResponse logout(UserLogoutRequest request, HttpServletRequest servletRequest) {
        servletRequest.getSession().removeAttribute("user");
        return new UserLogoutResponse(null);
    }

    @ResponseBody
    @RequestMapping(params="method=user.password.update")
    public UserPasswordUpdateResponse passwordUpdate(UserPasswordUpdateRequest request) {
        userService.passwordUpdate(request);
        return new UserPasswordUpdateResponse(null);
    }

    @ResponseBody
    @RequestMapping(params="method=user.search")
    public UserSearchResponse search(UserSearchRequest request) {
        PagerResult<User> pagerResult = userService.search(request);
        return new UserSearchResponse(pagerResult);
    }

    @ResponseBody
    @RequestMapping(params="method=user.update")
    public UserUpdateResponse update(UserUpdateRequest request) {
        User user = userService.update(request);
        return new UserUpdateResponse(user);
    }

}