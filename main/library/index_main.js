const Body = document.querySelector("body");

const SETTING = {
  RootPath: "",
  Server: "https://skaai-api.mocuse.com",
  Application: {
    version: "1.0",
  },
  Route: {
    general: {
      "/": {
        path: "general/index.html",
        template: {
          script: "general/js/index.html",
          structure_script: "general/js/structure.html",
        },
      },
      "/exercises": {
        path: "general/exercises.html",
        template: {
          script: "general/js/exercises.html",
          structure_script: "general/js/structure.html",
        },
      },
      "/exercise-tutorial": {
        path: "general/exercise-tutorial.html",
        template: {
          exhead: "general/exercise-head.html",
          structure_script: "general/js/structure.html",
        },
      },
      "/exercise-trainning": {
        path: "general/exercise-trainning.html",
        template: {
          exhead: "general/exercise-head.html",
          structure_script: "general/js/structure.html",
        },
      },
      "/exercise-scored": {
        path: "general/exercise-scored.html",
        template: {
          script: "general/js/exercise-scored.html",
          exhead: "general/exercise-head.html",
          structure_script: "general/js/structure.html",
        },
      },
      "/setting": {
        path: "general/setting.html",
        template: {
          script: "general/js/setting.html",
          structure_script: "general/js/structure.html",
        },
      },
      "/logout": {
        path: "general/logout.html",
        template: {
          script: "general/js/logout.html",
          structure_script: "general/js/structure.html",
        },
      },
      "/contact": {
        path: "general/contact.html",
        template: {
          script: "general/js/contact.html",
          structure_script: "general/js/structure.html",
        },
      },
      404: {
        path: "general/404.html",
        template: {},
      },
    },
    unknown: {
      "/": {
        path: "general/index.html",
        template: {
          script: "general/js/index.html",
          structure_script: "unknown/js/structure.html",
        },
      },
      "/login": {
        path: "unknown/login.html",
        template: {
          script: "unknown/js/login.html",
          structure_script: "unknown/js/structure.html",
        },
      },
      "/google-oauth": {
        path: "unknown/google-oauth.html",
        template: {
          script: "unknown/js/google-oauth.html",
          structure_script: "unknown/js/structure.html",
        },
      },
      "/register": {
        path: "unknown/register.html",
        template: {
          structure_script: "unknown/js/structure.html",
        },
      },
      "/exercises": {
        path: "general/exercises.html",
        template: {
          structure_script: "unknown/js/structure.html",
        },
      },
      "/exercise-tutorial": {
        path: "general/exercise-tutorial.html",
        template: {
          exhead: "unknown/exercise-head.html",
          structure_script: "unknown/js/structure.html",
        },
      },
      "/exercise-trainning": {
        path: "general/exercise-trainning.html",
        template: {
          structure_script: "unknown/js/structure.html",
          exhead: "unknown/exercise-head.html",
        },
      },
      "/contact": {
        path: "general/contact.html",
        template: {
          structure_script: "unknown/js/structure.html",
        },
      },
      "/reset-password": {
        path: "unknown/reset-password.html",
        template: {
          structure_script: "unknown/js/structure.html",
        },
      },
      "/new-password": {
        path: "unknown/new-password.html",
        template: {
          structure_script: "unknown/js/structure.html",
        },
      },
      404: {
        path: "general/404.html",
        template: {},
      },
    }
  },
  DefaultElement: {
    general: {
      structure: "general/structure.html",
      template: {
        navbar: "general/navbar.html",
        footer: "general/footer.html",
      },
    },
    unknown: {
      structure: "unknown/structure.html",
      template: {
        navbar: "unknown/navbar.html",
        footer: "unknown/footer.html",
      },
    },
  },
  LocalStorage: {
    Login: {
      email: "signin-email",
      password: "signin-password",
      code: "signin-code",
      token: "signin-token",
    },
    Display: {
      theme: "display-theme",
      font: "display-font",
      language: "display-lang",
    },
  },
};

