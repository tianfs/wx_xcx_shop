// pages/RefundDetails/RefundDetails.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info:{},
        refund_id:''
    },

  /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
        this.setData({
            refund_id: options.refund_id
        })
		this.init();
    },
    init:function(){
		var that = this;
		app.getLogin(function () {
			that.getRefundInfo();
		})
    },
    getRefundInfo:function(){
        var refund_id = this.data.refund_id;
        if (!refund_id) {
            return false;
        }
        var that = this;
        wx.request({
            url: app.globalData.apiDomain + '/OrderRefund/getRefundInfo',
            data: {
                user_key: app.globalData.user_key,
                supplier_key: app.globalData.supplier_key,
                refund_id: refund_id
            },
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                var data = res.data;
                if (data.status == 0) {
                    that.setData({
                        info: data.info
                    })
                }
            }
        })
    },
    //取消退款
    cancelRefund: function() {
        var refund_id = this.data.refund_id;
        if (!refund_id) {
            return false;
        }
        var that = this;
        wx.request({
            url: app.globalData.apiDomain + '/OrderRefund/cancelRefund',
            data: {
                user_key: app.globalData.user_key,
                supplier_key: app.globalData.supplier_key,
                refund_id: refund_id
            },
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                var data = res.data;
                if (data.status == 0) {
                    wx.showModal({
                        content: '撤销成功',
                        showCancel: false,
                        success: function (res) {
                            wx.redirectTo({
                                url: '../Order/Details?order_id=' + that.data.info.order_id
                            });
                        }
                    });
                } else {
                    wx.showModal({
                        content: data.info,
                        showCancel: false
                    });
                }
            }
        })
    },
    //再次申请
    applyRefund:  function(){
        wx.redirectTo({
            url: '../Refund/Apply?order_goods_id=' + this.data.info.order_goods_id
        });
    },
    //退货
    refundLogistic: function(){
        wx.redirectTo({
            url: '../Refund/Logistic?refund_id=' + this.data.refund_id
        });
    }
})