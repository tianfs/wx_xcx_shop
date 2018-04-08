//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        /**
            * 页面配置
            */
        winWidth: 0,
        winHeight: 0,
        // tab切换
        orderList:[],
        order_state:''
    },
    onLoad: function (option) {
        var that = this;
        this.setData({
          order_state: option.order_state ? option.order_state:'',
        })
    },
	onShow:function(){
		this.init();
	},
    init:function(){
		var that = this;
		app.getLogin(function () {
			that.getOrderList();
		});
        
    },
    /**
     * 点击tab切换
     */
    swichNav: function (e) {
        var that = this;
        if (this.data.order_state === e.target.dataset.order_state) {
            return false;
        } else {
            that.setData({
                order_state: e.target.dataset.order_state
            })
            that.getOrderList();
        }
    },

    getOrderList: function () {
      var that = this;
      wx.request({
        url: app.globalData.apiDomain + '/Order/getOrderList',
        data: {
          user_key: app.globalData.user_key,
          supplier_key: app.globalData.supplier_key,
          order_state: that.data.order_state
        },
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          var data = res.data;
          if (data.status == 0) {
            that.setData({
              orderList: data.info
            })
          }  
        }
      })
    },
    //取消订单
    cancelOrder:function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.order_id;
        if (!orderId) {
            return false;
        }
        app.cancelOrder(orderId, function (result) {
            if (result.status == 0) {
                wx.showToast({
                    title: '取消成功',
                    success: function () {
                        that.init();
                    }
                })

            }
        })

    },
    //删除订单
    delOrder: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.order_id;
        if (!orderId) {
            return false;
        }
        app.delOrder(orderId, function (result) {
            if (result.status == 0) {
                wx.showToast({
                    title: '删除成功',
                    success: function () {
                        that.init();
                    }
                })

            }
        })
    },
    //支付订单
    payOrder: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.order_id;
        app.pay(orderId, function (res, msg) {
            if (res == 'success') {
                wx.showToast({
                    title: '支付成功',
                    success: function () {
                        that.init();
                    }
                })
            }
            if (res == 'fail') {
                wx.showModal({
                    title: '温馨提示',
                    content: msg,
                    showCancel: false
                })
            }
        });
    },
    //确认收货
    confirmGoods:function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.order_id;
        if (!orderId) {
            return false;
        }
        app.confirmGoods(orderId, function (result) {
            if (result.status == 0) {
                wx.showToast({
                    title: '操作成功',
                    success: function () {
                        that.init();
                    }
                })

            }
        })
    }
})
