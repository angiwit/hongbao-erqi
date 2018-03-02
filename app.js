//app.js
var loginInfo={};
App({
  setConfig: { url: 'https://www.ipetsfamily.com/' },
  onLaunch: function () {
    this.setCanvasData();
    this.userLogin();
  },
  globalData: {
    userInfo: null,
    token:'',
    timer: null,
    canvasWidth: null,
    canvasHeight: null
  },
  setCanvasData: function(){
    try {
        var res = wx.getSystemInfoSync()
        this.setData({ 
          canvasWidth: res.windowWidth, 
          canvasHeight: res.windowHeight*0.6})
          
    } catch (e) {
      console.log("error")
    }
  },
  //登录
  userLogin: function(){
    var that = this;
    var codes;
    //获取登录code
    wx.login({
      success: function (res) {
        //console.log(res.code);
        if (res.code) {
          loginInfo.code = res.code;
          codes = res.code;
          //获取用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    // 可以将 res 发送给后台解码出 unionId
                    var infoUser = '';
                    that.globalData.userInfo = infoUser = res.userInfo;
                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    if (that.userInfoReadyCallback) {
                      that.userInfoReadyCallback(res)
                    }
                    //用户信息入库
                    var url = that.setConfig.url + '/index.php/User/login/dologin';
                    var data = {
                      user_name: infoUser.nickName,
                      nick_name: infoUser.nickName,
                      head_img: infoUser.avatarUrl,
                      sex: infoUser.gender,
                      coutry: infoUser.country,
                      city: infoUser.city,
                      province: infoUser.province,
                      code: codes,
                    }
                    that.postLogin(url, data);
                  }
                })
              }else{
                wx.authorize({
                  scope: 'scope.userInfo',
                  success: res => {
                    console.log("开始用户授权操作")
                    //用户已经同意小程序授权
                    console.log("进入else逻辑")
                    wx.getUserInfo({
                      success: res => {
                        // 可以将 res 发送给后台解码出 unionId
                        console.log("获取到用户信息")
                        var infoUser = '';
                        that.globalData.userInfo = infoUser = res.userInfo;
                        // 所以此处加入 callback 以防止这种情况
                        if (that.userInfoReadyCallback) {
                          that.userInfoReadyCallback(res)
                        }
                        //用户信息入库
                        var url = that.setConfig.url + '/index.php/User/login/dologin';
                        var data = {
                          user_name: infoUser.nickName,
                          nick_name: infoUser.nickName,
                          head_img: infoUser.avatarUrl,
                          sex: infoUser.gender,
                          coutry: infoUser.country,
                          city: infoUser.city,
                          province: infoUser.province,
                          code: codes,
                        }
                        that.postLogin(url, data);
                      }
                    })
                  }
                })
              }
            }
          });
        } else {
          that.userLogin();
          return false;
        }
      }
    })
  },
  //提交
  postLogin: function (url,data,callback=function(){}){
    var that = this;
    console.log("请求接口：", url)
    //发起网络请求
    wx.request({
      url: url,
      data: data, 
      method:'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success:function(res){
        if(res.data.code!=20000){
          wx.showToast({
            title: res.data.msg || res.data,
            icon: 'loading',
            mask: true,
            duration: 1500
          })
          if (res.data.code == 40500) { callback(res);}
          return false;
        }
        if (res.data.token){that.globalData.token = res.data.token;}
        console.log(that.globalData)
        callback(res);
      }
    })
  }
})