const Route = {
  goto: async (page_path, params = null) => {
    {
      if (page_path === 404) {
        page = 404;
      } else {
        page = page_path.replace("//", "/");
      }

      Root = document.querySelector("root");
      Root.classList.add("changing");
      role = await Security.OAuth.getRole();

      if (RouteList[role][page] === undefined) {
        console.error("Page Not Found: " + page);
        Route.goto(404);
        return;
      }

      var queryString = "";

      if (page_path !== 404) {
        if (params != null) {
          const searchParams = new URLSearchParams(params);
          queryString = "?" + searchParams.toString();
        }

        window.history.pushState(
          {},
          SETTING.RootPath + page,
          window.location.origin + SETTING.RootPath + page + queryString
        );
      }

      fetch(SETTING.RootPath + "/page/" + RouteList[role][page].path)
        .then((res) => {
          if (res.ok) return res.text();

          throw new Error("File Not Found: " + RouteList[role][page].path);
        })
        .then(async (data) => {
          for (let [passkey, file] of Object.entries(
            RouteList[role][page].template
          )) {
            if (!data.includes("{{" + passkey + "}}")) continue;

            let template_code = await fetch(
              SETTING.RootPath + "/template/" + file
            )
              .then((res2) => {
                if (res2.ok) return res2.text();

                throw new Error("Template Not Found: " + SETTING.RootPath + "/template/" + file);
              })
              .then((data2) => {
                return data2;
              })
              .catch((err2) => {
                console.error(err2);
              });

            data = data.replace(
              new RegExp("{{" + passkey + "}}", "g"),
              template_code
            );
          }

          Root.innerHTML = data;

          let var_script = "nav script, footer script";

          let scripts_base = document.querySelectorAll(var_script);
          for (let i = 0; i < scripts_base.length; i++) {
            if (scripts_base[i].innerText) {
              eval(scripts_base[i].innerText);
            } else {
              fetch(scripts_base[i].src).then(function (data) {
                data.text().then(function (r) {
                  eval(r);
                });
              });
            }
            scripts_base[i].parentNode.removeChild(scripts_base[i]);
          }

          let scripts = document.querySelectorAll("root script");
          for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].innerText) {
              eval(scripts[i].innerText);
            } else {
              fetch(scripts[i].src).then(function (data) {
                data.text().then(function (r) {
                  eval(r);
                });
              });
            }
            scripts[i].parentNode.removeChild(scripts[i]);
          }
        })
        .catch((err) => {
          console.error(err);
        });

      Root.classList.remove("changing");
    }
  },
  init: async () => {
    role = await Security.OAuth.getRole();

    fetch(
      SETTING.RootPath + "/template/" + SETTING.DefaultElement[role].structure
    )
      .then((res) => {
        if (res.ok) return res.text();

        throw new Error(
          "Structure Template Not Found: " +
          SETTING.DefaultElement[role].structure
        );
      })
      .then(async (data) => {
        for (let [passkey, file] of Object.entries(
          SETTING.DefaultElement[role].template
        )) {
          if (!data.includes("{{" + passkey + "}}")) continue;

          let template_code = await fetch(
            SETTING.RootPath + "/template/" + file
          )
            .then((res2) => {
              if (res2.ok) return res2.text();

              throw new Error("Template Not Found: " + file);
            })
            .then((data2) => {
              return data2;
            })
            .catch((err2) => {
              console.error(err2);
            });

          data = data.replace(
            new RegExp("{{" + passkey + "}}", "g"),
            template_code
          );
        }

        
        Body.innerHTML = Body.innerHTML + data;

        setTimeout(() => {
          document.querySelector(".load-section").classList.add("out");

          setTimeout(() => {
            document.querySelector(".load-section").remove();
          }, 200);
        }, 500);
        
      })
      .catch((err) => {
        console.error(err);
      });
  },
  get_path: () => {
    return window.location.pathname.replace(SETTING.RootPath, "");
  },
};

