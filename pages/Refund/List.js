//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        // tab切换
        refundList:[],
    },
    onLoad: function (option) {
        this.init();
    },
    
    init:function(){
		var that = this;
		app.getLogin(function () {
			that.getRefundList();
		});
    },

    getRefundList: function () {
      var that = this;
      wx.request({
          url: app.globalData.apiDomain + '/OrderRefund/getList',
        data: {
          user_key: app.globalData.user_key,
          supplier_key: app.globalData.supplier_key
        },
        method: 'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          var data = res.data;
          if (data.status == 0) {
            that.setData({
                refundList: data.info
            })
          }  
        }
      })
    }
})
