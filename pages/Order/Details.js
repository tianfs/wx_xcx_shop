// pages/OrderDetails/OrderDetails.js
var app = getApp();
var intervalObj=null;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        orderId:'',
        orderInfo:{},
        orderGoods:[],
        supplierInfo:{},
        block:'',

    },
    onLoad: function (options) {
        var that = this;
         // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            orderId: options.order_id ? options.order_id : ''
        })
    },
    onShow:function(){
        this.init();
    },
    init:function(){
		var that = this;
		app.getLogin(function () {
			that.setData({
				supplierInfo: app.globalData.supplier_info
			})
			that.getOrderDetail();
		});
    },
    /**
     * 调用订单详情接口数据
     */
    getOrderDetail: function () {
        var that = this;
        var orderId = that.data.orderId;
        var user_key = app.globalData.user_key;
        var supplier_key = app.globalData.supplier_key;
        if (! orderId){
            return false;  
        }        
        wx.request({
            url: app.globalData.apiDomain + '/Order/getOrderDetail',
            data: {
                user_key: user_key,
                supplier_key: supplier_key,           
                order_id: orderId
            },
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                var data = res.data;
                if(data.status==0){
                    that.setData({
                        orderInfo: data.info.order_info,
                        orderGoods: data.info.order_goods
                    })
                    //判断显示取消倒计时
                    if (that.data.orderInfo.order_state == 1) {
                        that.setTimeBlock();       
                    }
                                        
                }                           
            }
        })
    },
    setTimeBlock:function(){        
        var that = this;
        //获取当前时间  
        var date = new Date();
        var now = date.getTime();
        //设置截止时间  
        var end = that.data.orderInfo.pay_end_time * 1000
        var leftTime=  end - now
		intervalObj =setInterval(function () {
            leftTime-=1000;            
            if (leftTime >= 0) {
                var m = Math.floor(leftTime / 1000 / 60 % 60);
                var s = Math.floor(leftTime / 1000 % 60);
                var text = '剩' + m + '分' + s + '秒' + '自动关闭';
                that.setData({
                    block: text
                })
            }
        }, 1000);         
    },
   //取消订单
    cancelOrder:function(){
        var that = this;
        var orderId = that.data.orderId;
        if (!orderId) {
            return false;
        }
        app.cancelOrder( orderId,function(result){
            if (result.status == 0) {
                wx.showToast({
                    title: '取消成功',
                    success: function () {
						clearInterval(intervalObj);
						that.setData({
							block: ''
						})
                        that.init();
                    }
                })

            }
        })
        
    },
    //删除订单
    delOrder: function () {
        var that = this;
        var orderId = that.data.orderId;
        if (!orderId) {
            return false;
        }
        app.delOrder(orderId, function (result) {
            if (result.status == 0) {
                wx.showToast({
                    title: '删除成功',
                    success: function () {
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                })

            }
        })
    },
    //支付订单
    payOrder: function () {
        var that = this;
        var orderId = this.data.orderId;
        app.pay(orderId, function (res,msg){
            if (res=='success') {
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
                    showCancel:false
                })
            }
        });
    },
    //确认收货
    confirmGoods:function(){
        var that = this;
        var orderId = that.data.orderId;
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