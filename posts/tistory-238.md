---
title: "[Spring] 직접 만들어 본 MVC와 Spring MVC 비교"
kind: "article"
permalink: "/posts/tistory-238.html"
published_on: "2022-11-21"
section: "프로젝트"
category: "프로젝트 / Spring Basic"
---

## **Spring Web MVC Framework**

![본문 이미지](../assets/tistory/29e0ad143fa0962657f2ea65.png)

Spring Web MVC 프레임워크 구조

1. **DispatcherServlet**에서 요청을 받는다.
2. **HandlerMapping**을 통해 적절한 **Handler**(=**Controller**)를 선택한다.
3. **DispatcherServlet**에서 **HandlerAdapter**을 통해 선택한 **Handler**를 실행한다.
4. **Handler**는 **view name**을 반환한다.
5. **DispatcherServlet**이 **view name**을 **View Resolver**에게 전달한다.
6. **View Resolver**는 적절한 **view**를 선택한다.
7. **DispatcherServlet**에서 **view를** 클라이언트에게 전달한다.

---

### **직접 구현한 코드를 통해 알아보기**

**1.** **DispatcherServlet**에서 모든 요청에 받는다.

```java
package org.example.mvc;

@WebServlet("/")
public class DispatcherServlet extends HttpServlet {
    ...
}
```

**2.** **HandlerMapping**을 통해 적절한 **Handler**(=**Controller**)를 선택한다.

```java
package org.example.mvc;

@WebServlet("/")
public class DispatcherServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException {
        String requestURI = request.getRequestURI();
        RequestMethod requestMethod = RequestMethod.valueOf(request.getMethod());

        Object handler = handlerMappings.stream()
                .filter(hm -> hm.findHandler(new HandlerKey(requestURI, requestMethod)) != null)
                .map(hm -> hm.findHandler(new HandlerKey(requestURI, requestMethod)))
                .findFirst()
                .orElseThrow(() -> new ServletException("No handler for [" + requestMethod + ", " + requestURI + "]"));
    }
}
```

**3.** **DispatcherServlet**에서 **HandlerAdapter**을 통해 선택한 **Handler**를 실행한다.

```java
package org.example.mvc;

@WebServlet("/")
public class DispatcherServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException {
        ...
        HandlerAdapter handlerAdapter = handlerAdapters.stream()
                .filter(ha -> ha.supports(handler))
                .findFirst()
                .orElseThrow(() -> new ServletException("No adapter for handler [" + handler + "]"));

        ModelAndView modelAndView = handlerAdapter.handle(request, response, handler);
    }
}
```

**4. Handler**는 **view name**을 반환한다.

```java
public class SimpleControllerHandlerAdapter implements HandlerAdapter {
    @Override
    public boolean supports(Object handler) {
        return (handler instanceof Controller);
    }

    @Override
    public ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String viewName = ((Controller) handler).handleRequest(request, response);
        return new ModelAndView(viewName);
    }
}
```

**5.** **DispatcherServlet**이 **view name**을 **View Resolver**에게 전달한다.

**6. View Resolver**는 적절한 **view**를 선택한다.

**7. DispatcherServlet**에서 **view를** 클라이언트에게 전달한다.

```java
package org.example.mvc;

@WebServlet("/")
public class DispatcherServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException {
        for (ViewResolver viewResolver : this.viewResolvers) {
            View view = viewResolver.resolveViewName(modelAndView.getViewName());
            view.render(modelAndView.getModel(), request, response);
        }
    }
}
```

---

### **Spring Web MVC와 비교**

#### **상속**

| **직접 구현한 DispatcherServlet** | **Spring Web MVC - DispatcherServlet** |
| --- | --- |
| ![본문 이미지](../assets/tistory/00884d54800d1b9a7cf6cf8a.png) | ![본문 이미지](../assets/tistory/785bdac1c5474640c5047c10.png)  ![본문 이미지](../assets/tistory/7b8e5beb332e55639d5ad0a6.png)  ![본문 이미지](../assets/tistory/e70a7d1fb8fc2ac048e94a4e.png) |

> 동일하게 HttpServlet을 상속받고 있다.

#### **HandlerMapping**

| **직접 구현한 DispatcherServlet** | **Spring Web MVC - DispatcherServlet** |
| --- | --- |
| ![본문 이미지](../assets/tistory/da957a66f72c746eea4654e2.png) | ![본문 이미지](../assets/tistory/5afa0301ecbbb86732d974e3.png)  ![본문 이미지](../assets/tistory/d2da3a93a1fd495b7b6727f4.png) |

#### **HandlerAdapter**

| **직접 구현한 DispatcherServlet** | **Spring Web MVC - DispatcherServlet** |
| --- | --- |
| ![본문 이미지](../assets/tistory/ab4eb12722b7cead14df2704.png) | ![본문 이미지](../assets/tistory/afecf3f3b399ec8a8b640fc1.png)     ![본문 이미지](../assets/tistory/a6cc6a2076dcfcda9d331caf.png) |
| ![본문 이미지](../assets/tistory/b1355a0188dbb364ee60bfd7.png)   ![본문 이미지](../assets/tistory/1948ba70f3bd1de154909b0c.png) | ![본문 이미지](../assets/tistory/778d02040648c4b160539a85.png)   ![본문 이미지](../assets/tistory/57a6d641b979fcf2d4233935.png) |

#### **View Resolver**

| **직접 구현한 DispatcherServlet** | **Spring Web MVC - DispatcherServlet** |
| --- | --- |
| ![본문 이미지](../assets/tistory/81ffa5504e225d39063fb041.png) | ![본문 이미지](../assets/tistory/741781510ad86db4f8b0c6f1.png)   ![본문 이미지](../assets/tistory/aa790aee18bd97c8abfa8bcc.png)    ![본문 이미지](../assets/tistory/8a689eae6ac5a3366644894f.png)   ![본문 이미지](../assets/tistory/2692a32a48a535a983fdd422.png) |
| ![본문 이미지](../assets/tistory/19803fc303c4c77d9d8d322f.png) | ![본문 이미지](../assets/tistory/de7e9d06f898f80ed985cc99.png) |

> Spring을 공부하면서  
> 사용자의 측면에서 사용하기만 하다가  
> 직접 간단하게 구현하였는데  
> 아주 귀중한 경험인 것 같다.  
>   
> Spring MVC 프레임워크를 공부는 하였지만  
> 내부적으로 어떻게 구현되어있는지에  
> 대해서는 훑고 지나갔었는데  
> 이를 통해 한 발 더 성장할 수 있게 되었다.
