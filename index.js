const Koa = require("koa");
const router = require("koa-router")();
const staticFiles = require("koa-static");
const path = require("path");
const views = require("koa-views");
const axios= require("axios");
const qs = require("qs");

const app = new Koa();
app.use(staticFiles(path.resolve(__dirname, "./public")));
app.use(views("views", { map: { html: "ejs" } }));


let user = {};

/**模版路由处理 */
router.get("/login", async (ctx) => {
  await ctx.render("login");
});

/**处理首页模版 */
router.get("/home", async (ctx) => {
  await ctx.render("home", { user });
});

/** 拦截前端的a标签默认跳转, 使用github账号进行登陆 */
router.get("/loginByGithub", async (ctx) => {
  const clientId = "e332e862b9e85966a0bf"; // github上注册的client_id
  const url = "https://github.com/login/oauth/authorize"; // 获取授权玛地址
  const path = `${url}?client_id=${clientId}`;
  ctx.redirect(path);
});

/**创建一个授权吗的地址路由 */
router.get("/callback/github", async (ctx) => {
  const { code } = ctx.query;
  console.log("code: ", code);

  /** 准备请求令牌 */
  const accessToken = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: "e332e862b9e85966a0bf",
      client_secret: "342105abf00f5e299bb5eeebbcae888c69144f05",
      code,
    }
  );
  const { access_token } = qs.parse(accessToken.data);
  console.log("access_token: ", access_token);

  /** 通过令牌获取用户信息 */
  const userInfo = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  console.log("userInfo: ", userInfo.data);
  user = userInfo.data;

  ctx.redirect('/home');

});

app.use(router.routes());
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
