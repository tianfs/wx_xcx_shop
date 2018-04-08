// pages/PersonalCenter/PersonalCenter.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_info:{
        nickname:'用户名',
        avatar_url: '/images/center_tx.png',
    },
    stateCount:{
        no_pay_count: 0,
        no_send_count: 0,
        no_get_count: 0,
        return_count: 0
    },
    is_customer:2
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
  },
  onShow: function () {
	  this.init();
  },
  init:function(){
	  var that = this;
	  app.getLogin(function () {
		if (app.globalData.user_info.nickname) {
			that.setData({
				user_info: app.globalData.user_info
			})
		}
		that.setData({
			is_customer: app.globalData.supplier_info.is_customer
		})
     	that.getStateCount();
	  })
  },
  
  //获取订单状态数量
  getStateCount:function(){
      var that = this;
      wx.request({
          url: app.globalData.apiDomain + '/Order/getStateCount',
          data: {
              user_key: app.globalData.user_key,
              supplier_key: app.globalData.supplier_key,
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
              var data = res.data;
              that.setData({
                  stateCount: data.info
              })
          }
      })
  }
})