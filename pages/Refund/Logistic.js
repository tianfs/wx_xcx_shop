var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    refund_id: 0,
    refund_info: [],
    logistic_name: '',
    logistic_number: ''
  },
  input_logistic_name: function (event) {
      this.setData({
          logistic_name: event.detail.value
      })
  },
  input_logistic_number: function (event) {
      this.setData({
          logistic_number: event.detail.value
      })
  },
  onLoad: function(options) {
	  this.setData({
		  refund_id: options.refund_id
	  })
      this.init();
  },
  init:function(){
	  var that = this;
	  app.getLogin(function () {
		  that.getRefundInfo();
	  });
  },
  getRefundInfo: function () {
      var that = this;
      app.getLogin(function () {
          wx.request({
              url: app.globalData.apiDomain + '/OrderRefund/getRefundInfo',
              data: {
                  user_key: app.globalData.user_key,
                  supplier_key: app.globalData.supplier_key,
                  refund_id: that.data.refund_id
              },
              method: 'POST',
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              success: function (res) {
                  var data = res.data;
                  if (data.status == 0) {
                      that.setData({
                          refund_info: data.info
                      });
                  }
              }
          })
      });
  },
  //提交
  submit: function() {
    var that = this;
    var refund_id = that.data.refund_id;
    var logistic_name = that.data.logistic_name;
    var logistic_number = that.data.logistic_number;
    if (logistic_name == '') {
        wx.showModal({
            content: '请输入物流公司',
            showCancel: false
        });
        return false;
    }
    if (logistic_number == '') {
        wx.showModal({
            content: '请输入物流单号',
            showCancel: false
        });
        return false;
    }
    app.getLogin(function () {
        wx.request({
            url: app.globalData.apiDomain + '/OrderRefund/fillLogistic',
            //url: 'http://127.0.0.1/chartShop/Api/OrderRefund/fillLogistic/',
            data: {
                user_key: app.globalData.user_key,
                supplier_key: app.globalData.supplier_key,
                refund_id: refund_id,
                logistic_name: logistic_name,
                logistic_number: logistic_number
            },
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                var data = res.data;
                if (data.status == 0) {
                    wx.redirectTo({
                        url: '../Refund/Details?refund_id=' + refund_id
                    });
                } else {
                    wx.showModal({
                        content: data.info,
                        showCancel: false
                    });
                }
            }
        })
    });
  }
})