const Security = {
  OAuth: {
    getRole: async () => {
      return await Security.OAuth.getInfo().then((info) => {
        if (!info.success) return RoleList.unknown;

        return Object.values(RoleList)[info.role];
      });
    },
    getInfo: async () => {
      let token = window.localStorage.getItem(SETTING.LocalStorage.Login.token);

      if (token) {
        return await fetch(SETTING.Server + "/oauth/google", {
          method: "POST",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
          },
          body: API.postBody({
            token: token,
          }),
        })
          .then((res) => {
            if (res.status === 500) throw new Error("Internal Server Error");

            return res.json();
          })
          .then((info) => {
            if (info.data.success) return info.data;
            return { success: false };
          })
          .catch((err) => {
            console.error(err);
            Security.OAuth.clearToken();
            return { success: false };
          });
      }

      let code = window.localStorage.getItem(SETTING.LocalStorage.Login.code);

      if (code) {
        return await fetch(SETTING.Server + "/oauth/google-code", {
          method: "POST",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
          },
          body: API.postBody({
            code: code,
          }),
        })
          .then((res) => {
            if (res.status === 500) throw new Error("Internal Server Error");

            return res.json();
          })
          .then((info) => {
            if (info.data.success) return info.data;
            return { success: false };
          })
          .catch((err) => {
            console.error(err);
            Security.OAuth.clearCode();
            return { success: false };
          });
      }

      let email = window.localStorage.getItem(SETTING.LocalStorage.Login.email);
      let password = window.localStorage.getItem(
        SETTING.LocalStorage.Login.password
      );

      if (!email || !password) return { success: false };

      return await fetch(SETTING.Server + "/oauth", {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        body: API.postBody({
          email: email,
          password: password,
        }),
      })
        .then((res) => {
          if (res.status === 500) throw new Error("Internal Server Error");

          return res.json();
        })
        .then((info) => {
          if (info.data.success) return info.data;
          return { success: false };
        })
        .catch((err) => {
          console.error(err);
          Security.OAuth.clearInfo();
          return { success: false };
        });
    },
    setInfo: (email, password) => {
      window.localStorage.setItem(SETTING.LocalStorage.Login.email, email);
      window.localStorage.setItem(
        SETTING.LocalStorage.Login.password,
        password
      );
    },
    clearInfo: () => {
      window.localStorage.removeItem(SETTING.LocalStorage.Login.email);
      window.localStorage.removeItem(SETTING.LocalStorage.Login.password);
    },
    setCode: (token) => {
      window.localStorage.setItem(SETTING.LocalStorage.Login.code, token);
    },
    clearCode: () => {
      window.localStorage.removeItem(SETTING.LocalStorage.Login.code);
    },
    setToken: (token) => {
      window.localStorage.setItem(SETTING.LocalStorage.Login.token, token);
    },
    clearToken: () => {
      window.localStorage.removeItem(SETTING.LocalStorage.Login.token);
    },
  },
};

const API = {
  postBody: (data) => {
    return JSON.stringify({
      version: SETTING.Application.version,
      data: data,
    });
  },
};

const Display = {
  setTheme: (theme) => {
    window.localStorage.setItem(SETTING.LocalStorage.Display.theme, theme);
    document.querySelector("html").setAttribute("theme", theme);
  },
};

const RouteList = SETTING.Route;
const TemplateList = SETTING.Template;
const RoleList = {
  unknown: "unknown",
  general: "general",
  admin: "admin",
};
const ThemeList = {
  light: "light",
  dark: "dark",
};

// Load Index Page
Route.init().then((_) => {
  new Promise((resolve) => {
    if (document.querySelector("root")) {
      return resolve("");
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector("root")) {
        resolve(document.querySelector("root"));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  }).then((_) => {
    let url = new URL(window.location.href);
    let searchParams = new URLSearchParams(url.search);
    let paramsObject = {};
    searchParams.forEach((value, key) => {
      paramsObject[key] = value;
    });

    if (Object.keys(paramsObject).length === 0) {
      paramsObject = null;
    }

    let theme_config = window.localStorage.getItem(
      SETTING.LocalStorage.Display.theme
    );
    if (theme_config) {
      document.querySelector("html").setAttribute("theme", theme_config);
    }

    Route.goto(
      window.location.pathname.replace(SETTING.RootPath, ""),
      paramsObject
    );
  });
});
