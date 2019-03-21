//app.js test
App({
    globalData:{
        openAuthCache:true,
        scene: null,
        user_info: null,
        supplier_info:null,
        user_key: null,
        apiDomain: 'https://tshop.socialjia.com/Api',
        //apiDomain: 'https://127.0.0.1/adsit/chartShop/Api',
		supplier_key: 'shop_003',//换成自己商铺的
        df_addr_id: ''
    },
  onLaunch: function (result) {
    this.globalData.scene = result.scene;
  },
  getLogin:function(cb){
      var that = this
      var timestamp = new Date().getTime();
      if (wx.getStorageSync('expires_time') >= timestamp){
          that.globalData.user_key = wx.getStorageSync('user_key');
          that.globalData.user_info = wx.getStorageSync('user_info');
          that.globalData.supplier_info = wx.getStorageSync('supplier_info');
          typeof cb == "function" && cb();
          return true;
      }
    //调用登录接口
    wx.login({
        success: function (res) {
            var js_code = res.code;
            wx.getUserInfo({
                complete: function (res) {
					console.log(res); 
                    var data = {
                        js_code: js_code,
                        supplier_key: that.globalData.supplier_key
                    };
                    if (res.errMsg == 'getUserInfo:ok') {
                        data.encryptedData= res.encryptedData;
                        data.iv = res.iv;
                    }
                    wx.request({
                        url: that.globalData.apiDomain + '/Auth/onLogin',
                        data: data,
                        method: 'POST', 
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        success: function (res) {
                            var data = res.data;
                            if (data.status == 0) {
                                var timestamp = new Date().getTime();
                                var expires_time = timestamp + data.info.expires_in*1000;
                                wx.setStorageSync('expires_time', expires_time);
                                wx.setStorageSync('user_key', data.info.user_key);
                                that.globalData.user_key = data.info.user_key;
                                wx.setStorageSync('user_info', data.info.user_info);
                                that.globalData.user_info = data.info.user_info;
                                wx.setStorageSync('supplier_info', data.info.supplier_info);
                                that.globalData.supplier_info = data.info.supplier_info;
                                typeof cb == "function" && cb()
                            }
                        }
                    })
                }
            })
            return false;   
        }
    })
  },
  //支付
 pay: function (order_id, callback) { 
     var that = this;
     var url = this.globalData.apiDomain + '/Pay/pay/';
        wx.request({
            url: url,
            data: {
                user_key: that.globalData.user_key,
                supplier_key: that.globalData.supplier_key,
                order_id: order_id
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: function (res) {
                var data = res.data;
                if (data.status !=0) {
                    typeof callback == "function" && callback('fail', data.info);
                    return false;
                }
                wx.requestPayment({
                    'timeStamp': data.info.timeStamp,
                    'nonceStr': data.info.nonceStr,
                    'package': data.info.package,
                    'signType': data.info.signType,
                    'paySign': data.info.paySign,
                    //bug: 6.5.2 及之前版本中，用户取消支付不会触发 fail 回调，只会触发 complete 回调，回调 errMsg 为 'requestPayment:cancel'
                   /*'success': function (res) {
                        typeof callback == "function" && callback('success', '支付成功');
                        return false;
                    },
                    'fail': function (res) {
                        if (res.errMsg == "requestPayment:fail cancel"  || res.errMsg == "requestPayment:cancel") {
                            typeof callback == "function" && callback('cancel', '支付取消');
                        } else {
                            typeof callback == "function" && callback('fail', '支付失败');
                        }
                        return false;
                    },*/
                    //暂时统一使用complete进行处理
                    'complete': function (res){
                        if (res.errMsg == "requestPayment:ok") {
                            typeof callback == "function" && callback('success', '支付成功');
                        } else if (res.errMsg == "requestPayment:fail cancel" || res.errMsg == "requestPayment:cancel") {
                            typeof callback == "function" && callback('cancel', '支付取消');
                        } else {
                            typeof callback == "function" && callback('fail', '支付失败,' + res.errMsg);
                        }
                        return false;
                    }
                });
               
            }
        })

    },
 //添加购物车
 addCart: function (params, callback) {
     var url = this.globalData.apiDomain + '/Cart/addCart/';
     wx.request({
         url: url,
         data: {
             user_key: params.user_key,
             supplier_key: params.supplier_key,
             goods_id: params.goods_id,
             goods_sub_id: params.goods_sub_id,
             buy_number: params.goods_num
         },
         header: {
             'Content-Type': 'application/x-www-form-urlencoded'
         },
         method: 'POST',
         success: function (res) {
             var data = res.data;
             typeof callback == "function" && callback(data);
         }
     })
 },
    //取消订单
    cancelOrder:function(orderId, callback) {
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '您确认要取消订单么？',
            success: function (res) {
                if (res.confirm) {
                    wx.request({
                        url: that.globalData.apiDomain + '/Order/cancelOrder',
                        data: {
                            user_key: that.globalData.user_key,
                            supplier_key: that.globalData.supplier_key,
                            order_id: orderId
                        },
                        method: 'POST',
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        success: function (res) {
                            typeof callback == "function" && callback(res.data);
                        }
                    })
                }
            }
        })
        
    },
    //删除订单
    delOrder: function (orderId, callback) {
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '删除后不可恢复，您确认删除吗？',
            success: function (res) {
                if (res.confirm) {
                    wx.request({
                        url: that.globalData.apiDomain + '/Order/delOrder',
                        data: {
                            user_key: that.globalData.user_key,
                            supplier_key: that.globalData.supplier_key,
                            order_id: orderId
                        },
                        method: 'POST',
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        success: function (res) {
                            typeof callback == "function" && callback(res.data);
                        }
                    })
                }
            }
        })
       
    },
    //确认收货
    confirmGoods: function (orderId, callback) {
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '您确认已经收到货物？',
            success: function (res) {
                if (res.confirm) {
                    wx.request({
                        url: that.globalData.apiDomain + '/Order/confirmGoods',
                        data: {
                            user_key: that.globalData.user_key,
                            supplier_key: that.globalData.supplier_key,
                            order_id: orderId
                        },
                        method: 'POST',
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        success: function (res) {
                            typeof callback == "function" && callback(res.data);
                        }
                    })
                }
            }
        })
    }
})
